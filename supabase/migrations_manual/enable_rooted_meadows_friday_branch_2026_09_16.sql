-- Enable Friday Branch placeholder tabs for Rooted Meadows orgs.
-- Admin: My School → Friday Branch (Coming Soon)
-- Parent (main + co-op): More → Friday Branch (Coming Soon)
-- Run in Supabase SQL Editor.
-- Date: 2026-09-16

do $$
declare
  v_slug text;
  v_org_id uuid;
  v_program_id uuid;
  v_features jsonb;
  v_parent_order jsonb;
  v_admin_children jsonb;
  v_program_settings jsonb;
  v_program_order jsonb;
  v_friday_child jsonb := '{"key":"friday_branch","label":"Friday Branch","icon":"calendar-days","enabled":true}'::jsonb;
  v_friday_item jsonb := '{"group":"Main","label":"Friday Branch","icon":"calendar-days"}'::jsonb;
begin
  foreach v_slug in array array['rooted-meadows', 'rooted-meadows-demo'] loop
    select os.organization_id, os.features
    into v_org_id, v_features
    from public.organization_settings os
    join public.organizations o on o.id = os.organization_id
    where o.slug = v_slug
    limit 1;

    if v_org_id is null then
      raise notice 'Skipping % — organization not found', v_slug;
      continue;
    end if;

    v_features := coalesce(v_features, '{}'::jsonb);

    v_features := jsonb_set(
      v_features,
      '{parent,friday_branch}',
      'true'::jsonb,
      true
    );

    v_parent_order := coalesce(v_features #> '{feature_nav,parent,order}', '[]'::jsonb);
    if not exists (
      select 1
      from jsonb_array_elements_text(v_parent_order) elem
      where elem = 'friday_branch'
    ) then
      v_parent_order := v_parent_order || '["friday_branch"]'::jsonb;
    end if;
    v_features := jsonb_set(
      v_features,
      '{feature_nav,parent,order}',
      v_parent_order,
      true
    );

    v_features := jsonb_set(
      v_features,
      '{feature_nav,parent,items,friday_branch}',
      v_friday_item,
      true
    );

    if v_features #> '{feature_nav,admin,items,my_school}' is null then
      v_features := jsonb_set(
        v_features,
        '{feature_nav,admin,items,my_school}',
        '{"group":"Main","label":"My School","icon":"school"}'::jsonb,
        true
      );
    end if;

    v_admin_children := coalesce(
      v_features #> '{feature_nav,admin,items,my_school,children}',
      '[]'::jsonb
    );

    if not exists (
      select 1
      from jsonb_array_elements(v_admin_children) child
      where child->>'key' = 'friday_branch'
    ) then
      v_admin_children := v_admin_children || jsonb_build_array(v_friday_child);
    else
      v_admin_children := (
        select coalesce(
          jsonb_agg(
            case
              when child->>'key' = 'friday_branch'
              then jsonb_set(child, '{enabled}', 'true'::jsonb, true)
              else child
            end
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(v_admin_children) child
      );
    end if;

    v_features := jsonb_set(
      v_features,
      '{feature_nav,admin,items,my_school,children}',
      v_admin_children,
      true
    );

    update public.organization_settings
    set features = v_features, updated_at = now()
    where organization_id = v_org_id;

    select id, parent_portal_settings
    into v_program_id, v_program_settings
    from public.programs
    where organization_id = v_org_id
      and portal_slug = 'kindergarten-co-op'
    limit 1;

    if v_program_id is not null then
      v_program_settings := jsonb_set(
        coalesce(v_program_settings, '{}'::jsonb),
        '{features,friday_branch}',
        'true'::jsonb,
        true
      );

      v_program_order := v_program_settings #> '{feature_nav,parent,order}';
      if v_program_order is not null
        and jsonb_typeof(v_program_order) = 'array'
        and not exists (
          select 1
          from jsonb_array_elements_text(v_program_order) elem
          where elem = 'friday_branch'
        )
      then
        v_program_settings := jsonb_set(
          v_program_settings,
          '{feature_nav,parent,order}',
          v_program_order || '["friday_branch"]'::jsonb,
          true
        );
      end if;

      update public.programs
      set parent_portal_settings = v_program_settings
      where id = v_program_id;

      raise notice 'Enabled Friday Branch (org + kindergarten-co-op) for %', v_slug;
    else
      raise notice 'Enabled Friday Branch (org only) for % — kindergarten-co-op not found', v_slug;
    end if;
  end loop;
end $$;
