-- ═══════════════════════════════════════════════════════════════════════════
-- Welmnt engine — the dashboard RPC
--
-- One SECURITY DEFINER function, one round trip, one place where permission is
-- checked. This is how the Catalyst dashboard works (get_dashboard_v2) and the
-- reason is worth restating: the alternative is eight client-side queries that
-- each need their own table grant, which widens the anon/authenticated surface
-- for no benefit.
--
-- Weeks run FRIDAY→THURSDAY, matching how Hazem's week actually works.
-- All date maths is in Africa/Cairo, not the server's UTC.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.get_dashboard(p_period text default 'month')
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_today   date;
  v_start   date;  v_end   date;   -- the full period, for display
  v_cutoff  date;                  -- how far the period has actually got
  v_pstart  date;  v_pend  date;
  v_days    int;
  v_bucket  text;         -- 'hour' | 'day' | 'week'
  v_nbuckets int;
  v_label   text;
  v_pulse   jsonb;
  v_series  jsonb;
  v_funnel  jsonb;
  v_leaks   jsonb;
  v_cohorts jsonb;
  v_agents  jsonb;
  v_sources jsonb;
begin
  -- Rule 5: SECURITY DEFINER bypasses RLS, so authorize the caller here.
  if not public.user_has_permission('leads', 'read') then
    raise exception 'forbidden';
  end if;

  v_today := (now() at time zone 'Africa/Cairo')::date;

  case coalesce(p_period, 'month')
    when 'today' then
      v_start := v_today; v_end := v_today; v_pstart := v_today - 1;
      v_bucket := 'hour'; v_nbuckets := 24; v_label := 'Today vs yesterday';
    when 'week' then
      -- Friday-start week. dow: Sun=0 … Sat=6, so Friday=5.
      v_start := v_today - ((extract(dow from v_today)::int - 5 + 7) % 7);
      v_end   := v_start + 6; v_pstart := v_start - 7;
      v_bucket := 'day'; v_nbuckets := 7; v_label := 'This week vs last week';
    when 'quarter' then
      v_start := date_trunc('quarter', v_today)::date;
      v_end   := (date_trunc('quarter', v_today) + interval '3 months - 1 day')::date;
      v_pstart := (date_trunc('quarter', v_today) - interval '3 months')::date;
      v_bucket := 'week'; v_nbuckets := 13; v_label := 'This quarter vs last';
    else
      v_start := date_trunc('month', v_today)::date;
      v_end   := (date_trunc('month', v_today) + interval '1 month - 1 day')::date;
      v_pstart := (date_trunc('month', v_today) - interval '1 month')::date;
      v_bucket := 'day'; v_label := 'This month vs last month';
      v_nbuckets := (v_end - v_start) + 1;
  end case;

  -- LIKE FOR LIKE. Compare the part of this period that has actually happened
  -- against the SAME stretch of the last one — day 1-15 of September against
  -- day 1-15 of August, not against the whole of August.
  --
  -- The obvious implementation (previous period = the equal-length window ending
  -- the day before this one started) makes every month read "down" until the
  -- month ends, because a half-finished period is being measured against a
  -- complete one. That is a dashboard that cries wolf for 29 days out of 30.
  v_cutoff := least(v_end, v_today);
  v_pend   := v_pstart + (v_cutoff - v_start);
  v_days   := (v_end - v_start) + 1;

  -- ── pulse ────────────────────────────────────────────────────────────────
  -- Four numbers, each against the aligned previous period. Catalyst carries
  -- gross/net/cash-in/cash-out because it has installments and refunds; Welmnt
  -- is one price paid once, so "collected" and "outstanding" say everything.
  with
  l  as (select count(*) c from leads where (created_at at time zone 'Africa/Cairo')::date between v_start and v_cutoff),
  lp as (select count(*) c from leads where (created_at at time zone 'Africa/Cairo')::date between v_pstart and v_pend),
  e  as (select count(*) c from enrollments
         where status in ('paid','active','completed')
           and (created_at at time zone 'Africa/Cairo')::date between v_start and v_cutoff),
  ep as (select count(*) c from enrollments
         where status in ('paid','active','completed')
           and (created_at at time zone 'Africa/Cairo')::date between v_pstart and v_pend),
  r  as (select coalesce(sum(amount_egp),0) c from payments
         where status='paid' and (paid_at at time zone 'Africa/Cairo')::date between v_start and v_cutoff),
  rp as (select coalesce(sum(amount_egp),0) c from payments
         where status='paid' and (paid_at at time zone 'Africa/Cairo')::date between v_pstart and v_pend),
  o  as (select coalesce(sum(amount_egp),0) c from payments where status='pending')
  select jsonb_build_object(
    'new_leads',   jsonb_build_object('current', l.c,  'previous', lp.c),
    'enrolled',    jsonb_build_object('current', e.c,  'previous', ep.c),
    'collected',   jsonb_build_object('current', r.c,  'previous', rp.c),
    'outstanding', jsonb_build_object('current', o.c,  'previous', 0)
  ) into v_pulse
  from l, lp, e, ep, r, rp, o;

  -- ── series ───────────────────────────────────────────────────────────────
  -- Buckets aligned BY INDEX so bucket i of this period lines up with bucket i
  -- of the last one. That alignment is what lets the chart draw the previous
  -- period as a dashed line behind the current solid one.
  with idx as (select generate_series(0, v_nbuckets - 1) i),
  bounds as (
    select i,
      case v_bucket
        when 'hour' then (v_start::timestamp + (i || ' hours')::interval)
        when 'week' then (v_start::timestamp + (i || ' weeks')::interval)
        else             (v_start::timestamp + (i || ' days')::interval)
      end as cur_from,
      case v_bucket
        when 'hour' then (v_pstart::timestamp + (i || ' hours')::interval)
        when 'week' then (v_pstart::timestamp + (i || ' weeks')::interval)
        else             (v_pstart::timestamp + (i || ' days')::interval)
      end as prev_from,
      case v_bucket when 'hour' then interval '1 hour'
                    when 'week' then interval '1 week'
                    else interval '1 day' end as span
    from idx
  ),
  b as (
    select i, cur_from, prev_from, span,
           cur_from + span as cur_to, prev_from + span as prev_to,
           case v_bucket when 'hour' then to_char(cur_from, 'HH24:00')
                         else to_char(cur_from, 'DD Mon') end as label,
           case v_bucket when 'hour' then to_char(prev_from, 'HH24:00')
                         else to_char(prev_from, 'DD Mon') end as plabel,
           cur_from > (now() at time zone 'Africa/Cairo') as future
    from bounds
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'label', b.label, 'plabel', b.plabel, 'future', b.future,
           'leads_c', (select count(*) from leads x
                        where x.created_at at time zone 'Africa/Cairo' >= b.cur_from
                          and x.created_at at time zone 'Africa/Cairo' <  b.cur_to),
           'leads_p', (select count(*) from leads x
                        where x.created_at at time zone 'Africa/Cairo' >= b.prev_from
                          and x.created_at at time zone 'Africa/Cairo' <  b.prev_to),
           'enr_c',   (select count(*) from enrollments x
                        where x.status in ('paid','active','completed')
                          and x.created_at at time zone 'Africa/Cairo' >= b.cur_from
                          and x.created_at at time zone 'Africa/Cairo' <  b.cur_to),
           'enr_p',   (select count(*) from enrollments x
                        where x.status in ('paid','active','completed')
                          and x.created_at at time zone 'Africa/Cairo' >= b.prev_from
                          and x.created_at at time zone 'Africa/Cairo' <  b.prev_to),
           'rev_c',   (select coalesce(sum(amount_egp),0) from payments x
                        where x.status='paid'
                          and x.paid_at at time zone 'Africa/Cairo' >= b.cur_from
                          and x.paid_at at time zone 'Africa/Cairo' <  b.cur_to),
           'rev_p',   (select coalesce(sum(amount_egp),0) from payments x
                        where x.status='paid'
                          and x.paid_at at time zone 'Africa/Cairo' >= b.prev_from
                          and x.paid_at at time zone 'Africa/Cairo' <  b.prev_to)
         ) order by b.i), '[]'::jsonb)
  into v_series from b;

  -- ── funnel ───────────────────────────────────────────────────────────────
  -- `leads.status` holds the CURRENT stage, not a history, so a step counts
  -- everyone at or past it. A lead marked lost still reached whatever it reached,
  -- but we cannot know where — so lost/junk count only as contacted. That
  -- understates the later steps slightly, which is the honest direction to err.
  with s as (
    select status, last_contacted_at from leads
    where (created_at at time zone 'Africa/Cairo')::date between v_start and v_cutoff
  )
  select jsonb_build_object(
    'leads',     (select count(*) from s),
    'contacted', (select count(*) from s where status <> 'new' or last_contacted_at is not null),
    'qualified', (select count(*) from s where status in ('qualified','trial_booked','won')),
    'booked',    (select count(*) from s where status in ('trial_booked','won')),
    'paid',      (select count(*) from s where status = 'won')
  ) into v_funnel;

  -- ── leaks ────────────────────────────────────────────────────────────────
  -- Each of these is a thing quietly costing money right now. They are NOT
  -- period-bounded — an uncontacted lead from last month is still uncontacted.
  select jsonb_build_object(
    'uncontacted_48h', (select count(*) from leads
                         where status = 'new' and last_contacted_at is null
                           and created_at < now() - interval '48 hours'),
    'missed_follow_ups', (select count(*) from follow_ups where status = 'missed'),
    'overdue_follow_ups', (select count(*) from follow_ups
                            where status = 'pending' and scheduled_date < v_today),
    'today_follow_ups', (select count(*) from follow_ups
                          where status = 'pending' and scheduled_date = v_today),
    'stalled_7d', (select count(*) from leads
                    where status in ('contacted','qualified','trial_booked')
                      and coalesce(last_contacted_at, created_at) < now() - interval '7 days'),
    'unpaid_reserved', (select count(*) from enrollments where status = 'reserved'),
    'unpaid_amount', (select coalesce(sum(amount_egp),0) from enrollments where status = 'reserved'),
    -- The one that matters most in a live-cohort business: a group starting soon
    -- with seats still open. Every empty seat at kickoff is revenue that cannot
    -- be recovered later — the cohort has already started.
    'underfilled_soon', (select count(*) from cohorts
                          where status = 'upcoming'
                            and starts_on between v_today and v_today + 21
                            and seats_taken < seats_total)
  ) into v_leaks;

  -- ── cohort fill ──────────────────────────────────────────────────────────
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', c.id, 'name', c.name, 'programme', p.title, 'accent', p.accent,
           'starts_on', c.starts_on, 'status', c.status,
           'seats_taken', c.seats_taken, 'seats_total', c.seats_total,
           'days_out', c.starts_on - v_today
         ) order by c.starts_on), '[]'::jsonb)
  into v_cohorts
  from cohorts c join programs p on p.id = c.program_id
  where c.status in ('upcoming','running');

  -- ── agents ───────────────────────────────────────────────────────────────
  select coalesce(jsonb_agg(x order by x->>'revenue' desc), '[]'::jsonb) into v_agents
  from (
    select jsonb_build_object(
      'id', tm.id, 'name', tm.name,
      'assigned', (select count(*) from leads l where l.assigned_to = tm.id
                    and (l.created_at at time zone 'Africa/Cairo')::date between v_start and v_cutoff),
      'won', (select count(*) from leads l where l.assigned_to = tm.id and l.status = 'won'
               and (l.updated_at at time zone 'Africa/Cairo')::date between v_start and v_cutoff),
      'revenue', (select coalesce(sum(pay.amount_egp),0)
                    from payments pay join enrollments en on en.id = pay.enrollment_id
                   where pay.status='paid' and en.sold_by = tm.id
                     and (pay.paid_at at time zone 'Africa/Cairo')::date between v_start and v_cutoff)
    ) x
    from team_members tm where tm.is_active
  ) t;

  -- ── where leads came from ────────────────────────────────────────────────
  select coalesce(jsonb_agg(jsonb_build_object('source', src, 'leads', n) order by n desc), '[]'::jsonb)
  into v_sources
  from (
    select coalesce(nullif(utm_source,''), source, 'direct') as src, count(*) n
    from leads
    where (created_at at time zone 'Africa/Cairo')::date between v_start and v_cutoff
    group by 1
  ) s;

  return jsonb_build_object(
    'period', jsonb_build_object(
      'key', coalesce(p_period,'month'), 'label', v_label,
      'start', v_start, 'end', v_end, 'prev_start', v_pstart, 'prev_end', v_pend),
    'pulse', v_pulse, 'series', v_series, 'funnel', v_funnel,
    'leaks', v_leaks, 'cohorts', v_cohorts, 'agents', v_agents, 'sources', v_sources
  );
end $$;

revoke execute on function public.get_dashboard(text) from public, anon;
grant  execute on function public.get_dashboard(text) to authenticated;
