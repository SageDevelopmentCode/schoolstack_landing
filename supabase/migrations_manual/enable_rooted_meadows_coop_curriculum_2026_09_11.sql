-- Enable parent Curriculum tab for rooted-meadows Kindergarten Co-op.
-- Production already has 4 curriculum PDFs uploaded; only feature flags are missing.
-- Run in Supabase SQL Editor. Safe to re-run.
-- Date: 2026-09-11

do $$
declare
  v_org_id uuid;
  v_program_id uuid;
  v_settings jsonb;
begin
  select id into v_org_id
  from public.organizations
  where slug = 'rooted-meadows'
  limit 1;

  if v_org_id is null then
    raise exception 'Organization rooted-meadows not found';
  end if;

  select id, parent_portal_settings
  into v_program_id, v_settings
  from public.programs
  where organization_id = v_org_id
    and portal_slug = 'kindergarten-co-op'
  limit 1;

  if v_program_id is null then
    raise exception 'Kindergarten Co-op program not found for rooted-meadows';
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

-- POST-FLIGHT — run separately to verify
--
-- select
--   o.slug,
--   os.features->'parent'->>'curriculum' as org_curriculum,
--   p.parent_portal_settings->'features'->>'curriculum' as program_curriculum,
--   (select count(*) from public.program_coop_curriculum c where c.program_id = p.id) as pdf_count
-- from public.organizations o
-- join public.programs p on p.organization_id = o.id and p.portal_slug = 'kindergarten-co-op'
-- left join public.organization_settings os on os.organization_id = o.id
-- where o.slug = 'rooted-meadows';
