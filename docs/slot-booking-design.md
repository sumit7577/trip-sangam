# Slot Booking & Auto-Grouping — Design Doc

**Status:** Draft for review · **Owner:** Sangam Travel · **Last updated:** 2026-06-26

This document is the full plan for an automatic **slot booking** system: travelers book a
trip in parties of varying size (1, 2, 4, …), and the backend automatically groups them into
departures of **minimum 6** and **maximum 18** people, creating new slots as demand arrives.
A seat is confirmed only after a **50% deposit** is paid (via **PhonePe / UPI**).

---

## 1. Decisions locked

| # | Decision | Choice |
|---|----------|--------|
| 1 | Departure dates | **Hybrid** — system maintains a rolling auto-generated date calendar *and* pools incoming demand into those dates |
| 2 | Slot overflow | **Open a 2nd group** — when a date's group A hits 18, auto-open group B (another guide/vehicle), up to a per-date cap |
| 3 | Confirmation | **Deposit to confirm** — seat is held during checkout, becomes confirmed only after a **50% deposit** (configurable) |
| 4 | Payment gateway | **PhonePe** (Standard Checkout, UPI + cards) |
| 5 | Min / Max per slot | **6 / 18** (configurable per package) |

---

## 2. The core problem: online bin-packing

- **Items** = bookings (parties), size 1–N, **indivisible** (a family of 4 must travel together).
- **Bins** = slots / departures, capacity **max 18**, with an **activation threshold of 6**
  (a slot cannot "run"/guarantee until 6 confirmed).
- **Online** = parties arrive over time; we place each immediately without knowing future demand.

The whole feature reduces to two questions for every incoming party of size `P`:
1. Which existing slot does it go into?
2. When do we open a new slot (group B, or a new date)?

### Critical counting rule

A slot tracks **three** quantities so we never oversell and never "guarantee" on unpaid interest:

| Quantity | Meaning | Used for |
|----------|---------|----------|
| `seats_confirmed` | deposit paid ✅ | counts toward the **min-6 guarantee** |
| `seats_held` | party mid-checkout, deposit not yet paid (expires) | counts toward the **max-18 cap** |
| `seats_left` (derived) | `max_capacity − seats_confirmed − seats_held` | shown to users |

- Availability check for a new party `P`: `seats_confirmed + seats_held + P ≤ max_capacity`.
- Guarantee fires when: `seats_confirmed ≥ min_capacity`.

---

## 3. Data model

New Django app: **`scheduling`** (keeps `bookings.BookingInquiry` as the lightweight lead form;
real bookings live here). Field-level detail below.

### 3.1 `Departure` — one running group/slot

| Field | Type | Notes |
|-------|------|-------|
| `package` | FK → `cms.PackagePage` (PROTECT) | |
| `start_date` | Date | |
| `end_date` | Date | derived: `start_date + duration_days` |
| `group_label` | Char (`"A"`, `"B"`, …) | parallel groups on the same date |
| `min_capacity` | SmallInt (default 6) | copied from package at creation |
| `max_capacity` | SmallInt (default 18) | |
| `seats_confirmed` | SmallInt (default 0) | deposit-paid seats |
| `seats_held` | SmallInt (default 0) | seats in active checkout holds |
| `status` | Char choices | `forming → guaranteed → full → locked → departed` · `cancelled` |
| `guaranteed_at` | DateTime null | when it first crossed min |
| `cutoff_date` | Date | booking deadline (e.g. `start − cutoff_days`) |
| `price_inr` | PositiveInt null | optional price snapshot for this departure |
| `auto_created` | Bool | created by the algorithm vs. by admin |
| `guide` / `notes` | Char / Text | admin/ops |
| `created_at` / `updated_at` | DateTime | |

- **Unique constraint:** `(package, start_date, group_label)`.
- **Index:** `(package, start_date, status)` for fast candidate lookups.
- Helper props: `seats_left`, `is_guaranteed`, `is_bookable` (status in {forming, guaranteed} and not past cutoff).

### 3.2 `Booking` — a party booking

