"""At each departure's cut-off: lock guaranteed groups, cancel + refund under-min
ones. Run daily via cron."""
from django.core.management.base import BaseCommand

from scheduling import services


class Command(BaseCommand):
    help = "Lock guaranteed departures and cancel/refund under-min ones past cut-off."

    def handle(self, *args, **options):
        result = services.sweep_cutoff()
        self.stdout.write(self.style.SUCCESS(
            f"Locked {result['locked']}, cancelled {result['cancelled']} departure(s)."
        ))
