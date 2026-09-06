-- Sample co-op curriculum discussion messages for rooted-meadows-demo Kindergarten Co-op.
-- Run in Supabase SQL Editor after add_program_coop_curriculum_discussion migration.
-- Date: 2026-09-04

do $$
declare
  v_org_id uuid;
  v_program_id uuid;
  v_guardian_id uuid;
begin
  select id into v_org_id
  from public.organizations
  where slug = 'rooted-meadows-demo'
  limit 1;

  if v_org_id is null then
    raise exception 'Organization rooted-meadows-demo not found';
  end if;

  select id into v_program_id
  from public.programs
  where organization_id = v_org_id
    and portal_slug = 'kindergarten-co-op'
  limit 1;

  if v_program_id is null then
    raise exception 'Kindergarten Co-op program not found for rooted-meadows-demo';
  end if;

  select g.id into v_guardian_id
  from public.guardians g
  join public.families f on f.id = g.family_id
  where f.organization_id = v_org_id
    and f.id = '14ffb928-3922-4ece-a1e9-90d51ef4594d'
  order by g.created_at asc
  limit 1;

  if v_guardian_id is null then
    raise exception 'Cecilia family guardian not found for rooted-meadows-demo';
  end if;

  insert into public.program_coop_curriculum_discussion_messages (
    organization_id,
    program_id,
    sender_guardian_id,
    body
  )
  values
    (
      v_org_id,
      v_program_id,
      v_guardian_id,
      'We started Lesson 1 this week — the cabin illustration on the cover is a nice warm-up before the number line work.'
    ),
    (
      v_org_id,
      v_program_id,
      v_guardian_id,
      'Anyone else pacing one lesson per day, or splitting across two shorter sessions?'
    )
  on conflict do nothing;
end $$;