| Field | Type | Notes |
|-------|------|-------|
| `package` | FK → PackagePage | |
| `departure` | FK → Departure null | null only transiently before assignment |
| `user` | FK → AUTH_USER_MODEL null | guest bookings allowed |
| `lead_name` / `lead_email` / `lead_phone` | Char/Email/Char | |
| `party_size` | SmallInt | 1 … max_capacity |
| `preferred_start_date` | Date null | drives hybrid pooling |
| `date_flexible` | Bool | widen the search window if true |
| `status` | Char choices | `pending → held → confirmed → cancelled` · `expired`, `waitlisted` |
| `total_amount` | PositiveInt | `party_size × price_inr` |
| `deposit_amount` | PositiveInt | `round(total × deposit_pct)` |
| `balance_amount` | PositiveInt | `total − deposit` |
| `payment_status` | Char | `unpaid → deposit_paid → fully_paid → refunded` |
| `hold_expires_at` | DateTime null | seat-hold TTL during checkout |
| `created_at` / `updated_at` | DateTime | |

### 3.3 `BookingTraveler` — one row per head (optional, phase ≥2)
`booking` FK, `full_name`, `age`, `gender`, `id_type`, `id_number` — needed later for permits/manifests.

### 3.4 `Payment` — every gateway interaction
| Field | Notes |
|-------|-------|
| `booking` FK | |
| `kind` | `deposit` / `balance` / `refund` |
| `merchant_order_id` | our unique id sent to PhonePe |
| `phonepe_order_id` / `transaction_id` | from PhonePe |
| `amount` | paise |
| `status` | `created → pending → success / failed`; refunds: `initiated → completed` |
| `raw_payload` | JSON — last webhook/status body (audit + idempotency) |
| `created_at` / `updated_at` | |

### 3.5 Config added to `PackagePage`
Replace the free-text `group_size` ("4-12") with real numbers (keep a display string if needed):
- `min_group` (default 6), `max_group` (default 18)
- `max_groups_per_date` (default e.g. 2 — limited by guides/permits)
- `deposit_pct` (default 50)
- `cutoff_days` (default 14)
- **Cadence for auto-calendar:** `departure_weekdays` (e.g. {Sat}) or an explicit list, + `schedule_weeks_ahead` (e.g. 12)

---

## 4. The slotting algorithm

**Best-Fit** placement. Best-Fit consolidates parties into nearly-full slots so they reach the
6-person guarantee fastest and fragment least (Worst-Fit spreads everyone thin and strands slots
below 6).

```text
assign_party(package K, party_size P, preferred_date D, flexible?):
    if P > K.max_group:
        return PRIVATE_GROUP        # don't split a family; route to manual private departure

    window = [D] (or [D ± tolerance] if flexible, or nearest scheduled dates)

    candidates = Departures(package=K, start_date in window,
                            status in {forming, guaranteed},
                            cutoff not passed,
                            seats_confirmed + seats_held + P <= max_capacity)

    if candidates:
        target = min(candidates, key=lambda d: d.seats_left)   # BEST-FIT
        # tie-break: guaranteed first, then earliest start_date, then group_label
    else:
        # no open group fits P on the wanted date(s)
        if a date in window has room for another group (groups_used < max_groups_per_date):
            target = open_new_group(same date, next label)      # group B, C, …
        else:
            target = open_or_pick_date(window) or seed_new_date(K, D)  # hybrid: extend calendar
        if still none:
            return WAITLIST

    hold(target, P)        # seats_held += P, booking.status = held, hold_expires_at = now+15m
    return target
```

**Guarantee / full transitions** happen on *deposit confirmation*, not on hold:

```text
on_deposit_paid(booking B):
    D = B.departure
    D.seats_held      -= B.party_size
    D.seats_confirmed += B.party_size
    B.status = confirmed; B.payment_status = deposit_paid
    if D.seats_confirmed >= D.min_capacity and D.status == forming:
        D.status = guaranteed; D.guaranteed_at = now
        notify_all_parties(D, "trip_guaranteed")
    if D.seats_confirmed + D.seats_held >= D.max_capacity:
        D.status = full
```

**Hybrid date behaviour:**
- A scheduled-calendar job pre-creates empty `forming` departures per cadence (`schedule_weeks_ahead`).
- Users normally pick from these shown slots.
- If a user wants a date with no slot (and cadence allows), the system **seeds a new date** on demand → "pooling".
- If all groups on a date are full → open next group (≤ `max_groups_per_date`) or roll to next date / waitlist.

**Consolidation job (background):** merge under-filled `forming` slots for the same date when
combined ≤ 18; near `cutoff_date`, sweep slots still `< min` → notify + offer transfer, else cancel.
Only ever moves **unpaid/held** parties; **never splits** a confirmed party.

---

## 5. State machines

