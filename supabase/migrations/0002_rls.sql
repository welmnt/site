-- ═══════════════════════════════════════════════════════════════════════════
-- Welmnt engine — RLS, grants and the permission gate
--
-- Read Catalyst's CLAUDE.md §"NON-NEGOTIABLE RULES" before changing anything here.
-- The short version:
--   1. Default-deny on every table. anon gets a policy only for the exact rows a
--      guest needs.
--   2. The ONLY acceptable anon write is INSERT-only on a public-form table the
--      guest cannot read back.
--   3. RLS is row-level. A SELECT policy exposes EVERY column of matched rows —
--      so cohorts.meeting_url and cohorts.notes are protected with COLUMN GRANTS,
--      not with a policy.
--   4. SECURITY DEFINER bypasses RLS, so every such function checks the caller in
--      its own body. An EXECUTE grant is NOT authorization.
--   5. Postgres grants EXECUTE TO PUBLIC on every new function. Revoking from anon
--      alone is a NO-OP while PUBLIC still holds it.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.programs               enable row level security;
alter table public.cohorts                enable row level security;
alter table public.cohort_sessions        enable row level security;
alter table public.leads                  enable row level security;
alter table public.customers              enable row level security;
alter table public.enrollments            enable row level security;
alter table public.payments               enable row level security;
alter table public.follow_ups             enable row level security;
alter table public.assessment_submissions enable row level security;
alter table public.roles                  enable row level security;
alter table public.role_permissions       enable row level security;
alter table public.team_members           enable row level security;

-- ── the permission gate ────────────────────────────────────────────────────
-- Every admin/finance/PII function begins with a call to this. It is the single
-- place that decides what a logged-in user may do.
create or replace function public.user_has_permission(p_resource text, p_action text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1
    from public.team_members tm
    join public.role_permissions rp on rp.role_id = tm.role_id
    where tm.auth_uid = auth.uid()
      and tm.is_active
      and rp.resource = p_resource
      and rp.action   = p_action
  );
$$;
revoke execute on function public.user_has_permission(text, text) from public, anon;
grant  execute on function public.user_has_permission(text, text) to authenticated;

-- Convenience: the caller's own team row (used by the admin shell on login).
create or replace function public.current_team_member()
returns table (id uuid, name text, email text, role_key text)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select tm.id, tm.name, tm.email, r.key
  from public.team_members tm
  left join public.roles r on r.id = tm.role_id
  where tm.auth_uid = auth.uid() and tm.is_active;
$$;
revoke execute on function public.current_team_member() from public, anon;
grant  execute on function public.current_team_member() to authenticated;

-- ═══════════════════════ PUBLIC (anon) SURFACE ═════════════════════════════
-- Exactly three things a guest may do: read active programs, read open cohorts
-- (minus the private columns), and insert a lead / an assessment.

-- programs: read-only, active rows only.
drop policy if exists "anon reads active programs" on public.programs;
create policy "anon reads active programs" on public.programs
  for select to anon, authenticated
  using (is_active = true);

-- cohorts: read-only, and ONLY cohorts a parent could actually join.
drop policy if exists "anon reads open cohorts" on public.cohorts;
create policy "anon reads open cohorts" on public.cohorts
  for select to anon, authenticated
  using (status in ('upcoming','running'));

-- ⚠️ Rule 3. The policy above matches rows; it does NOT hide columns. meeting_url
-- and notes must never reach a guest — that is handled by a COLUMN GRANT in the
-- grants section at the bottom of this file, which runs after the blanket revoke.

-- cohort_sessions: the schedule is a selling point; it carries nothing secret.
drop policy if exists "anon reads sessions of open cohorts" on public.cohort_sessions;
create policy "anon reads sessions of open cohorts" on public.cohort_sessions
  for select to anon, authenticated
  using (exists (
    select 1 from public.cohorts c
    where c.id = cohort_sessions.cohort_id and c.status in ('upcoming','running')
  ));

-- leads: INSERT-ONLY. No select policy exists, so a guest can never read one back
-- — not their own, not anyone else's.
drop policy if exists "anon submits a lead" on public.leads;
create policy "anon submits a lead" on public.leads
  for insert to anon, authenticated
  with check (
    -- a guest may not pre-set anything that belongs to the sales process
    status = 'new'
    and assigned_to is null
    and last_contacted_at is null
    and length(parent_name) between 2 and 120
    and length(phone) between 6 and 20
  );

-- assessment: INSERT-ONLY, same shape.
drop policy if exists "anon submits an assessment" on public.assessment_submissions;
create policy "anon submits an assessment" on public.assessment_submissions
  for insert to anon, authenticated
  with check (scores is null);   -- scoring happens server-side, never client-claimed

