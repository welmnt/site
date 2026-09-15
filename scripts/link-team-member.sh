#!/usr/bin/env bash
# Link an existing Supabase auth user to a Welmnt team_members row.
#
#   bash scripts/link-team-member.sh <email> "<Full Name>" <admin|sales>
#
# Create the user FIRST in the Supabase dashboard (Authentication → Users → Add user),
# where you set the password yourself. Public signup stays disabled, so this is the
# only way an account comes into existence — and a login on its own still grants
# nothing until the row this script writes exists.
set -euo pipefail

EMAIL="${1:?usage: link-team-member.sh <email> <name> <admin|sales>}"
NAME="${2:?}"
ROLE="${3:?}"
REF="zjbjhrbpvgnxcvawybtt"
URL="https://${REF}.supabase.co"

# Pulled fresh each run so no secret is ever stored in the repo.
SR="$(supabase projects api-keys --project-ref "$REF" 2>/dev/null | awk '/service_role/{print $3}')"
[ -n "$SR" ] || { echo "Could not read the service_role key. Run: supabase login"; exit 1; }

UID_=$(curl -s -H "apikey: $SR" -H "Authorization: Bearer $SR" \
  "$URL/auth/v1/admin/users?page=1&per_page=200" \
  | python3 -c "
import sys, json
want = '''$EMAIL'''.lower()
users = json.load(sys.stdin).get('users', [])
hit = next((u for u in users if (u.get('email') or '').lower() == want), None)
print(hit['id'] if hit else '')")

if [ -z "$UID_" ]; then
  echo "No auth user found for $EMAIL."
  echo "Create it first: Supabase dashboard → Authentication → Users → Add user."
  exit 1
fi

ROLE_ID=$(curl -s -H "apikey: $SR" -H "Authorization: Bearer $SR" \
  "$URL/rest/v1/roles?select=id&key=eq.$ROLE" \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d[0]['id'] if d else '')")
[ -n "$ROLE_ID" ] || { echo "No role '$ROLE'. Use admin or sales."; exit 1; }

curl -s -H "apikey: $SR" -H "Authorization: Bearer $SR" \
  -H "Content-Type: application/json" -H "Prefer: resolution=merge-duplicates" \
  -X POST "$URL/rest/v1/team_members" \
  -d "{\"auth_uid\":\"$UID_\",\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"role_id\":\"$ROLE_ID\",\"is_active\":true}" \
  > /dev/null

echo "✅ $NAME <$EMAIL> linked as $ROLE. They can sign in at /admin/login."
