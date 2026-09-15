# Welmnt engine

The marketing site + cohort CRM for Welmnt's B2C programmes, built on the same
architecture as the Catalyst app (`catalyst/qa-ai-future-start`) with Welmnt's own
brand and a different delivery model.

## What it is

| Half | What it does |
|---|---|
| **Public site** | Home · Programmes · Programme detail · Schools & Events · About · FAQ · Contact · Privacy · Book a place |
| **CRM** (`/admin`) | Dashboard · Leads · Follow-ups · Cohorts · Enrollments · Customers · Payments · Team |

Stack: Vite + React 18 + TypeScript + Tailwind + Supabase. React Query for data.

## The one structural difference from Catalyst

Catalyst sells **recorded courses**: enrollment is an entitlement, and it's evergreen.

Welmnt sells **live cohorts** — 8 sessions over 2 months, 3,000 EGP per child, three
age bands (5–9, 10–13, 14–17). So the unit a parent buys is a **seat in a group with a
start date and a capacity**. That is why `cohorts` and `cohort_sessions` exist, why
`seats_taken` is maintained by a trigger rather than by the app, and why a cohort has a
`meeting_url` that must never reach the public.

## Running it

```bash
npm install
cp .env.example .env     # fill in the Supabase project URL + anon key
npm run dev              # http://localhost:8766
```

The site runs **without** Supabase configured — programmes fall back to the local copy
deck in `src/content/programs.ts`, and `/admin` says plainly that the CRM isn't
connected. A brochure shouldn't go blank because a database is unreachable.

## Database

Migrations in `supabase/migrations`, timestamp-ordered and applied with `supabase db push`. See `supabase/README.md`.

⚠️ The project is new, on Abdullah's Supabase org. **Never** point these at the
Catalyst project (`kckohxkpliysqlnkwgrd`, "chatly") — it has no migration history and
a push would replay against a live payments database.

### Security tests

```bash
bash supabase/tests/run.sh
```

Applies every migration to a throwaway local database and asserts the posture:
anon can read programmes and open cohorts (minus `meeting_url`), can insert a lead and
cannot read one back, cannot pre-set a lead's status or owner, and cannot reach the
permission gate. A signed-in account with no `team_members` row sees an empty database.
Seat counts stay honest and a cohort cannot be oversold.

All sixteen assertions pass as of 2026-09-15.

## The dashboard

Built on the shape of the Catalyst dashboard, minus the parts Welmnt has no use for.

**Kept** — period tabs where every number is measured against the previous equivalent
period; the KPI card that draws last period as a dashed line behind this one; leak chips
that link straight to the page that fixes them; the funnel with step-to-step conversion;
the team leaderboard.

**Cut** — ad spend and ROAS (no ads), the payment-gateway settlement banner, gross vs net
vs cash-in vs cash-out (one price paid once), the currency panel (EGP only), bundles,
repeat buyers, WhatsApp clicks, the course filter, and YTD/custom ranges.

**Added** — **cohort fill**, which Catalyst has no equivalent of and Welmnt needs more
than most of what was cut. In a live business an empty seat at kickoff is revenue that
can never be recovered, because the group has already started.

### One deliberate difference from Catalyst

The comparison is **like for like**: the elapsed part of this period against *the same
stretch* of the last one — 1–15 September against 1–15 August, not against all of August.
The obvious implementation makes every month read "down" until the month ends, because a
half-finished period is being measured against a complete one. The header states the exact
windows being compared so there is nothing to guess at.

Weeks run **Friday → Thursday**.

It is one `get_dashboard` RPC — one round trip, and one place where permission is checked.
The alternative is eight client queries each needing its own table grant.

### Demo data

```bash
python3 scripts/demo-data.py seed   # fills the CRM with plausible leads/cohorts/payments
python3 scripts/demo-data.py wipe   # removes all of it
```

⚠️ Writes to the live project. Don't run `wipe` once real parents are in there.

## Still open

- **Programme names and copy are placeholders.** The engine is what's real: three bands,
  8 sessions, 2 months, 3,000 EGP. Rename once the curriculum is written.
- **No payment provider wired.** `payments` rows are recorded by hand until Kashier (or
  InstaPay) is connected. The table and the admin page are ready for a webhook.
- **The assessment isn't ported yet.** `welmnt-connect-suite` already has a working
  Arabic parenting assessment and an AI report edge function; `assessment_submissions`
  is here waiting for it.
- **Deployment.** `welmnt.me` is registered but still on Namecheap parking.
