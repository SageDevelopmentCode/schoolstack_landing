-- Configure Kindergarten Co-op isolated parent portal for rooted-meadows-demo.
-- Run in Supabase SQL Editor after add_program_parent_portal_settings migration.
-- Date: 2026-09-03

do $$
declare
  v_org_id uuid;
  v_program_id uuid;
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
    and (
      portal_slug = 'kindergarten-co-op'
      or lower(name) like '%kindergarten%co-op%'
      or lower(name) like '%kindergarten co-op%'
    )
  order by created_at asc
  limit 1;

  if v_program_id is null then
    insert into public.programs (
      organization_id,
      name,
      portal_slug,
      type,
      status,
      parent_portal_settings
    )
    values (
      v_org_id,
      'Kindergarten Co-op',
      'kindergarten-co-op',
      'school_year',
      'open',
      jsonb_build_object(
        'mode', 'isolated',
        'label', 'Kindergarten Co-op',
        'features', jsonb_build_object(
          'portal', true,
          'calendar', true,
          'messages', true,
          'feed', true,
          'billing', false,
          'children', false,
          'committees', false,
          'classroom_signups', false,
          'attendance', false
        ),
        'feature_nav', jsonb_build_object(
          'parent', jsonb_build_object(
            'items', jsonb_build_object(
              'feed', jsonb_build_object('label', 'Photos')
            )
          )
        )
      )
    )
    returning id into v_program_id;
  else
    update public.programs
    set
      portal_slug = coalesce(nullif(portal_slug, ''), 'kindergarten-co-op'),
      parent_portal_settings = jsonb_build_object(
        'mode', 'isolated',
        'label', 'Kindergarten Co-op',
        'features', jsonb_build_object(
          'portal', true,
          'calendar', true,
          'messages', true,
          'feed', true,
          'billing', false,
          'children', false,
          'committees', false,
          'classroom_signups', false,
          'attendance', false
        ),
        'feature_nav', jsonb_build_object(
          'parent', jsonb_build_object(
            'items', jsonb_build_object(
              'feed', jsonb_build_object('label', 'Photos')
            )
          )
        )
      )
    where id = v_program_id;
  end if;
end $$;