**Departure:** `forming → guaranteed` (≥6 confirmed) `→ full` (=18) `→ locked` (cutoff passed)
`→ departed`. Or `→ cancelled` if it never reaches 6 by cutoff (→ refund/transfer all deposits).

**Booking:** `pending → held` (in checkout) `→ confirmed` (deposit paid) `→ cancelled` /
`refunded`. Side states: `expired` (hold lapsed unpaid), `waitlisted` (no capacity).

**Payment:** `created → pending → success | failed`; refund: `initiated → completed | failed`.

**Cancellation dropping a guaranteed slot back below 6:** policy decision — default **keep it
guaranteed** (promise already made); flag to ops.

---

## 6. Concurrency & integrity (must-have)

- **Atomic seat assignment.** Wrap hold/confirm in `transaction.atomic()` with
  `Departure.objects.select_for_update()` on the candidate row, OR a conditional update
  `UPDATE … SET seats_held = seats_held + P WHERE id=? AND seats_confirmed+seats_held+P <= max`
  and check `rowcount` — so two parties can't both claim seat 18.
- **Seat holds + cleanup job** are load-bearing now that money is involved: a hold reserves
  capacity for ~15 min; an expired-hold sweep releases it.
- **Webhook idempotency.** PhonePe can deliver the same callback multiple times — key on
  `merchant_order_id`, ignore if already terminal. Store `raw_payload`.
- **Reconciliation.** If a webhook is missed, the **Order Status API** is the fallback source of
  truth (run on a short poll for `pending` payments).

> ⚠️ **SQLite caveat.** Production is currently SQLite. It serialises writes (so it won't
> *oversell*), but `select_for_update` is a no-op and it takes a **database-wide** write lock under
> contention. Fine at launch volume; **moving to Postgres is the recommended prerequisite before
> meaningful concurrent booking traffic.** Tracked as an open item (§12).

---

## 7. Payments — PhonePe (Standard Checkout)

PhonePe has **no native "partial payment"** primitive. The 50% deposit model is implemented as
**two separate orders**: one for the deposit now, one for the balance later. Clean and simple.

### Deposit flow
1. `POST /api/bookings/` → seat **held**, booking created `held`, deposit computed.
2. Backend gets an **auth token** (OAuth client credentials), then **creates a PhonePe order** for
   `deposit_amount` (paise) with a unique `merchant_order_id`, `redirectUrl`, and the configured
   webhook. Returns the PhonePe checkout/redirect URL.
3. User pays on PhonePe (UPI/card) → redirected back.
4. **S2S webhook** hits `POST /api/webhooks/phonepe/` (HTTPS, Basic-auth username/password,
   respond 2xx within 3–5s, idempotent) → mark `Payment` success → `on_deposit_paid()` (§4).
5. Hold expires unpaid → cleanup job releases the seat → booking `expired`.

### Balance flow
Before `cutoff_date`, create a **second** PhonePe order for `balance_amount`; on success →
`payment_status = fully_paid`. Balance-due reminders via the jobs in §9.

### Refunds
Use the **Refund API** (+ Refund Status API) — on user cancellation (per policy) and on
auto-cancelled under-min departures. Refunds allowed within 3 months of the original payment.

### Credentials / env
`PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_MERCHANT_ID`, `PHONEPE_WEBHOOK_USER`,
`PHONEPE_WEBHOOK_PASS`, `PHONEPE_ENV` (sandbox/UAT ↔ production). Keep in env, not in code.

---

## 8. API surface (DRF)

| Method & path | Purpose |
|---|---|
| `GET /api/packages/{slug}/departures/` | upcoming slots: date, group, `seats_left`, status, "guaranteed" badge, price |
| `POST /api/bookings/` | create booking `{package, party_size, contact, preferred_date|departure_id}` → runs slotting → returns assigned departure + deposit order/redirect |
| `GET /api/bookings/{id}/` | status (for the post-booking status page) |
| `POST /api/bookings/{id}/pay-balance/` | create the balance PhonePe order |
| `POST /api/webhooks/phonepe/` | S2S callback (idempotent) |
| `POST /api/bookings/{id}/cancel/` | user cancellation → refund per policy |

(Admin-only refund/transfer endpoints or via Wagtail admin.)

---

## 9. Background jobs

Runner: at this scale a **management command + system/host cron** is simplest (the stack already
auto-runs migrate/collectstatic on boot). Move to **Celery + Redis** only if volume grows.

