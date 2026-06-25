"""Release seats for checkout holds that have expired.

Run frequently (e.g. every 1-2 minutes via cron) so seats don't stay locked
when a traveller abandons the deposit step.
"""
from django.core.management.base import BaseCommand

from scheduling import services


class Command(BaseCommand):
    help = "Expire stale seat holds and free their capacity."

    def handle(self, *args, **options):
        n = services.expire_holds()
        self.stdout.write(self.style.SUCCESS(f"Released {n} expired hold(s)."))
