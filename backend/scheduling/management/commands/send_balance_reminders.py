"""Email confirmed travellers whose balance is due as the trip approaches.
Run daily via cron."""
from django.core.management.base import BaseCommand

from scheduling import services


class Command(BaseCommand):
    help = "Send balance-due reminders for upcoming confirmed bookings."

    def add_arguments(self, parser):
        parser.add_argument("--days-before", type=int, default=7)

    def handle(self, *args, **options):
        sent = services.send_balance_reminders(days_before=options["days_before"])
        self.stdout.write(self.style.SUCCESS(f"Sent {sent} balance reminder(s)."))
