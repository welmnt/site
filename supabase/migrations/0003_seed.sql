-- ═══════════════════════════════════════════════════════════════════════════
-- Welmnt engine — seed
--
-- ⚠️ PROGRAM NAMES AND COPY ARE PLACEHOLDERS. The engine is what's real here:
-- three age bands, 8 sessions over 2 months, 3,000 EGP per child, live online.
-- Rename and rewrite in the admin once the curriculum is written.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.roles (key, label) values
  ('admin', 'Admin'),
  ('sales', 'Sales')
on conflict (key) do nothing;

-- Admin: everything. Sales: the funnel, and read-only on money.
insert into public.role_permissions (role_id, resource, action)
select r.id, x.resource, x.action
from public.roles r
cross join (values
  ('leads','read'),('leads','write'),
  ('follow_ups','read'),('follow_ups','write'),
  ('customers','read'),('customers','write'),
  ('enrollments','read'),('enrollments','write'),
  ('payments','read'),('payments','write'),
  ('cohorts','read'),('cohorts','write'),
  ('cohort_sessions','read'),('cohort_sessions','write'),
  ('programs','read'),('programs','write'),
  ('assessment_submissions','read'),('assessment_submissions','write'),
  ('team_members','read'),('team_members','write')
) as x(resource, action)
where r.key = 'admin'
on conflict do nothing;

insert into public.role_permissions (role_id, resource, action)
select r.id, x.resource, x.action
from public.roles r
cross join (values
  ('leads','read'),('leads','write'),
  ('follow_ups','read'),('follow_ups','write'),
  ('customers','read'),('customers','write'),
  ('enrollments','read'),('enrollments','write'),
  ('cohorts','read'),
  ('cohort_sessions','read'),
  ('programs','read'),
  ('assessment_submissions','read'),
  ('payments','read')           -- sales can SEE a payment landed, not record one
) as x(resource, action)
where r.key = 'sales'
on conflict do nothing;

-- ── the three age bands ────────────────────────────────────────────────────
insert into public.programs
  (slug, title, title_ar, age_min, age_max, price_egp, sessions_count, duration_weeks, summary, accent, sort_order)
values
  ('ages-5-9',   'Little Minds', 'براعم',  5,  9, 3000, 8, 8,
   'Eight live sessions over two months for children aged 5–9 — feelings, friendship and self-regulation, taught in play.',
   'k2', 1),
  ('ages-10-13', 'Growing Minds','ناشئة', 10, 13, 3000, 8, 8,
   'Eight live sessions over two months for children aged 10–13 — confidence, handling pressure, and a healthy relationship with screens.',
   'k1', 2),
  ('ages-14-17', 'Rising Minds', 'شباب',  14, 17, 3000, 8, 8,
   'Eight live sessions over two months for teens aged 14–17 — identity, anxiety, cyberbullying and decisions that stick.',
   'k5', 3)
on conflict (slug) do nothing;