-- ═══════════════════════ ADMIN SURFACE ═════════════════════════════════════
-- Everything below is authenticated-only AND permission-checked. RLS here is the
-- last line of defence: a direct table call from a logged-in non-admin leaks nothing.

-- leads
drop policy if exists "staff read leads"  on public.leads;
create policy "staff read leads"  on public.leads for select to authenticated
  using (public.user_has_permission('leads','read'));
drop policy if exists "staff write leads" on public.leads;
create policy "staff write leads" on public.leads for update to authenticated
  using (public.user_has_permission('leads','write'))
  with check (public.user_has_permission('leads','write'));

-- a generic read/write pair for the rest of the operational tables
do $$
declare t text; res text;
begin
  foreach t in array array[
    'customers','enrollments','payments','follow_ups','cohorts',
    'cohort_sessions','programs','assessment_submissions','team_members'
  ] loop
    res := t;
    execute format('drop policy if exists %I on public.%I', 'staff read '||t, t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.user_has_permission(%L,''read''))',
      'staff read '||t, t, res);

    execute format('drop policy if exists %I on public.%I', 'staff write '||t, t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.user_has_permission(%L,''write'')) with check (public.user_has_permission(%L,''write''))',
      'staff write '||t, t, res, res);
  end loop;
end $$;

-- roles / role_permissions are readable by any signed-in staffer (the admin shell
-- needs them to render), writable by nobody through the client.
drop policy if exists "staff read roles" on public.roles;
create policy "staff read roles" on public.roles for select to authenticated using (true);
drop policy if exists "staff read role_permissions" on public.role_permissions;
create policy "staff read role_permissions" on public.role_permissions for select to authenticated using (true);

-- ═══════════════════════ SEAT ACCOUNTING ═══════════════════════════════════
-- seats_taken is derived state. Never let a client set it; keep it true with a
-- trigger so an oversell is impossible even if two reps save at the same instant.
create or replace function public.sync_cohort_seats()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare target uuid;
begin
  target := coalesce(new.cohort_id, old.cohort_id);
  update public.cohorts c
     set seats_taken = (
       select count(*) from public.enrollments e
       where e.cohort_id = target
         and e.status in ('reserved','paid','active','completed')
     ),
     updated_at = now()
   where c.id = target;
  return null;
end $$;
revoke execute on function public.sync_cohort_seats() from public, anon, authenticated;

drop trigger if exists trg_enrollment_seats on public.enrollments;
create trigger trg_enrollment_seats
  after insert or update or delete on public.enrollments
  for each row execute function public.sync_cohort_seats();

-- ── updated_at ─────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['programs','cohorts','leads','enrollments'] loop
    execute format('drop trigger if exists trg_touch_%I on public.%I', t, t);
    execute format(
      'create trigger trg_touch_%I before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ═══════════════════════ EXPLICIT GRANTS ═══════════════════════════════════
-- RLS only filters rows a role is already allowed to touch. The table-level GRANT
-- is the outer gate, and Supabase hands `anon` and `authenticated` broad default
-- privileges on `public` when a project is created — so without this section the
-- real posture is "whatever the platform decided", not what is written above.
--
-- Applying these migrations to a bare Postgres proved the point: every anon test
-- failed with "permission denied for table" because nothing here granted anything.
-- On Supabase the same statements would have silently ridden on the platform's
-- defaults. State the grants; don't inherit them.

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- New objects must not inherit a grant either. Without this, the next `create table`
-- is anon-accessible the moment it exists.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

grant usage on schema public to anon, authenticated;

-- ── anon: read three things, write two, nothing else ───────────────────────
grant select on public.programs        to anon;
grant select on public.cohort_sessions to anon;

-- cohorts is column-granted: `select *` must fail, which is why the app names its
-- columns explicitly in useOpenCohorts.
grant select (id, program_id, name, starts_on, ends_on, weekday, start_time,
              timezone, seats_total, seats_taken, status, instructor)
  on public.cohorts to anon;

grant insert on public.leads                  to anon;
grant insert on public.assessment_submissions to anon;

-- ── authenticated: reachable, but every row still passes the permission gate ──
grant select, insert, update, delete on
  public.leads, public.customers, public.enrollments, public.payments,
  public.follow_ups, public.cohorts, public.cohort_sessions, public.programs,
  public.assessment_submissions, public.team_members
  to authenticated;

grant select on public.roles            to authenticated;
grant select on public.role_permissions to authenticated;

-- The two RPCs the admin shell calls. Both authorize in their own bodies.
grant execute on function public.user_has_permission(text, text) to authenticated;
grant execute on function public.current_team_member()            to authenticated;
