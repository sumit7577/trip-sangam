import hashlib
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from wagtail.models import Page

from accounts.models import Profile
from cms.models import PackagePage

from . import payments, services
from .models import Booking, Departure, Payment

User = get_user_model()


def make_package(slug="trip", **kw):
    root = Page.objects.get(depth=1)
    defaults = dict(
        title=kw.pop("title", f"Trip {slug}"),
        slug=slug, location="Nepal", category="Spiritual", difficulty="Easy",
        duration_days=3, group_size="6-18", price_inr=10000, original_price_inr=12000,
        best_season="Spring", short_description="x",
        min_group=6, max_group=18, max_groups_per_date=2, deposit_pct=50,
        cutoff_days=14, schedule_weeks_ahead=12,
    )
    defaults.update(kw)
    pkg = PackagePage(**defaults)
    root.add_child(instance=pkg)
    return pkg


def make_departure(package, days_ahead=30, label="A", confirmed=0, held=0,
                   status=Departure.STATUS_FORMING, max_cap=18, min_cap=6):
    start = timezone.localdate() + timedelta(days=days_ahead)
    return Departure.objects.create(
        package=package, start_date=start, end_date=start + timedelta(days=2),
        group_label=label, min_capacity=min_cap, max_capacity=max_cap,
        seats_confirmed=confirmed, seats_held=held, status=status,
        cutoff_date=start - timedelta(days=14),
    )


def make_user(email="u@x.com", password="StrongPass123", phone="9876543210", name="Asha"):
    u = User.objects.create_user(username=email, email=email, password=password, first_name=name)
    Profile.objects.create(user=u, full_name=name, phone=phone)
    return u


# ---------------------------------------------------------------------------
# Engine (services) — no HTTP
# ---------------------------------------------------------------------------

class BestFitAssignmentTests(TestCase):
    def setUp(self):
        self.pkg = make_package()
        self.date = timezone.localdate() + timedelta(days=30)

    def _book(self, party, **kw):
        return services.create_booking(
            package=self.pkg, party_size=party, lead_name="X", lead_email="x@y.z",
            preferred_date=self.date, **kw,
        )

    def test_picks_fullest_group_that_still_fits(self):
        a = make_departure(self.pkg, label="A", confirmed=4)   # remaining 14
        b = make_departure(self.pkg, label="B", confirmed=10)  # remaining 8
        booking = self._book(5)
        self.assertEqual(booking.departure_id, b.id)
        b.refresh_from_db(); a.refresh_from_db()
        self.assertEqual(b.seats_held, 5)
        self.assertEqual(a.seats_held, 0)

    def test_opens_group_b_when_no_group_fits(self):
        make_departure(self.pkg, label="A", confirmed=16)  # remaining 2
        booking = self._book(5)
        self.assertEqual(booking.departure.group_label, "B")
        self.assertEqual(booking.departure.start_date, self.date)

    def test_seeds_new_date_when_none_exist(self):
        booking = self._book(2)
        self.assertIsNotNone(booking.departure)
        self.assertEqual(booking.departure.group_label, "A")
        self.assertTrue(booking.departure.auto_created)
        self.assertEqual(booking.status, Booking.STATUS_PENDING)

    def test_never_splits_or_oversells_then_waitlists(self):
        self.pkg.max_groups_per_date = 1
        self.pkg.save()
        make_departure(self.pkg, label="A", confirmed=16)
        booking = self._book(5, flexible=False)
        self.assertEqual(booking.status, Booking.STATUS_WAITLISTED)
        self.assertIsNone(booking.departure)

    def test_party_too_large_raises(self):
        with self.assertRaises(services.PartyTooLarge):
            self._book(19)

    def test_fills_exactly_to_max_then_new_group(self):
        # Sub-minimum parties best-fit together and fill a group to its max.
        for _ in range(6):
            self._book(3)
        dep_a = Departure.objects.get(package=self.pkg, start_date=self.date, group_label="A")
        self.assertEqual(dep_a.seats_held, 18)
        self.assertEqual(dep_a.status, Departure.STATUS_FULL)
        b7 = self._book(3)
        self.assertEqual(b7.departure.group_label, "B")

    def test_min_party_gets_its_own_group(self):
        # A half-filled group exists, but a party that already meets the minimum
        # must NOT be merged into it — it forms its own fresh group.
        a = make_departure(self.pkg, label="A", confirmed=4)  # room for 14 more
        booking = self._book(6)
        self.assertNotEqual(booking.departure_id, a.id)
        self.assertEqual(booking.departure.group_label, "B")
        self.assertEqual(booking.departure.seats_held, 6)
        a.refresh_from_db()
        self.assertEqual(a.seats_held, 0)  # existing group left untouched

    def test_two_min_parties_get_separate_groups(self):
        # Each self-sufficient party gets its own group rather than sharing one.
        b1 = self._book(6)
        b2 = self._book(6)
        self.assertNotEqual(b1.departure_id, b2.departure_id)
        self.assertEqual({b1.departure.group_label, b2.departure.group_label}, {"A", "B"})

    def test_min_party_falls_back_to_existing_when_date_capped(self):
        # When the date is already at its parallel-group cap, a minimum party
        # joins an existing open group rather than being waitlisted.
        self.pkg.max_groups_per_date = 1
        self.pkg.save()
        a = make_departure(self.pkg, label="A", confirmed=2)  # room for 16
        booking = self._book(6, flexible=False)
        self.assertEqual(booking.departure_id, a.id)
        self.assertEqual(booking.status, Booking.STATUS_PENDING)


