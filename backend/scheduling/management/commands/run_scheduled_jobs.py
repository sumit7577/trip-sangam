"""Convenience runner for all periodic slot-booking jobs — point one cron entry
at this (e.g. every 5 min) instead of wiring each separately.

  */5 * * * *  python manage.py run_scheduled_jobs
"""
from django.core.management.base import BaseCommand

from cms.models import PackagePage
from scheduling import payments, razorpay_gw as gateway, services


class Command(BaseCommand):
    help = "Run expire-holds, payment reconcile, calendar top-up, cutoff sweep, balance reminders."

    def handle(self, *args, **options):
        reverted = services.expire_holds()
        self.stdout.write(f"  holds reverted: {reverted}")

        seeded = sum(services.ensure_calendar(p) for p in PackagePage.objects.live())
        self.stdout.write(f"  departures seeded: {seeded}")

        swept = services.sweep_cutoff()
        self.stdout.write(f"  cutoff: locked {swept['locked']}, cancelled {swept['cancelled']}")

        reminders = services.send_balance_reminders()
        self.stdout.write(f"  balance reminders: {reminders}")

        if gateway.is_configured():
            from scheduling.models import Payment
            pending = Payment.objects.filter(status=Payment.STATUS_PENDING)
            done = 0
            for p in pending:
                try:
                    payments.reconcile_payment(p)
                    done += 1
                except gateway.GatewayError:
                    pass
            self.stdout.write(f"  payments reconciled: {done}/{pending.count()}")

        self.stdout.write(self.style.SUCCESS("Scheduled jobs complete."))
