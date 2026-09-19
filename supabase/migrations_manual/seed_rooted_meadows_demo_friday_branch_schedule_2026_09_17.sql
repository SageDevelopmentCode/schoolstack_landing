-- Seed Friday Branch schedule for rooted-meadows-demo.
-- Imported from 26_-_BRANCH_SCHEDULE_-_Sheet1.csv (Blocks 2–4).
-- Run in Supabase SQL Editor after add_friday_branch_schedule migration.
-- Date: 2026-09-17
--
-- Expected row counts after run:
--   friday_branch_blocks:      3
--   friday_branch_time_slots: 15  (Block 2: 6, Block 3: 5, Block 4: 4)
--   friday_branch_classes:    20  (Block 2: 8, Block 3: 6, Block 4: 6)
--
-- Skipped from CSV:
--   Block 2 @ 9:00 Class B (orphan age only)
--   Block 3 @ 2:00 (incomplete row)
--   Block 4 @ 1:00 (empty)

do $$
declare
  v_org_id uuid;
  v_block_2_id uuid := 'b2010001-0000-4000-8000-000000000001'::uuid;
  v_block_3_id uuid := 'b2010001-0000-4000-8000-000000000002'::uuid;
  v_block_4_id uuid := 'b2010001-0000-4000-8000-000000000003'::uuid;