class LifecycleTests(TestCase):
    def setUp(self):
        self.pkg = make_package()
        self.date = timezone.localdate() + timedelta(days=30)

    def _book(self, party=6):
        return services.create_booking(
            package=self.pkg, party_size=party, lead_name="X", lead_email="x@y.z",
            preferred_date=self.date,
        )

    def test_accept_then_confirm_guarantees(self):
        b = self._book(6)
        self.assertEqual(b.status, Booking.STATUS_PENDING)
        services.accept_booking(b)
        b.refresh_from_db()
        self.assertEqual(b.status, Booking.STATUS_ACCEPTED)
        self.assertIsNotNone(b.hold_expires_at)

        services.confirm_booking(b)
        b.refresh_from_db(); dep = b.departure; dep.refresh_from_db()
        self.assertEqual(b.status, Booking.STATUS_CONFIRMED)
        self.assertEqual(dep.seats_confirmed, 6)
        self.assertEqual(dep.seats_held, 0)
        self.assertEqual(dep.status, Departure.STATUS_GUARANTEED)

    def test_decline_releases_seat(self):
        b = self._book(4)
        dep = b.departure
        self.assertEqual(dep.seats_held, 4)
        services.decline_booking(b)
        b.refresh_from_db(); dep.refresh_from_db()
        self.assertEqual(b.status, Booking.STATUS_DECLINED)
        self.assertEqual(dep.seats_held, 0)

    def test_accept_expiry_reverts_to_pending(self):
        b = self._book(6)  # group must be formed before a deposit can be accepted
        services.accept_booking(b)
        reverted = services.expire_holds(now=timezone.now() + timedelta(minutes=45))
        self.assertEqual(reverted, 1)
        b.refresh_from_db()
        self.assertEqual(b.status, Booking.STATUS_PENDING)  # still interested, seat kept
        self.assertEqual(b.departure.seats_held, 6)

    def test_cancel_releases_confirmed(self):
        b = self._book(6)
        services.accept_booking(b)
        services.confirm_booking(b)
        services.cancel_booking(b)
        dep = Departure.objects.get(pk=b.departure_id)
        b.refresh_from_db()
        self.assertEqual(dep.seats_confirmed, 0)
        self.assertEqual(b.status, Booking.STATUS_CANCELLED)


