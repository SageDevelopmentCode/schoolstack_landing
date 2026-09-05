-- Demo bulletin posts for Rooted Meadows (manual paste only)
-- Date: 2026-09-06
-- Requires: add_bulletin_multi_audience_2026_09_07.sql (audiences + program_ids columns)

with org as (
  select id
  from public.organizations
  where slug = 'rooted-meadows'
  limit 1
)
insert into public.school_bulletin_posts (
  organization_id,
  title,
  body,
  status,
  audiences,
  program_ids,
  published_at
)
select
  org.id,
  seed.title,
  seed.body,
  'published',
  seed.audiences,
  seed.program_ids,
  now() - (seed.days_ago || ' days')::interval
from org
cross join (
  values
    (
      'Welcome back to school',
      'We are excited for a wonderful year ahead. Please review the attached calendar highlights and reach out with any questions.',
      array['school_wide']::text[],
      '{}'::uuid[],
      2
    ),
    (
      'Staff professional development day',
      'Campus will be closed to families on Friday while staff participate in professional development.',
      array['teachers']::text[],
      '{}'::uuid[],
      0
    )
) as seed(title, body, audiences, program_ids, days_ago)
on conflict do nothing;

insert into public.school_bulletin_posts (
  organization_id,
  title,
  body,
  status,
  audiences,
  program_ids,
  published_at
)
select
  org.id,
  'Kindergarten co-op picnic',
  'Program families are invited to our co-op picnic next week. Bring a dish to share!',
  'published',
  array['program']::text[],
  array[program.id]::uuid[],
  now() - interval '1 day'
from public.organizations org
join public.programs program
  on program.organization_id = org.id
where org.slug = 'rooted-meadows'
  and program.slug = 'kindergarten-co-op'
on conflict do nothing;