- `release_expired_holds` — **critical**, every ~1–2 min.
- `reconcile_pending_payments` — poll Order Status for stuck `pending`.
- `sweep_under_min_at_cutoff` — notify / transfer / cancel + refund.
- `generate_departure_calendar` — roll the hybrid calendar `schedule_weeks_ahead`.
- `consolidate_forming_slots` — merge fragmented half-empty slots.
- `send_balance_reminders` — balance due before cutoff.

---

## 10. Notifications
Lifecycle: booking received → deposit link → **deposit received** → **trip guaranteed 🎉** →
balance reminder → fully paid; plus full/waitlist and under-min reschedule.
Channels: **email** (needs SMTP config) first; **WhatsApp** (number already configured on the site)
and SMS as follow-ups.

---

## 11. Frontend changes (Next.js)
- **BookingModal**: add a **party-size selector** (1…max) and show live availability per slot
  ("4/6 booked — 2 more to guarantee", "Guaranteed" badge, `seats_left`).
- **Departure picker** component fed by `/departures/`.
- **Deposit checkout** step → redirect to PhonePe → return/status page.
- **Booking status page**: confirmed seat, guarantee progress, balance-due CTA.
- Waitlist + private-group (party > 18) UI.

---

## 12. Edge cases & open questions
- Party **> 18** → private group (manual). Confirm: ever auto-split? (default no.)
- Cancellation drops guaranteed slot < 6 → keep guaranteed (default) vs re-evaluate.
- Deposit refund policy (full / minus fee / non-refundable < X days) — **needs business rules**.
- Under-min at cutoff: auto-refund vs auto-transfer to next date — **needs business rule**.
- Currency/rounding for `deposit = 50%` (paise rounding).
- Timezone for `cutoff_date` (IST).
- Min age / traveler docs for permits (BookingTraveler).
- **Postgres migration** before concurrent traffic (§6).
- Group-size dynamic pricing (per-head price drops as group grows) — out of scope unless wanted.

---

## 13. Phasing
1. **Phase 1 — Engine (no money):** `scheduling` models + migrations, best-fit `assign_party`,
   atomic holds, admin (manage departures/bookings, manual move/merge), `GET /departures/` +
   `POST /bookings/` (held state only), calendar-generation + release-holds jobs, unit tests.
2. **Phase 2 — PhonePe deposits:** order creation, webhook + reconciliation, `on_deposit_paid`,
   balance flow, refunds, hold-expiry tied to payment.
3. **Phase 3 — Comms & UX:** background sweeps, notifications, frontend slot-picker & checkout,
   waitlist/private-group.

---

## 13b. Postgres cutover (production)

Dev runs on the `docker-compose.yml` Postgres already. Production (`sangam-stack.yaml`,
still SQLite) cuts over deliberately:

1. **Add a Postgres service** to `sangam-stack.yaml`:
   ```yaml
   sangam-db-postgres:
     image: postgres:16
     container_name: sangam-postgres
     restart: always
     environment:
       POSTGRES_DB: ${POSTGRES_DB}
       POSTGRES_USER: ${POSTGRES_USER}
       POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
     volumes: [sangam-pgdata:/var/lib/postgresql/data]
     networks: [sangam-net]
   # volumes: add `sangam-pgdata:`
   ```
2. **Point the backend at it** — add to `sangam-backend.environment`:
   `POSTGRES_DB/USER/PASSWORD`, `POSTGRES_HOST=sangam-db-postgres`, `POSTGRES_PORT=5432`
   (and drop `DJANGO_DB_PATH`). With `POSTGRES_DB` set, `settings.py` switches engines.
3. **Migrate the data** (one-off, with the pg container up and the old sqlite still present):
   ```sh
   # inside the backend container / venv, sqlite still active:
   sh scripts/migrate_sqlite_to_postgres.sh dump
   # then with POSTGRES_* env exported:
   sh scripts/migrate_sqlite_to_postgres.sh load
   ```
   The entrypoint runs `migrate` on boot; `loaddata` brings the rows over. Validate row counts,
   then keep the sqlite volume as a backup for a few days.

> ⚠️ Do the cutover as its own deploy — never point prod at an empty Postgres without the
> `loaddata` step, or the live site loses its content.

## 14. Testing
- **Property tests** for `assign_party`: never exceeds 18, never splits a party, picks best-fit,
  guarantees at ≥6, opens group B correctly.
- **Concurrency test**: simulate simultaneous bookings for the last seats → exactly one wins.
- **State-machine tests**: every transition + illegal transitions rejected.
- **Webhook idempotency**: duplicate PhonePe callbacks apply once.