class CalendarTests(TestCase):
    def test_ensure_calendar_seeds_weekday_dates(self):
        pkg = make_package(departure_weekdays="5", schedule_weeks_ahead=4)
        created = services.ensure_calendar(pkg)
        self.assertGreaterEqual(created, 3)
        for dep in Departure.objects.filter(package=pkg):
            self.assertEqual(dep.start_date.weekday(), 5)
        self.assertEqual(services.ensure_calendar(pkg), 0)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_returns_tokens(self):
        res = self.client.post("/api/auth/register/", {
            "email": "new@user.com", "password": "StrongPass123",
            "fullName": "New User", "phone": "9811122233",
        }, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        body = res.json()
        self.assertIn("access", body)
        self.assertEqual(body["user"]["email"], "new@user.com")
        self.assertEqual(body["user"]["phone"], "9811122233")

    def test_login_and_me(self):
        make_user(email="a@b.com", password="StrongPass123", name="Asha")
        res = self.client.post("/api/auth/login/", {"email": "a@b.com", "password": "StrongPass123"}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        token = res.json()["access"]

        me = self.client.get("/api/auth/me/", HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["fullName"], "Asha")

    def test_me_requires_auth(self):
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_login_bad_password(self):
        make_user(email="a@b.com", password="StrongPass123")
        res = self.client.post("/api/auth/login/", {"email": "a@b.com", "password": "wrong"}, format="json")
        self.assertEqual(res.status_code, 401)


# ---------------------------------------------------------------------------
# Booking API (auth + soft book + slot + accept/decline)
# ---------------------------------------------------------------------------

class BookingApiTests(TestCase):
    def setUp(self):
        self.pkg = make_package(slug="ayodhya")
        self.date = timezone.localdate() + timedelta(days=30)
        self.user = make_user(email="asha@x.com", phone="9876543210", name="Asha")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def _book(self, client=None, party=2):
        c = client or self.client
        return c.post("/api/bookings/", {
            "packageSlug": "ayodhya", "partySize": party,
            "preferredStartDate": self.date.isoformat(),
        }, format="json")

    def test_create_requires_auth(self):
        anon = APIClient()
        self.assertEqual(self._book(client=anon).status_code, 401)

    def test_create_soft_books_from_profile(self):
        res = self._book(party=2)
        self.assertEqual(res.status_code, 201, res.content)
        body = res.json()
        self.assertEqual(body["status"], "pending")
        self.assertEqual(body["partySize"], 2)
        self.assertIsNotNone(body["departure"])
        b = Booking.objects.get(id=body["id"])
        self.assertEqual(b.lead_name, "Asha")        # from profile
        self.assertEqual(b.lead_phone, "9876543210")
        self.assertEqual(b.user, self.user)

    def test_my_trips_only_shows_own(self):
        self._book(party=2)
        other = make_user(email="b@x.com", phone="9000000000")
        oc = APIClient(); oc.force_authenticate(other)
        oc.post("/api/bookings/", {"packageSlug": "ayodhya", "partySize": 1,
                                    "preferredStartDate": self.date.isoformat()}, format="json")
        mine = self.client.get("/api/bookings/").json()
        self.assertEqual(len(mine), 1)
        self.assertEqual(mine[0]["partySize"], 2)

    def test_detail_shows_cotravellers_with_masked_phone(self):
        r1 = self._book(party=2)
        other = make_user(email="b@x.com", phone="9123456789", name="Bina")
        oc = APIClient(); oc.force_authenticate(other)
        oc.post("/api/bookings/", {"packageSlug": "ayodhya", "partySize": 1,
                                   "preferredStartDate": self.date.isoformat()}, format="json")

        detail = self.client.get(f"/api/bookings/{r1.json()['id']}/").json()
        mates = detail["coTravellers"]
        self.assertEqual(len(mates), 2)
        by_name = {m["name"]: m for m in mates}
        self.assertEqual(by_name["Asha"]["phone"], "9876••••••")
        self.assertEqual(by_name["Bina"]["phone"], "9123••••••")
        self.assertTrue(by_name["Asha"]["isYou"])
        self.assertFalse(by_name["Bina"]["isYou"])

    def test_accept_then_decline(self):
        bid = self._book(party=6).json()["id"]  # formed group → deposit acceptable
        acc = self.client.post(f"/api/bookings/{bid}/accept/")
        self.assertEqual(acc.status_code, 200, acc.content)
        self.assertEqual(acc.json()["booking"]["status"], "accepted")
        self.assertIsNone(acc.json()["payment"])  # gateway unconfigured in this test

        # can't decline once accepted? decline allows accepted → declined
        dec = self.client.post(f"/api/bookings/{bid}/decline/")
        self.assertEqual(dec.status_code, 200)
        self.assertEqual(dec.json()["status"], "declined")
        self.assertEqual(Departure.objects.get(package=self.pkg, start_date=self.date).seats_held, 0)

    def test_party_too_large_422(self):
        res = self._book(party=25)
        self.assertEqual(res.status_code, 422)
        self.assertEqual(res.json()["code"], "party_too_large")

    def test_cancel_unpaid_booking_releases_seat(self):
        bid = self._book(party=2).json()["id"]
        res = self.client.post(f"/api/bookings/{bid}/cancel/")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.json()["status"], "cancelled")
        self.assertEqual(Departure.objects.get(package=self.pkg, start_date=self.date).seats_held, 0)

    def test_cancel_is_idempotent(self):
        bid = self._book(party=2).json()["id"]
        self.client.post(f"/api/bookings/{bid}/cancel/")
        res = self.client.post(f"/api/bookings/{bid}/cancel/")  # again
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "cancelled")

    def test_cannot_cancel_confirmed_booking(self):
        bid = self._book(party=6).json()["id"]  # formed group → can accept + confirm
        b = Booking.objects.get(id=bid)
        services.accept_booking(b)
        services.confirm_booking(b)
        res = self.client.post(f"/api/bookings/{bid}/cancel/")
        self.assertEqual(res.status_code, 409)
        self.assertEqual(res.json()["code"], "already_confirmed")

    def test_cannot_cancel_someone_elses_booking(self):
        bid = self._book(party=2).json()["id"]
        other = make_user(email="mallory@x.com", phone="9000000001")
        oc = APIClient(); oc.force_authenticate(other)
        res = oc.post(f"/api/bookings/{bid}/cancel/")
        self.assertEqual(res.status_code, 404)  # not in their queryset


