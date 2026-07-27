-- 2026-07-26: Copy organization_progress_log entries from timeline org to production org.
-- Timeline: rooted-meadows-school (public /timeline/rooted-meadows-school)
-- Production admin: rooted-meadows (/school/rooted-meadows/admin/mudkitchen)
-- Safe to re-run (idempotent).

insert into public.organization_progress_log (
  organization_id,
  entry_date,
  phase_number,
  phase_title,
  title,
  summary,
  highlights,
  published,
  created_at,
  updated_at
)
select
  prod.id,
  src.entry_date,
  src.phase_number,
  src.phase_title,
  src.title,
  src.summary,
  src.highlights,
  src.published,
  src.created_at,
  src.updated_at
from public.organization_progress_log src
join public.organizations timeline on timeline.id = src.organization_id
join public.organizations prod on prod.slug = 'rooted-meadows'
where timeline.slug = 'rooted-meadows-school'
on conflict (organization_id, entry_date) do nothing;
