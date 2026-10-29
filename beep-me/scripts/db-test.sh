#!/usr/bin/env bash
# Applies every migration to a throwaway local Postgres database and runs the
# RLS tests. Needs a local `psql` and a Postgres superuser connection.
#
#   PGURL=postgres://postgres:postgres@localhost:5432/postgres scripts/db-test.sh
#
# The stub in supabase/tests/00_supabase_stub.sql imitates the auth/storage
# schemas of a hosted project; it is never applied to a real project.
set -euo pipefail
cd "$(dirname "$0")/.."

PGURL="${PGURL:-postgres://postgres@localhost:5432/postgres}"
DB="beepme_test_$$"

psql -q -v ON_ERROR_STOP=1 "$PGURL" -c "create database $DB"
trap 'psql -q "$PGURL" -c "drop database if exists $DB" >/dev/null' EXIT
TEST_URL="${PGURL%/*}/$DB"

psql -q -v ON_ERROR_STOP=1 "$TEST_URL" -f supabase/tests/00_supabase_stub.sql
for f in supabase/migrations/*.sql; do
  echo "applying $f"
  psql -q -v ON_ERROR_STOP=1 "$TEST_URL" -f "$f"
done
psql -v ON_ERROR_STOP=1 "$TEST_URL" -f supabase/tests/rls.test.sql
