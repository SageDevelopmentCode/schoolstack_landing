-- Enable parent Curriculum tab for rooted-meadows-demo Kindergarten Co-op.
-- Run in Supabase SQL Editor after add_program_coop_curriculum migration.
-- Date: 2026-09-04

do $$
declare
  v_org_id uuid;
  v_program_id uuid;
  v_settings jsonb;
begin
  select id into v_org_id
  from public.organizations
  where slug = 'rooted-meadows-demo'
  limit 1;

  if v_org_id is null then
    raise exception 'Organization rooted-meadows-demo not found';
  end if;

  select id, parent_portal_settings
  into v_program_id, v_settings
  from public.programs
  where organization_id = v_org_id
    and portal_slug = 'kindergarten-co-op'
  limit 1;

  if v_program_id is null then
    raise exception 'Kindergarten Co-op program not found for rooted-meadows-demo';
  end if;

  update public.organization_settings
  set features = jsonb_set(
    coalesce(features, '{}'::jsonb),
    '{parent,curriculum}',
    'true'::jsonb,
    true
  )
  where organization_id = v_org_id;

  update public.programs
  set parent_portal_settings = jsonb_set(
    jsonb_set(
      coalesce(v_settings, '{}'::jsonb),
      '{features,curriculum}',
      'true'::jsonb,
      true
    ),
    '{coop_mode}',
    'true'::jsonb,
    true
  )
  where id = v_program_id;
end $$;
