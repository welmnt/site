-- ═══════════════════════════════════════════════════════════════════════════
-- Welmnt engine — core schema
--
-- Security posture is lifted verbatim from the Catalyst production app
-- (qa-ai-future-start/CLAUDE.md). Every rule there maps to a vulnerability that
-- was LIVE in production. Do not relax any of it:
--   * RLS enabled + default-deny on every table.
--   * anon gets INSERT-only on public-form tables it cannot read back.
--   * RLS is ROW-level, not column-level — secret columns get column grants.
--   * SECURITY DEFINER functions authorize the caller IN THEIR OWN BODY.
--   * Postgres grants EXECUTE TO PUBLIC by default — revoke from PUBLIC, not anon.
--   * search_path is pinned on every function.
--
-- Delivery model note: Welmnt sells LIVE cohorts (8 sessions / 2 months / 3,000 EGP
-- per child), not evergreen recorded courses. So enrollment is a SEAT IN A COHORT
-- with a start date and a capacity — not an entitlement to content. That is the one
-- structural difference from the Catalyst schema.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto with schema extensions;

-- ── enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type cohort_status as enum ('draft','upcoming','running','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new','contacted','qualified','trial_booked','won','lost','junk');
exception when duplicate_object then null; end $$;

do $$ begin
  create type enrollment_status as enum ('reserved','paid','active','completed','cancelled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type followup_status as enum ('pending','completed','missed');
exception when duplicate_object then null; end $$;

-- ── programs — the three age bands ─────────────────────────────────────────
create table if not exists public.programs (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  title_ar      text,
  age_min       int  not null,
  age_max       int  not null,
  price_egp     int  not null,
  sessions_count int not null default 8,
  duration_weeks int not null default 8,
  summary       text,
  summary_ar    text,
  outcomes      text[] not null default '{}',
  accent        text not null default 'k1',   -- maps to the five-construct scale
  sort_order    int  not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── cohorts — a scheduled run of a program ─────────────────────────────────
create table if not exists public.cohorts (
  id            uuid primary key default gen_random_uuid(),
  program_id    uuid not null references public.programs(id) on delete restrict,
  name          text not null,
  starts_on     date not null,
  ends_on       date,
  weekday       int,                       -- 0=Sun … 6=Sat
  start_time    time,
  timezone      text not null default 'Africa/Cairo',
  seats_total   int  not null default 12,
  seats_taken   int  not null default 0,
  status        cohort_status not null default 'draft',
  instructor    text,                      -- NOT hard-coded to Dr. Walaa: she fronts the brand,
                                           -- but a live model needs more than one deliverer to scale.
  meeting_url   text,                      -- 🔒 NEVER anon-readable. Column-granted below.
  notes         text,                      -- 🔒 internal
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint seats_sane check (seats_taken >= 0 and seats_taken <= seats_total)
);
create index if not exists idx_cohorts_program on public.cohorts(program_id);
create index if not exists idx_cohorts_status  on public.cohorts(status, starts_on);

-- ── the 8 sessions inside a cohort ─────────────────────────────────────────
create table if not exists public.cohort_sessions (
  id           uuid primary key default gen_random_uuid(),
  cohort_id    uuid not null references public.cohorts(id) on delete cascade,
  idx          int  not null,              -- 1..8
  title        text,
  scheduled_at timestamptz,
  status       text not null default 'scheduled',
  created_at   timestamptz not null default now(),
  unique (cohort_id, idx)
);
create index if not exists idx_sessions_cohort on public.cohort_sessions(cohort_id);

-- ── leads — the public funnel's insert-only table ──────────────────────────
create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  parent_name    text not null,
  phone          text not null,
  email          text,
  child_name     text,
  child_age      int,
  program_id     uuid references public.programs(id) on delete set null,
  cohort_id      uuid references public.cohorts(id) on delete set null,
  message        text,
  source         text not null default 'website',
  utm_source     text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  fbc            text, fbp text,
  status         lead_status not null default 'new',
  assigned_to    uuid,                      -- team_members.id, set by admin only
  last_contacted_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_leads_status   on public.leads(status, created_at desc);
create index if not exists idx_leads_assigned on public.leads(assigned_to);

-- ── customers — the paying parent ──────────────────────────────────────────
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null unique,
  email       text,
  lead_id     uuid references public.leads(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── enrollments — one child, one seat, one cohort ──────────────────────────
create table if not exists public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers(id) on delete restrict,
  cohort_id    uuid not null references public.cohorts(id) on delete restrict,
  child_name   text not null,
  child_age    int,
  amount_egp   int  not null,
  status       enrollment_status not null default 'reserved',
  sold_by      uuid,                        -- team_members.id
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_enr_cohort   on public.enrollments(cohort_id);
create index if not exists idx_enr_customer on public.enrollments(customer_id);

-- ── payments ───────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete restrict,
  provider      text not null default 'kashier',
  provider_ref  text,
  amount_egp    int  not null,
  status        payment_status not null default 'pending',
  paid_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_pay_enrollment on public.payments(enrollment_id);

-- ── follow-ups — the rep's work queue ──────────────────────────────────────
create table if not exists public.follow_ups (
  id             uuid primary key default gen_random_uuid(),
  lead_id        uuid not null references public.leads(id) on delete cascade,
  scheduled_date date not null,
  owner_id       uuid,
  notes          text,
  status         followup_status not null default 'pending',
  completed_at   timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists idx_fu_lead on public.follow_ups(lead_id);
create index if not exists idx_fu_due  on public.follow_ups(scheduled_date, status);

-- ── assessment — ported from welmnt-connect-suite (the Family Academy kit) ──
create table if not exists public.assessment_submissions (
  id          uuid primary key default gen_random_uuid(),
  parent_name text,
  phone       text,
  email       text,
  child_age   int,
  answers     jsonb not null,
  scores      jsonb,
  lead_id     uuid references public.leads(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── team + permissions ─────────────────────────────────────────────────────
create table if not exists public.roles (
  id    uuid primary key default gen_random_uuid(),
  key   text not null unique,              -- 'admin' | 'sales'
  label text not null
);

create table if not exists public.role_permissions (
  role_id  uuid not null references public.roles(id) on delete cascade,
  resource text not null,                  -- 'leads' | 'enrollments' | 'payments' | …
  action   text not null,                  -- 'read' | 'write' | 'delete'
  primary key (role_id, resource, action)
);

create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  auth_uid   uuid unique,                  -- auth.users.id
  name       text not null,
  email      text not null unique,
  role_id    uuid references public.roles(id) on delete set null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_team_auth on public.team_members(auth_uid);
