from django.db import migrations, models


def bump_max_group(apps, schema_editor):
    """Raise the per-group traveller cap so larger parties can book/confirm
    instead of being waitlisted. Lifts any package still on the old <=18 cap."""
    PackagePage = apps.get_model("cms", "PackagePage")
    PackagePage.objects.filter(max_group__lt=50).update(max_group=50)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("cms", "0012_packagepage_cutoff_days_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="packagepage",
            name="max_group",
            field=models.PositiveSmallIntegerField(
                default=50, help_text="Maximum travellers per group/slot."
            ),
        ),
        migrations.RunPython(bump_max_group, noop),
    ]
