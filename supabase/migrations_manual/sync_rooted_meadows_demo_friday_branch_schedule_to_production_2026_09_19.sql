-- Sync Friday Branch schedule: rooted-meadows-demo → rooted-meadows.
-- Copies blocks, time slots, and classes only — does NOT copy enrollments (sign-ups).
-- Read-only on demo; safe to re-run (clears target schedule first).
--
-- Run in Supabase SQL Editor after add_friday_branch_schedule migration.
-- Date: 2026-09-19
--
-- ═══════════════════════════════════════════════════════════════════════════════
-- PRE-FLIGHT — run separately to confirm current state
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- select
--   o.slug,
--   (select count(*) from public.friday_branch_blocks b where b.organization_id = o.id) as blocks,
--   (select count(*) from public.friday_branch_time_slots s where s.organization_id = o.id) as slots,
--   (select count(*) from public.friday_branch_classes c where c.organization_id = o.id) as classes,
--   (select count(*) from public.friday_branch_class_enrollments e where e.organization_id = o.id) as enrollments
-- from public.organizations o
-- where o.slug in ('rooted-meadows-demo', 'rooted-meadows')
-- order by o.slug;
--
-- Expected before: demo = 3 blocks / 15 slots / 20 classes / 3 enrollments;
--                  prod = 0 / 0 / 0 / 0

begin;

create temp table _fb_vars (
  source_org_id uuid not null,
  target_org_id uuid not null
) on commit drop;

insert into _fb_vars (source_org_id, target_org_id)
select s.id, t.id
from public.organizations s
cross join public.organizations t
where s.slug = 'rooted-meadows-demo'
  and t.slug = 'rooted-meadows';

-- Fail fast if orgs are missing
select 1 / 0
where not exists (select 1 from _fb_vars);

-- Fail fast if source has no schedule
select 1 / 0
where not exists (
  select 1
  from public.friday_branch_blocks b
  join _fb_vars v on v.source_org_id = b.organization_id
);

create temp table _fb_block_map (
  source_id uuid primary key,
  target_id uuid not null
) on commit drop;

create temp table _fb_slot_map (
  source_id uuid primary key,
  target_id uuid not null
) on commit drop;

-- Clear existing target schedule (enrollments first, then blocks cascade slots + classes)
delete from public.friday_branch_class_enrollments
where organization_id = (select target_org_id from _fb_vars);

delete from public.friday_branch_blocks
where organization_id = (select target_org_id from _fb_vars);

-- Build block ID map
insert into _fb_block_map (source_id, target_id)
select b.id, gen_random_uuid()
from public.friday_branch_blocks b
join _fb_vars v on v.source_org_id = b.organization_id
order by b.sort_order;

-- Copy blocks
insert into public.friday_branch_blocks (
  id,
  organization_id,
  label,
  start_date,
  end_date,
  accent,
  description,
  status,
  sort_order
)
select
  m.target_id,
  v.target_org_id,
  b.label,
  b.start_date,
  b.end_date,
  b.accent,
  b.description,
  b.status,
  b.sort_order
from public.friday_branch_blocks b
join _fb_block_map m on m.source_id = b.id
join _fb_vars v on v.source_org_id = b.organization_id
order by b.sort_order;

-- Build slot ID map
insert into _fb_slot_map (source_id, target_id)
select s.id, gen_random_uuid()
from public.friday_branch_time_slots s
join _fb_block_map m on m.source_id = s.block_id
join _fb_vars v on v.source_org_id = s.organization_id
order by s.sort_order;

-- Copy time slots
insert into public.friday_branch_time_slots (
  id,
  block_id,
  organization_id,
  time,
  sort_order
)
select
  sm.target_id,
  bm.target_id,
  v.target_org_id,
  s.time,
  s.sort_order
from public.friday_branch_time_slots s
join _fb_slot_map sm on sm.source_id = s.id
join _fb_block_map bm on bm.source_id = s.block_id
join _fb_vars v on v.source_org_id = s.organization_id
order by s.sort_order;

-- Copy classes (no enrollments)
insert into public.friday_branch_classes (
  id,
  time_slot_id,
  organization_id,
  name,
  location,
  age_group,
  teacher,
  family_visible,
  capacity,
  sort_order
)
select
  gen_random_uuid(),
  sm.target_id,
  v.target_org_id,
  c.name,
  c.location,
  c.age_group,
  c.teacher,
  c.family_visible,
  c.capacity,
  c.sort_order
from public.friday_branch_classes c
join _fb_slot_map sm on sm.source_id = c.time_slot_id
join _fb_vars v on v.source_org_id = c.organization_id
order by c.sort_order;

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- POST-FLIGHT — run separately to verify
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- select
--   o.slug,
--   (select count(*) from public.friday_branch_blocks b where b.organization_id = o.id) as blocks,
--   (select count(*) from public.friday_branch_time_slots s where s.organization_id = o.id) as slots,
--   (select count(*) from public.friday_branch_classes c where c.organization_id = o.id) as classes,
--   (select count(*) from public.friday_branch_class_enrollments e where e.organization_id = o.id) as enrollments
-- from public.organizations o
-- where o.slug in ('rooted-meadows-demo', 'rooted-meadows')
-- order by o.slug;
--
-- Expected after: demo = 3 / 15 / 20 / 3 (unchanged);
--                 prod = 3 / 15 / 20 / 0
