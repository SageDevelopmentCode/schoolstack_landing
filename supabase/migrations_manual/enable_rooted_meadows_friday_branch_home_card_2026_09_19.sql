-- Enable Friday Branch home card for Rooted Meadows orgs.
-- Parent portal home → Friday Branch summary card (requires parent.friday_branch).
-- Run in Supabase SQL Editor.
-- Date: 2026-09-19

do $$
declare
  v_slug text;
  v_org_id uuid;
  v_features jsonb;
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
      '{parent_home,friday_branch}',
      'true'::jsonb,
      true
    );

    update public.organization_settings
    set features = v_features,
        updated_at = now()
    where organization_id = v_org_id;

    raise notice 'Enabled Friday Branch home card for %', v_slug;
  end loop;
end $$;
