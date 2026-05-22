#!/bin/sh
# Run on every container start. Idempotent.
set -e

echo "→ migrating database…"
python manage.py migrate --noinput

echo "→ collecting staticfiles…"
python manage.py collectstatic --noinput --clear

# Seed on first boot only — guard via marker file in the data volume.
if [ ! -f /app/data/.seeded ]; then
  echo "→ first boot detected, seeding initial content…"
  python manage.py seed_data || echo "(seed failed — continuing; run manually if needed)"
  touch /app/data/.seeded
fi

echo "→ starting: $*"
exec "$@"