# ---------------------------------------------------------------------------
# Payments (PhonePe mocked)
# ---------------------------------------------------------------------------

PHONEPE_TEST_SETTINGS = dict(
    PHONEPE_CLIENT_ID="cid", PHONEPE_CLIENT_SECRET="secret",
    PHONEPE_WEBHOOK_USERNAME="hook", PHONEPE_WEBHOOK_PASSWORD="pw",
    PHONEPE_REDIRECT_BASE="http://frontend/bookings",
)
_FAKE_ORDER = {"orderId": "OID123", "redirectUrl": "https://phonepe/redirect", "state": "PENDING", "raw": {"k": 1}}


def _webhook_auth():
    return hashlib.sha256("hook:pw".encode()).hexdigest()


@override_settings(**PHONEPE_TEST_SETTINGS)
class PaymentFlowTests(TestCase):
    def setUp(self):
        self.pkg = make_package(slug="ayodhya")
        self.date = timezone.localdate() + timedelta(days=30)
        self.user = make_user()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def _accepted(self, party=6):
        b = services.create_booking(
            package=self.pkg, party_size=party, lead_name="A", lead_email="a@b.c",
            preferred_date=self.date, user=self.user,
        )
        services.accept_booking(b)
        b.refresh_from_db()
        return b

    def _post_webhook(self, payment, state):
        payload = {"event": "checkout.order.completed",
                   "payload": {"merchantOrderId": payment.merchant_order_id, "state": state,
                               "amount": payment.amount}}
        return self.client.post("/api/webhooks/phonepe/", payload, format="json",
                                HTTP_AUTHORIZATION=_webhook_auth())

    @patch("scheduling.phonepe.create_order", return_value=_FAKE_ORDER)
    def test_initiate_deposit_creates_pending_payment(self, mock_create):
        b = self._accepted(6)
        p = payments.initiate_payment(b, Payment.KIND_DEPOSIT)
        self.assertEqual(p.status, Payment.STATUS_PENDING)
        self.assertEqual(p.amount, b.deposit_amount * 100)
        mock_create.assert_called_once()

    @patch("scheduling.phonepe.create_order", return_value=_FAKE_ORDER)
    def test_deposit_webhook_confirms_and_is_idempotent(self, _m):
        b = self._accepted(6)
        p = payments.initiate_payment(b, Payment.KIND_DEPOSIT)
        self.assertEqual(self._post_webhook(p, "COMPLETED").status_code, 200)

        b.refresh_from_db(); dep = b.departure; dep.refresh_from_db(); p.refresh_from_db()
        self.assertEqual(p.status, Payment.STATUS_SUCCESS)
        self.assertEqual(b.status, Booking.STATUS_CONFIRMED)
        self.assertEqual(dep.seats_confirmed, 6)
        self.assertEqual(dep.status, Departure.STATUS_GUARANTEED)

        self._post_webhook(p, "COMPLETED")  # duplicate
        dep.refresh_from_db()
        self.assertEqual(dep.seats_confirmed, 6)

    @patch("scheduling.phonepe.create_order", return_value=_FAKE_ORDER)
    def test_balance_webhook_marks_fully_paid(self, _m):
        b = self._accepted(6)
        dep_pay = payments.initiate_payment(b, Payment.KIND_DEPOSIT)
        self._post_webhook(dep_pay, "COMPLETED")
        b.refresh_from_db()
        bal_pay = payments.initiate_payment(b, Payment.KIND_BALANCE)
        self._post_webhook(bal_pay, "COMPLETED")
        b.refresh_from_db()
        self.assertEqual(b.payment_status, Booking.PAYMENT_FULLY_PAID)

    @patch("scheduling.phonepe.create_order", return_value=_FAKE_ORDER)
    def test_failed_webhook_keeps_accepted(self, _m):
        b = self._accepted(6)
        p = payments.initiate_payment(b, Payment.KIND_DEPOSIT)
        self._post_webhook(p, "FAILED")
        b.refresh_from_db(); p.refresh_from_db()
        self.assertEqual(p.status, Payment.STATUS_FAILED)
        self.assertEqual(b.status, Booking.STATUS_ACCEPTED)

    def test_webhook_rejects_bad_auth(self):
        res = self.client.post("/api/webhooks/phonepe/", {"event": "x", "payload": {}},
                               format="json", HTTP_AUTHORIZATION="deadbeef")
        self.assertEqual(res.status_code, 401)

    @patch("scheduling.phonepe.create_order", return_value=_FAKE_ORDER)
    def test_accept_endpoint_returns_payment_redirect(self, _m):
        b = services.create_booking(
            package=self.pkg, party_size=6, lead_name="A", lead_email="a@b.c",
            preferred_date=self.date, user=self.user,
        )
        res = self.client.post(f"/api/bookings/{b.id}/accept/")
        self.assertEqual(res.status_code, 200, res.content)
        body = res.json()
        self.assertEqual(body["booking"]["status"], "accepted")
        self.assertEqual(body["payment"]["redirectUrl"], "https://phonepe/redirect")


