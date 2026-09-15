#!/usr/bin/env bash
# Applies every migration to a throwaway local database, then runs the security
# suite against it. Needs a local Postgres on the default socket.
#
# Supabase hands `anon` and `authenticated` broad default privileges on `public`.
# A bare Postgres does not — which is the point: if the migrations depend on the
# platform's defaults rather than stating their own grants, these tests fail.
set -euo pipefail
DB="${1:-welmnt_migration_test}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

dropdb --if-exists "$DB"
createdb "$DB"

psql -q -d "$DB" <<'BOOTSTRAP'
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon')          then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role')  then create role service_role nologin; end if;
end $$;
create schema if not exists auth;
create schema if not exists extensions;
create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
BOOTSTRAP

for f in "$HERE"/../migrations/*.sql; do
  echo "→ $(basename "$f")"
  psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$f" >/dev/null
done

echo ""
psql -q -d "$DB" -f "$HERE/security.sql"
echo ""
echo "Done. Drop with: dropdb $DB"
