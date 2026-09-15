-- ═══════════════════════════════════════════════════════════════════════════
-- Constrain programme slugs to a safe shape.
--
-- Dependabot flags an open-redirect in react-router's <Link>/useNavigate
-- (backslash handling). It is only exploitable where a navigation target is
-- attacker-controlled. In this app the only non-literal targets are
-- `/programmes/${slug}` and `/enrol?programme=${slug}`, and `programs` is
-- SELECT-only for anon — a slug can only be written by staff who already hold
-- far more power than an open redirect would give them.
--
-- So it is not reachable today. This constraint makes it not reachable by
-- CONSTRUCTION rather than by argument, which survives someone later adding a
-- slug field to a public form without remembering why it mattered.
--
-- The alternative fix Dependabot offers is react-router v7 — a breaking major
-- on a freshly-deployed app, for a hole this closes outright.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.programs drop constraint if exists programs_slug_shape;
alter table public.programs add constraint programs_slug_shape
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 60);