# ---------------------------------------------------------------------------
# Phase 4 — notifications, background sweeps, travellers
# ---------------------------------------------------------------------------

class NotificationTests(TestCase):
    def setUp(self):
        self.pkg = make_package()
        self.date = timezone.localdate() + timedelta(days=30)
        self.user = make_user()

    def test_guarantee_emails_confirmed_travellers(self):
        b = services.create_booking(
            package=self.pkg, party_size=6, lead_name="Asha", lead_email="asha@x.com",
            preferred_date=self.date, user=self.user,
        )
        services.accept_booking(b)
        mail.outbox.clear()
        services.confirm_booking(b)  # crosses min → guaranteed → email
        self.assertTrue(any("guaranteed" in m.subject.lower() for m in mail.outbox))
        self.assertIn("asha@x.com", [addr for m in mail.outbox for addr in m.to])


class SweepTests(TestCase):
    def setUp(self):
        self.pkg = make_package()
        self.user = make_user()

    def _booking_in(self, dep, status, party=2, email="t@x.com"):
        return Booking.objects.create(
            package=self.pkg, departure=dep, user=self.user, lead_name="T",
            lead_email=email, party_size=party, status=status,
            payment_status=Booking.PAYMENT_DEPOSIT_PAID if status == Booking.STATUS_CONFIRMED else Booking.PAYMENT_UNPAID,
            total_amount=20000, deposit_amount=10000, balance_amount=10000,
        )

    def test_sweep_cancels_under_min_past_cutoff(self):
        dep = make_departure(self.pkg, days_ahead=5, confirmed=2)  # cutoff already passed
        self._booking_in(dep, Booking.STATUS_CONFIRMED)
        mail.outbox.clear()
        result = services.sweep_cutoff()
        dep.refresh_from_db()
        self.assertEqual(result["cancelled"], 1)
        self.assertEqual(dep.status, Departure.STATUS_CANCELLED)
        self.assertEqual(dep.bookings.first().status, Booking.STATUS_CANCELLED)
        self.assertTrue(len(mail.outbox) >= 1)

    def test_sweep_locks_guaranteed_past_cutoff(self):
        dep = make_departure(self.pkg, days_ahead=5, confirmed=6, status=Departure.STATUS_GUARANTEED)
        result = services.sweep_cutoff()
        dep.refresh_from_db()
        self.assertEqual(result["locked"], 1)
        self.assertEqual(dep.status, Departure.STATUS_LOCKED)

    def test_balance_reminders_send_once(self):
        dep = make_departure(self.pkg, days_ahead=5, confirmed=6, status=Departure.STATUS_GUARANTEED)
        self._booking_in(dep, Booking.STATUS_CONFIRMED, email="pay@x.com")
        mail.outbox.clear()
        self.assertEqual(services.send_balance_reminders(days_before=7), 1)
        self.assertTrue(any("balance" in m.subject.lower() for m in mail.outbox))
        # Deduped on a second run.
        self.assertEqual(services.send_balance_reminders(days_before=7), 0)


