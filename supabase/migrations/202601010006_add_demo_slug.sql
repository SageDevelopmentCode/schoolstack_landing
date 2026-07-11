-- Link CRM prospect → product demo route (/demo/[slug])
-- Run in Supabase SQL editor if the table already exists.

alter table public.schools
  add column if not exists demo_slug text;

comment on column public.schools.demo_slug is
  'Slug for /demo/[slug]. Must match a route + schoolDemoRegistry key. NULL = no demo linked.';

-- Backfill Athena (adjust school_id if your row differs)
update public.schools
set demo_slug = 'athena-microacademy'
where school_id = 'athena-micro-academy-austin';
