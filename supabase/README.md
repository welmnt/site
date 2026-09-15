# Welmnt engine — database

New Supabase project, on Abdullah's org.

## Apply

```bash
supabase link --project-ref <REF>
supabase db push        # ⚠️ only ever on THIS project
```

> Never run `supabase db push` against the Catalyst project (`kckohxkpliysqlnkwgrd`,
> "chatly"). It has no migration history and a push would replay migrations against
> a live payments database.

Order: `…_core.sql` → `…_rls.sql` → `…_seed.sql` (timestamp-ordered, as the Supabase CLI expects).

## The rules that keep this safe

Lifted from the Catalyst production app. Each one maps to a bug that was live.

1. RLS on + default-deny everywhere. `anon` gets a policy only for the exact rows a guest needs.
2. The only anon write is INSERT-only on a form table the guest cannot read back (`leads`, `assessment_submissions`).
3. **RLS is row-level, not column-level.** `cohorts.meeting_url` and `.notes` are protected by a column grant, not a policy.
4. `SECURITY DEFINER` bypasses RLS — every such function checks the caller in its own body. An EXECUTE grant is not authorization.
5. Postgres grants `EXECUTE TO PUBLIC` by default. Revoking from `anon` alone is a no-op; revoke from `PUBLIC`.
6. `search_path` is pinned on every function.

## Seat accounting

`cohorts.seats_taken` is derived. A trigger recounts it from `enrollments` on every
write, so two reps saving at the same instant cannot oversell a cohort. Never let a
client set it directly.

## Project

Linked to **Welmnt** — ref `zjbjhrbpvgnxcvawybtt`, West EU (Ireland). Migrations applied
2026-09-15, so this project has a real migration history from its first day.

## Adding a person

Public signup stays **disabled** — an account only exists because someone created it in
the dashboard (Authentication → Users → Add user), where they set their own password.
That login grants nothing on its own; permission comes from the `team_members` row:

```bash
bash scripts/link-team-member.sh hazem@example.com "Hazem" admin
bash scripts/link-team-member.sh rep@example.com   "Rep Name" sales
```
