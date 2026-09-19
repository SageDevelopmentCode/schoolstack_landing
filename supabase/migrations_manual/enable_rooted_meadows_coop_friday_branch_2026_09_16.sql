-- Enable Friday Branch in Kindergarten Co-op isolated parent portals.
-- Requires org-level parent.friday_branch (see enable_rooted_meadows_friday_branch_2026_09_16.sql).
-- Run in Supabase SQL Editor.
-- Date: 2026-09-16

do $$
declare
  v_slug text;
  v_org_id uuid;
  v_program_id uuid;
  v_settings jsonb;
  v_program_order jsonb;
begin
  foreach v_slug in array array['rooted-meadows', 'rooted-meadows-demo'] loop
    select id into v_org_id
    from public.organizations
    where slug = v_slug
    limit 1;

    if v_org_id is null then
      raise notice 'Skipping % — organization not found', v_slug;
      continue;
    end if;

    select id, parent_portal_settings
    into v_program_id, v_settings
    from public.programs
    where organization_id = v_org_id
      and portal_slug = 'kindergarten-co-op'
    limit 1;

    if v_program_id is null then
      raise notice 'Skipping % — kindergarten-co-op program not found', v_slug;
      continue;
    end if;

    v_settings := jsonb_set(
      coalesce(v_settings, '{}'::jsonb),
      '{features,friday_branch}',
      'true'::jsonb,
      true
    );

    v_program_order := v_settings #> '{feature_nav,parent,order}';
    if v_program_order is not null
      and jsonb_typeof(v_program_order) = 'array'
      and not exists (
        select 1
        from jsonb_array_elements_text(v_program_order) elem
        where elem = 'friday_branch'
      )
    then
      v_settings := jsonb_set(
        v_settings,
        '{feature_nav,parent,order}',
        v_program_order || '["friday_branch"]'::jsonb,
        true
      );
    end if;

    update public.programs
    set parent_portal_settings = v_settings
    where id = v_program_id;

    raise notice 'Enabled Friday Branch on kindergarten-co-op for %', v_slug;
  end loop;
end $$;