begin
  select id into v_org_id
  from public.organizations
  where slug = 'rooted-meadows-demo'
  limit 1;

  if v_org_id is null then
    raise exception 'Organization rooted-meadows-demo not found';
  end if;

  delete from public.friday_branch_blocks
  where organization_id = v_org_id;

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
  values
    (
      v_block_2_id,
      v_org_id,
      'Block 2',
      '2026-10-02'::date,
      '2026-10-30'::date,
      'sky',
      '',
      'upcoming',
      0
    ),
    (
      v_block_3_id,
      v_org_id,
      'Block 3',
      '2026-11-06'::date,
      '2026-11-20'::date,
      'berry',
      '',
      'upcoming',
      1
    ),
    (
      v_block_4_id,
      v_org_id,
      'Block 4',
      '2026-12-04'::date,
      '2026-12-18'::date,
      'sage',
      '',
      'upcoming',
      2
    );

  insert into public.friday_branch_time_slots (
    id,
    block_id,
    organization_id,
    time,
    sort_order
  )
  values
    -- Block 2
    ('b2020001-0000-4000-8000-000000000001'::uuid, v_block_2_id, v_org_id, '9:00', 0),
    ('b2020001-0000-4000-8000-000000000002'::uuid, v_block_2_id, v_org_id, '10:00', 1),
    ('b2020001-0000-4000-8000-000000000003'::uuid, v_block_2_id, v_org_id, '11:00', 2),
    ('b2020001-0000-4000-8000-000000000004'::uuid, v_block_2_id, v_org_id, '12:00', 3),
    ('b2020001-0000-4000-8000-000000000005'::uuid, v_block_2_id, v_org_id, '1:00', 4),
    ('b2020001-0000-4000-8000-000000000006'::uuid, v_block_2_id, v_org_id, '2:00', 5),
    -- Block 3
    ('b2020001-0000-4000-8000-000000000011'::uuid, v_block_3_id, v_org_id, '9:00', 0),
    ('b2020001-0000-4000-8000-000000000012'::uuid, v_block_3_id, v_org_id, '10:00', 1),
    ('b2020001-0000-4000-8000-000000000013'::uuid, v_block_3_id, v_org_id, '11:00', 2),
    ('b2020001-0000-4000-8000-000000000014'::uuid, v_block_3_id, v_org_id, '12:00', 3),
    ('b2020001-0000-4000-8000-000000000015'::uuid, v_block_3_id, v_org_id, '1:00', 4),
    -- Block 4
    ('b2020001-0000-4000-8000-000000000021'::uuid, v_block_4_id, v_org_id, '9:00', 0),
    ('b2020001-0000-4000-8000-000000000022'::uuid, v_block_4_id, v_org_id, '10:00', 1),
    ('b2020001-0000-4000-8000-000000000023'::uuid, v_block_4_id, v_org_id, '11:00', 2),
    ('b2020001-0000-4000-8000-000000000024'::uuid, v_block_4_id, v_org_id, '12:00', 3);

  insert into public.friday_branch_classes (
    id,
    time_slot_id,
    organization_id,
    name,
    location,
    age_group,
    teacher,
    family_visible,
    sort_order
  )
  values
    -- Block 2 @ 9:00
    (
      'b2030001-0000-4000-8000-000000000001'::uuid,
      'b2020001-0000-4000-8000-000000000001'::uuid,
      v_org_id,
      'Jumprope',
      'The Meadow',
      '5+',
      '',
      true,
      0
    ),
    -- Block 2 @ 10:00
    (
      'b2030001-0000-4000-8000-000000000002'::uuid,
      'b2020001-0000-4000-8000-000000000002'::uuid,
      v_org_id,
      'Bookworms/World Games',
      'La Casita',
      '9 yr -12 yr',
      '',
      true,
      0
    ),
    (
      'b2030001-0000-4000-8000-000000000003'::uuid,
      'b2020001-0000-4000-8000-000000000002'::uuid,
      v_org_id,
      'Books & Tea',
      'The Cabin',
      '6-8',
      '',
      true,
      1
    ),
    -- Block 2 @ 11:00
    (
      'b2030001-0000-4000-8000-000000000004'::uuid,
      'b2020001-0000-4000-8000-000000000003'::uuid,
      v_org_id,
      'Intro to Dance',
      'The Meadow',
      'k-3',
      '',
      true,
      0
    ),
    -- Block 2 @ 12:00
    (
      'b2030001-0000-4000-8000-000000000005'::uuid,
      'b2020001-0000-4000-8000-000000000004'::uuid,
      v_org_id,
      'Intro to Dance 4-8',
      'The Meadow',
      '4-8',
      '',
      true,
      0
    ),
    -- Block 2 @ 1:00
    (
      'b2030001-0000-4000-8000-000000000006'::uuid,
      'b2020001-0000-4000-8000-000000000005'::uuid,
      v_org_id,
      'Biking Explorers',
      'Off Site',
      '',
      '',
      true,
      0
    ),
    (
      'b2030001-0000-4000-8000-000000000007'::uuid,
      'b2020001-0000-4000-8000-000000000005'::uuid,
      v_org_id,
      'Bridge Engineering',
      'Off Site',
      '',
      '',
      true,
      1
    ),
    -- Block 2 @ 2:00
    (
      'b2030001-0000-4000-8000-000000000008'::uuid,
      'b2020001-0000-4000-8000-000000000006'::uuid,
      v_org_id,
      '100 Ways to Peel Potatos',
      'Off Site',
      '',
      '',
      true,
      0
    ),
    -- Block 3 @ 9:00
    (
      'b2030001-0000-4000-8000-000000000009'::uuid,
      'b2020001-0000-4000-8000-000000000011'::uuid,
      v_org_id,
      'VIVIAN PROJECT',
      '',
      '',
      '',
      true,
      0
    ),
    -- Block 3 @ 10:00
    (
      'b2030001-0000-4000-8000-000000000010'::uuid,
      'b2020001-0000-4000-8000-000000000012'::uuid,
      v_org_id,
      'Bookworms/World Games',
      'La Casita',
      '9 yr -12 yr',
      '',
      true,
      0
    ),
    (
      'b2030001-0000-4000-8000-000000000011'::uuid,
      'b2020001-0000-4000-8000-000000000012'::uuid,
      v_org_id,
      'Books & Tea',
      'The Cabin',
      '6-8',
      '',
      true,
      1
    ),
    -- Block 3 @ 11:00
    (
      'b2030001-0000-4000-8000-000000000012'::uuid,
      'b2020001-0000-4000-8000-000000000013'::uuid,
      v_org_id,
      'Intro to Dance k-3',
      'The Meadow',
      'k-3',
      '',
      true,
      0
    ),
    -- Block 3 @ 12:00
    (
      'b2030001-0000-4000-8000-000000000013'::uuid,
      'b2020001-0000-4000-8000-000000000014'::uuid,
      v_org_id,
      'Intro to Dance 4-8',
      'The Meadow',
      '4-8',
      '',
      true,
      0
    ),
    -- Block 3 @ 1:00
    (
      'b2030001-0000-4000-8000-000000000014'::uuid,
      'b2020001-0000-4000-8000-000000000015'::uuid,
      v_org_id,
      'Orienteering club',
      'Various Off Site locations',
      '',
      '',
      true,
      0
    ),
    -- Block 4 @ 9:00
    (
      'b2030001-0000-4000-8000-000000000015'::uuid,
      'b2020001-0000-4000-8000-000000000021'::uuid,
      v_org_id,
      'VIVIAN PROJECT',
      '',
      '',
      '',
      true,
      0
    ),
    -- Block 4 @ 10:00
    (
      'b2030001-0000-4000-8000-000000000016'::uuid,
      'b2020001-0000-4000-8000-000000000022'::uuid,
      v_org_id,
      'Bookworms/World Games',
      'La Casita',
      '9 yr -12 yr',
      '',
      true,
      0
    ),
    (
      'b2030001-0000-4000-8000-000000000017'::uuid,
      'b2020001-0000-4000-8000-000000000022'::uuid,
      v_org_id,
      'Books & Tea',
      'The Cabin',
      '6-8',
      '',
      true,
      1
    ),
    -- Block 4 @ 11:00
    (
      'b2030001-0000-4000-8000-000000000018'::uuid,
      'b2020001-0000-4000-8000-000000000023'::uuid,
      v_org_id,
      'Intro to Dance k-3',
      'The Meadow',
      'k-3',
      '',
      true,
      0
    ),
    -- Block 4 @ 12:00
    (
      'b2030001-0000-4000-8000-000000000019'::uuid,
      'b2020001-0000-4000-8000-000000000024'::uuid,
      v_org_id,
      'Intro to Dance 4-8',
      'The Meadow',
      '4-8',
      '',
      true,
      0
    ),
    (
      'b2030001-0000-4000-8000-000000000020'::uuid,
      'b2020001-0000-4000-8000-000000000024'::uuid,
      v_org_id,
      'Bookbinding',
      '',
      '',
      '',
      true,
      1
    );

  raise notice 'Seeded Friday Branch schedule for rooted-meadows-demo (3 blocks, 15 slots, 20 classes).';
end $$;

-- Verify:
-- select b.label, b.start_date, b.end_date, count(s.id) as slots
-- from friday_branch_blocks b
-- left join friday_branch_time_slots s on s.block_id = b.id
-- join organizations o on o.id = b.organization_id
-- where o.slug = 'rooted-meadows-demo'
-- group by b.id
-- order by b.sort_order;
