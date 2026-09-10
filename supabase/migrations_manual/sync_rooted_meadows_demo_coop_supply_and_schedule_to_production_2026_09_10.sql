-- Sync Kindergarten Co-op supply list + teaching schedule: rooted-meadows-demo → rooted-meadows.
-- Copies color legend, supply items (including assigned_families sign-ups), and teaching schedule weeks.
-- Read-only on demo; safe to re-run (clears target rows first).
--
-- Run in Supabase SQL Editor after add_program_coop_supply_list and add_program_coop_teaching_schedule migrations.
-- Date: 2026-09-10
--
-- ═══════════════════════════════════════════════════════════════════════════════
-- PRE-FLIGHT — run separately to confirm current state
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- select
--   o.slug,
--   p.id as program_id,
--   (select count(*) from public.program_coop_supply_color_legend l where l.program_id = p.id) as legend_rows,
--   (select count(*) from public.program_coop_supply_items i where i.program_id = p.id) as supply_items,
--   (select count(*) from public.program_coop_teaching_schedule_weeks w where w.program_id = p.id) as schedule_weeks
-- from public.organizations o
-- join public.programs p on p.organization_id = o.id and p.portal_slug = 'kindergarten-co-op'
-- where o.slug in ('rooted-meadows-demo', 'rooted-meadows')
-- order by o.slug;
--
-- Expected before: demo = 3 legend / 122 items / 38 weeks; prod = 0 / 0 / 0

begin;

do $$
declare
  v_source_slug text := 'rooted-meadows-demo';
  v_target_slug text := 'rooted-meadows';
  v_portal_slug text := 'kindergarten-co-op';

  v_source_org_id uuid;
  v_target_org_id uuid;
  v_source_program_id uuid;
  v_target_program_id uuid;
  v_target_settings jsonb;

  v_source_legend_count integer;
  v_source_items_count integer;
  v_source_weeks_count integer;

  v_copied_legend integer := 0;
  v_copied_items integer := 0;
  v_copied_weeks integer := 0;
