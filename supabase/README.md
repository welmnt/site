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

Order: `0001_core.sql` → `0002_rls.sql` → `0003_seed.sql`.

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

## First admin

Supabase signup should stay **disabled**. Create the user in the dashboard, then:

```sql
insert into public.team_members (auth_uid, name, email, role_id)
values ('<auth.users.id>', 'Hazem', 'hazem@…', (select id from public.roles where key='admin'));
```
