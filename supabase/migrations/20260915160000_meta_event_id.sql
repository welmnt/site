-- Store the browser's Meta event id on the lead.
--
-- The browser pixel and a Conversions API send are two reports of the SAME event.
-- Meta deduplicates them by matching event_name + event_id. Without this column the
-- server has no id to quote, so a CAPI send would double-count every lead — and an
-- inflated Lead count trains the campaign on a number that isn't real.
alter table public.leads add column if not exists meta_event_id text;

-- A guest may set it (they generate it), but it stays the shape we expect.
alter table public.leads drop constraint if exists leads_meta_event_id_shape;
alter table public.leads add constraint leads_meta_event_id_shape
  check (meta_event_id is null or meta_event_id ~ '^[A-Za-z0-9._-]{8,80}$');
