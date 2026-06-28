"""Reconcile pending payments against Razorpay's Payment Link status API.

Fallback for missed/delayed webhooks. Run every few minutes via cron.
"""
from django.core.management.base import BaseCommand

from scheduling import payments, razorpay_gw as gateway
from scheduling.models import Payment


class Command(BaseCommand):
    help = "Pull status for pending payments from Razorpay and apply outcomes."

    def handle(self, *args, **options):
        if not gateway.is_configured():
            self.stdout.write("Razorpay not configured — nothing to do.")
            return
        pending = Payment.objects.filter(status=Payment.STATUS_PENDING)
        applied = 0
        for payment in pending:
            try:
                payments.reconcile_payment(payment)
                applied += 1
            except gateway.GatewayError as exc:
                self.stderr.write(f"  {payment.merchant_order_id}: {exc}")
        self.stdout.write(self.style.SUCCESS(f"Reconciled {applied}/{pending.count()} pending payment(s)."))
