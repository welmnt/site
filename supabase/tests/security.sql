-- ═══════════════════════════════════════════════════════════════════════════
-- Welmnt engine — security tests
--
-- Run against a THROWAWAY database, never a real project:
--   bash supabase/tests/run.sh
--
-- Every assertion below is a rule from Catalyst's CLAUDE.md, made executable.
-- If one of these stops behaving, a real hole has opened.
-- ═══════════════════════════════════════════════════════════════════════════
\set ON_ERROR_STOP off

insert into public.cohorts (program_id, name, starts_on, seats_total, status, meeting_url, notes)
select id, 'Test cohort', current_date + 7, 3, 'upcoming', 'https://SECRET-zoom-link', 'internal only'
from public.programs where slug = 'ages-10-13';

\echo '════════════ AS anon ════════════'
set role anon;
\echo '1.  active programmes                EXPECT 3'
select count(*) from public.programs;
\echo '2.  safe cohort columns              EXPECT 1 row'
select name, seats_taken, seats_total from public.cohorts;
\echo '3.  cohorts.meeting_url              EXPECT denied'
select meeting_url from public.cohorts;
\echo '4.  select * on cohorts              EXPECT denied'
select * from public.cohorts;
\echo '5.  insert a lead                    EXPECT INSERT 0 1'
insert into public.leads (parent_name, phone, child_age) values ('Test Parent','01000000000',11);
\echo '6.  read leads back                  EXPECT denied'
select count(*) from public.leads;
\echo '7.  insert lead pre-set to won       EXPECT policy violation'
insert into public.leads (parent_name, phone, status) values ('Cheater','01000000001','won');
\echo '8.  insert lead pre-assigned         EXPECT policy violation'
insert into public.leads (parent_name, phone, assigned_to) values ('Cheater2','01000000002',gen_random_uuid());
\echo '9.  permission gate                  EXPECT denied'
select public.user_has_permission('leads','write');
\echo '10. team_members                     EXPECT denied'
select count(*) from public.team_members;
\echo '11. payments                         EXPECT denied'
select count(*) from public.payments;
\echo '12. update a cohort                  EXPECT denied'
update public.cohorts set seats_total = 999;
reset role;

\echo ''
\echo '════════════ AS authenticated, NOT a team member ════════════'
\echo 'A login proves identity, never authorization.'
set role authenticated;
\echo '13. read leads                       EXPECT 0 rows'
select count(*) from public.leads;
\echo '14. update a lead                    EXPECT UPDATE 0'
update public.leads set status = 'won';
reset role;

\echo ''
\echo '════════════ seat accounting ════════════'
insert into public.customers (name, phone) values ('Parent A','0111');
insert into public.enrollments (customer_id, cohort_id, child_name, amount_egp, status)
select c.id, k.id, 'Child A', 3000, 'paid' from public.customers c, public.cohorts k limit 1;
\echo '15. seats_taken after 1 enrollment   EXPECT 1'
select seats_taken, seats_total from public.cohorts;
\echo '16. oversell guard                   EXPECT check violation'
update public.cohorts set seats_total = 0;
