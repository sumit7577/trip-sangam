"""Pre-create empty departures for each package's weekday cadence.

Run on a schedule (e.g. daily cron) so the rolling calendar always extends
`schedule_weeks_ahead` into the future. Idempotent.
"""
from django.core.management.base import BaseCommand

from cms.models import PackagePage
from scheduling import services


class Command(BaseCommand):
    help = "Seed the rolling departure calendar from each package's weekday cadence."

    def handle(self, *args, **options):
        total = 0
        for package in PackagePage.objects.live():
            created = services.ensure_calendar(package)
            if created:
                self.stdout.write(f"  {package.slug}: +{created} departure(s)")
            total += created
        self.stdout.write(self.style.SUCCESS(f"Created {total} departure(s)."))