begin
  select id into v_source_org_id
  from public.organizations
  where slug = v_source_slug;

  select id into v_target_org_id
  from public.organizations
  where slug = v_target_slug;

  if v_source_org_id is null then
    raise exception 'Source org "%" not found.', v_source_slug;
  end if;

  if v_target_org_id is null then
    raise exception 'Target org "%" not found.', v_target_slug;
  end if;

  select id into v_source_program_id
  from public.programs
  where organization_id = v_source_org_id
    and portal_slug = v_portal_slug
  limit 1;

  select id, parent_portal_settings
  into v_target_program_id, v_target_settings
  from public.programs
  where organization_id = v_target_org_id
    and portal_slug = v_portal_slug
  limit 1;

  if v_source_program_id is null then
    raise exception 'Kindergarten Co-op program not found on source org "%".', v_source_slug;
  end if;

  if v_target_program_id is null then
    raise exception 'Kindergarten Co-op program not found on target org "%".', v_target_slug;
  end if;

  select count(*) into v_source_legend_count
  from public.program_coop_supply_color_legend
  where program_id = v_source_program_id;

  select count(*) into v_source_items_count
  from public.program_coop_supply_items
  where program_id = v_source_program_id;

  select count(*) into v_source_weeks_count
  from public.program_coop_teaching_schedule_weeks
  where program_id = v_source_program_id;

  if v_source_legend_count = 0 and v_source_items_count = 0 and v_source_weeks_count = 0 then
    raise exception 'Source program has no supply list or teaching schedule data to copy.';
  end if;

  -- Clear existing target rows (items first due to color_id references in app logic)
  delete from public.program_coop_supply_items
  where program_id = v_target_program_id;

  delete from public.program_coop_supply_color_legend
  where program_id = v_target_program_id;

  delete from public.program_coop_teaching_schedule_weeks
  where program_id = v_target_program_id;

  -- Copy color legend
  insert into public.program_coop_supply_color_legend (
    id,
    program_id,
    organization_id,
    color_id,
    hex,
    label,
    sort_order
  )
  select
    gen_random_uuid(),
    v_target_program_id,
    v_target_org_id,
    l.color_id,
    l.hex,
    l.label,
    l.sort_order
  from public.program_coop_supply_color_legend l
  where l.program_id = v_source_program_id
  order by l.sort_order;

  get diagnostics v_copied_legend = row_count;

  -- Copy supply items (including assigned_families sign-ups)
  insert into public.program_coop_supply_items (
    id,
    program_id,
    organization_id,
    name,
    item_type,
    usage_timing,
    months,
    color_id,
    assigned_families,
    where_to_buy,
    quantity,
    quantity_label,
    estimated_price,
    sort_order
  )
  select
    gen_random_uuid(),
    v_target_program_id,
    v_target_org_id,
    i.name,
    i.item_type,
    i.usage_timing,
    i.months,
    i.color_id,
    i.assigned_families,
    i.where_to_buy,
    i.quantity,
    i.quantity_label,
    i.estimated_price,
    i.sort_order
  from public.program_coop_supply_items i
  where i.program_id = v_source_program_id
  order by i.sort_order;

  get diagnostics v_copied_items = row_count;

  -- Copy teaching schedule weeks (including parent instructor/assistant assignments)
  insert into public.program_coop_teaching_schedule_weeks (
    id,
    program_id,
    organization_id,
    start_date,
    end_date,
    parent_instructors,
    parent_assistants,
    week_name,
    seasonal_theme,
    character_lesson,
    celebration_event,
    sort_order
  )
  select
    gen_random_uuid(),
    v_target_program_id,
    v_target_org_id,
    w.start_date,
    w.end_date,
    w.parent_instructors,
    w.parent_assistants,
    w.week_name,
    w.seasonal_theme,
    w.character_lesson,
    w.celebration_event,
    w.sort_order
  from public.program_coop_teaching_schedule_weeks w
  where w.program_id = v_source_program_id
  order by w.sort_order;

  get diagnostics v_copied_weeks = row_count;

  -- Enable org-level supply_list feature (parity with demo)
  update public.organization_settings
  set features = jsonb_set(
    coalesce(features, '{}'::jsonb),
    '{parent,supply_list}',
    'true'::jsonb,
    true
  )
  where organization_id = v_target_org_id;

  -- Enable program-level supply_list feature flag
  update public.programs
  set parent_portal_settings = jsonb_set(
    coalesce(v_target_settings, '{}'::jsonb),
    '{features,supply_list}',
    'true'::jsonb,
    true
  )
  where id = v_target_program_id;

  raise notice
    'Copied Kindergarten Co-op data from % to %: % legend rows, % supply items, % schedule weeks.',
    v_source_slug,
    v_target_slug,
    v_copied_legend,
    v_copied_items,
    v_copied_weeks;
end $$;

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- POST-FLIGHT — run separately to verify
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- select
--   o.slug,
--   (select count(*) from public.program_coop_supply_color_legend l
--    join public.programs p on p.id = l.program_id
--    where p.organization_id = o.id and p.portal_slug = 'kindergarten-co-op') as legend_rows,
--   (select count(*) from public.program_coop_supply_items i
--    join public.programs p on p.id = i.program_id
--    where p.organization_id = o.id and p.portal_slug = 'kindergarten-co-op') as supply_items,
--   (select count(*) from public.program_coop_teaching_schedule_weeks w
--    join public.programs p on p.id = w.program_id
--    where p.organization_id = o.id and p.portal_slug = 'kindergarten-co-op') as schedule_weeks,
--   os.features->'parent'->>'supply_list' as org_supply_list,
--   p.parent_portal_settings->'features'->>'supply_list' as program_supply_list
-- from public.organizations o
-- join public.programs p on p.organization_id = o.id and p.portal_slug = 'kindergarten-co-op'
-- left join public.organization_settings os on os.organization_id = o.id
-- where o.slug in ('rooted-meadows-demo', 'rooted-meadows')
-- order by o.slug;
--
-- Expected after: both orgs show 3 legend / 122 items / 38 weeks;
-- rooted-meadows org_supply_list = true, program_supply_list = true
