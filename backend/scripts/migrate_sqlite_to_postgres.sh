#!/bin/sh
# Migrate all data from the current SQLite DB into Postgres.
#
# Run from the backend/ directory. Step 1 reads SQLite (no POSTGRES_* env set);
# step 2 loads into Postgres (POSTGRES_* env set). Safe to re-run — loaddata is
# additive, so point it at a FRESH/empty Postgres DB.
#
# Usage:
#   # 1) dump from sqlite (no postgres env)
#   sh scripts/migrate_sqlite_to_postgres.sh dump
#
#   # 2) load into postgres (with the docker compose db up)
#   POSTGRES_DB=sangam POSTGRES_USER=sangam POSTGRES_PASSWORD=sangam \
#   POSTGRES_HOST=127.0.0.1 POSTGRES_PORT=5432 \
#   sh scripts/migrate_sqlite_to_postgres.sh load
set -e

PY="${PYTHON:-.venv/bin/python}"
DUMP="${DUMP_FILE:-/tmp/sangam_dump.json}"

# Exclude tables that are environment-specific or recreated by migrations.
EXCLUDES="--exclude contenttypes --exclude auth.permission --exclude sessions \
          --exclude admin.logentry --exclude wagtailcore.referenceindex"

case "$1" in
  dump)
    echo "→ dumping SQLite data to $DUMP …"
    unset POSTGRES_DB
    $PY manage.py dumpdata --natural-foreign --natural-primary $EXCLUDES \
        --indent 2 -o "$DUMP"
    echo "✓ wrote $DUMP"
    ;;
  load)
    if [ -z "$POSTGRES_DB" ]; then echo "POSTGRES_DB not set — refusing"; exit 1; fi
    echo "→ migrating schema into Postgres ($POSTGRES_DB @ $POSTGRES_HOST) …"
    $PY manage.py migrate --noinput
    echo "→ loading $DUMP …"
    $PY manage.py loaddata "$DUMP"
    echo "✓ data loaded into Postgres"
    ;;
  *)
    echo "usage: $0 {dump|load}"; exit 1;;
esac