class TravellerApiTests(TestCase):
    def setUp(self):
        self.pkg = make_package(slug="ayodhya")
        self.date = timezone.localdate() + timedelta(days=30)
        self.user = make_user()
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.bid = self.client.post("/api/bookings/", {
            "packageSlug": "ayodhya", "partySize": 3,
            "preferredStartDate": self.date.isoformat(),
        }, format="json").json()["id"]

    def test_set_and_get_travellers(self):
        payload = [
            {"fullName": "Asha Rai", "age": 30, "idType": "Aadhaar", "idNumber": "1111"},
            {"fullName": "Bina Rai", "age": 28},
        ]
        res = self.client.post(f"/api/bookings/{self.bid}/travellers/", payload, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(len(res.json()), 2)
        got = self.client.get(f"/api/bookings/{self.bid}/travellers/").json()
        self.assertEqual(got[0]["fullName"], "Asha Rai")

    def test_too_many_travellers_rejected(self):
        payload = [{"fullName": f"P{i}"} for i in range(4)]  # party_size is 3
        res = self.client.post(f"/api/bookings/{self.bid}/travellers/", payload, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()["code"], "too_many_travellers")


# ---------------------------------------------------------------------------
# Ops hardening — health check + throttling
# ---------------------------------------------------------------------------

class HealthTests(TestCase):
    def test_health_ok(self):
        res = APIClient().get("/api/health/")
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertEqual(body["status"], "ok")
        self.assertTrue(body["database"])


class ThrottleTests(TestCase):
    """Throttling is disabled globally under the test runner for determinism, so
    we patch the rate directly to prove the mechanism is wired to login."""

    def setUp(self):
        cache.clear()  # throttle counters live in the cache
        self.client = APIClient()
        make_user(email="t@x.com", password="StrongPass123")

    def tearDown(self):
        cache.clear()

    @patch("rest_framework.throttling.ScopedRateThrottle.get_rate", return_value="3/min")
    def test_login_is_rate_limited(self, _rate):
        creds = {"email": "t@x.com", "password": "StrongPass123"}
        for _ in range(3):
            self.assertEqual(self.client.post("/api/auth/login/", creds, format="json").status_code, 200)
        # 4th within the window is throttled.
        self.assertEqual(self.client.post("/api/auth/login/", creds, format="json").status_code, 429)
