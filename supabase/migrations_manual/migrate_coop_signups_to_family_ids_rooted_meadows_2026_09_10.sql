-- Migrate legacy co-op supply/schedule sign-up strings to family_id arrays.
-- Run after: coop_family_id_signups_2026_09_10.sql
-- Date: 2026-09-10
--
-- PRE-FLIGHT: report unmatched legacy names (run separately)
--
-- with program_targets as (
--   select p.id as program_id, p.organization_id
--   from public.programs p
--   join public.organizations o on o.id = p.organization_id
--   where o.slug = 'rooted-meadows'
--     and p.portal_slug = 'kindergarten-co-op'
-- ),
-- enrolled_families as (
--   select distinct
--     pt.program_id,
--     s.family_id,
--     coalesce(
--       nullif(trim(f.name), ''),
--       case
--         when nullif(trim(s.last_name), '') is not null
--           then 'The ' || trim(s.last_name) || ' family'
--         else 'Family'
--       end
--     ) as family_label
--   from program_targets pt
--   join public.enrollments e
--     on e.program_id = pt.program_id
--    and e.organization_id = pt.organization_id
--    and e.status = 'enrolled'
--   join public.students s on s.id = e.student_id
--   join public.families f on f.id = s.family_id
-- ),
-- supply_unmatched as (
--   select
--     'supply' as source,
--     i.id as record_id,
--     i.name as record_label,
--     legacy_name
--   from public.program_coop_supply_items i
--   join program_targets pt on pt.program_id = i.program_id
--   cross join lateral unnest(coalesce(i.assigned_families, '{}'::text[])) as legacy_name
--   where cardinality(coalesce(i.assigned_family_ids, '{}'::uuid[])) = 0
--     and not exists (
--       select 1
--       from enrolled_families ef
--       where ef.program_id = i.program_id
--         and lower(ef.family_label) = lower(trim(legacy_name))
--     )
-- ),
-- schedule_unmatched as (
--   select
--     'schedule_instructor' as source,
--     w.id as record_id,
--     w.week_name as record_label,
--     legacy_name
--   from public.program_coop_teaching_schedule_weeks w
--   join program_targets pt on pt.program_id = w.program_id
--   cross join lateral unnest(coalesce(w.parent_instructors, '{}'::text[])) as legacy_name
--   where cardinality(coalesce(w.instructor_family_ids, '{}'::uuid[])) = 0
--     and not exists (
--       select 1
--       from enrolled_families ef
--       where ef.program_id = w.program_id
--         and lower(ef.family_label) = lower(trim(legacy_name))
--     )
--   union all
--   select
--     'schedule_assistant' as source,
--     w.id,
--     w.week_name,
--     legacy_name
--   from public.program_coop_teaching_schedule_weeks w
--   join program_targets pt on pt.program_id = w.program_id
--   cross join lateral unnest(coalesce(w.parent_assistants, '{}'::text[])) as legacy_name
--   where cardinality(coalesce(w.assistant_family_ids, '{}'::uuid[])) = 0
--     and not exists (
--       select 1
--       from enrolled_families ef
--       where ef.program_id = w.program_id
--         and lower(ef.family_label) = lower(trim(legacy_name))
--     )
-- )
-- select * from supply_unmatched
-- union all
-- select * from schedule_unmatched
-- order by source, record_label, legacy_name;

begin;

do $$
declare
  v_org_slug text := 'rooted-meadows';
  v_portal_slug text := 'kindergarten-co-op';
  v_program_id uuid;
  v_updated_supply integer := 0;
  v_updated_weeks integer := 0;
begin
  select p.id
  into v_program_id
  from public.programs p
  join public.organizations o on o.id = p.organization_id
  where o.slug = v_org_slug
    and p.portal_slug = v_portal_slug
  limit 1;

  if v_program_id is null then
    raise exception 'Program % not found for org %.', v_portal_slug, v_org_slug;
  end if;

  with enrolled_families as (
    select distinct
      s.family_id,
      coalesce(
        nullif(trim(f.name), ''),
        case
          when nullif(trim(s.last_name), '') is not null
            then 'The ' || trim(s.last_name) || ' family'
          else 'Family'
        end
      ) as family_label
    from public.enrollments e
    join public.students s on s.id = e.student_id
    join public.families f on f.id = s.family_id
    where e.program_id = v_program_id
      and e.status = 'enrolled'
  ),
  mapped_supply as (
    select
      i.id as item_id,
      array_agg(distinct ef.family_id order by ef.family_id) as family_ids
    from public.program_coop_supply_items i
    cross join lateral unnest(coalesce(i.assigned_families, '{}'::text[])) as legacy_name(name)
    join enrolled_families ef
      on lower(ef.family_label) = lower(trim(legacy_name.name))
    where i.program_id = v_program_id
      and cardinality(coalesce(i.assigned_family_ids, '{}'::uuid[])) = 0
    group by i.id
  )
  update public.program_coop_supply_items i
  set assigned_family_ids = mapped_supply.family_ids
  from mapped_supply
  where i.id = mapped_supply.item_id;

  get diagnostics v_updated_supply = row_count;

  with enrolled_families as (
    select distinct
      s.family_id,
      coalesce(
        nullif(trim(f.name), ''),
        case
          when nullif(trim(s.last_name), '') is not null
            then 'The ' || trim(s.last_name) || ' family'
          else 'Family'
        end
      ) as family_label
    from public.enrollments e
    join public.students s on s.id = e.student_id
    join public.families f on f.id = s.family_id
    where e.program_id = v_program_id
      and e.status = 'enrolled'
  ),
  mapped_instructors as (
    select
      w.id as week_id,
      array_agg(distinct ef.family_id order by ef.family_id) as family_ids
    from public.program_coop_teaching_schedule_weeks w
    cross join lateral unnest(coalesce(w.parent_instructors, '{}'::text[])) as legacy_name(name)
    join enrolled_families ef
      on lower(ef.family_label) = lower(trim(legacy_name.name))
    where w.program_id = v_program_id
      and cardinality(coalesce(w.instructor_family_ids, '{}'::uuid[])) = 0
    group by w.id
  ),
  mapped_assistants as (
    select
      w.id as week_id,
      array_agg(distinct ef.family_id order by ef.family_id) as family_ids
    from public.program_coop_teaching_schedule_weeks w
    cross join lateral unnest(coalesce(w.parent_assistants, '{}'::text[])) as legacy_name(name)
    join enrolled_families ef
      on lower(ef.family_label) = lower(trim(legacy_name.name))
    where w.program_id = v_program_id
      and cardinality(coalesce(w.assistant_family_ids, '{}'::uuid[])) = 0
    group by w.id
  )
  update public.program_coop_teaching_schedule_weeks w
  set
    instructor_family_ids = coalesce(mi.family_ids, w.instructor_family_ids),
    assistant_family_ids = coalesce(ma.family_ids, w.assistant_family_ids)
  from mapped_instructors mi
  full outer join mapped_assistants ma on ma.week_id = mi.week_id
  where w.id = coalesce(mi.week_id, ma.week_id)
    and w.program_id = v_program_id;

  get diagnostics v_updated_weeks = row_count;

  raise notice
    'Migrated co-op sign-ups for program %: % supply items, % schedule weeks updated.',
    v_program_id,
    v_updated_supply,
    v_updated_weeks;
end $$;

commit;
