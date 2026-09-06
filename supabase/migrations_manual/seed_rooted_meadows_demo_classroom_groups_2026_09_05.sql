-- Optional demo seed: Rooted Meadows kindergarten coop classroom groups
-- Run manually after add_classroom_staff_assignments_2026_09_05.sql
-- Purpose: two coop classrooms with a shared lead teacher for walkthrough demos.

do $$
declare
  v_org_id uuid;
  v_program_id uuid;
  v_teacher_id uuid;
  v_classroom_a_id uuid;
  v_classroom_b_id uuid;
begin
  select id into v_org_id
  from public.organizations
  where slug = 'rooted-meadows'
  limit 1;

  if v_org_id is null then
    raise notice 'rooted-meadows org not found — skipping seed';
    return;
  end if;

  select id into v_program_id
  from public.programs
  where organization_id = v_org_id
    and slug = 'kindergarten-coop'
  limit 1;

  select sm.id into v_teacher_id
  from public.staff_members sm
  join public.organization_memberships om
    on om.organization_id = sm.organization_id
   and om.user_id = sm.user_id
  where sm.organization_id = v_org_id
    and om.role = 'teacher'
    and om.status = 'active'
    and sm.status = 'active'
  order by sm.created_at
  limit 1;

  select id into v_classroom_a_id
  from public.classrooms
  where organization_id = v_org_id
    and name = 'Kindergarten Co-op · Group A'
  limit 1;

  select id into v_classroom_b_id
  from public.classrooms
  where organization_id = v_org_id
    and name = 'Kindergarten Co-op · Group B'
  limit 1;

  if v_classroom_a_id is null then
    insert into public.classrooms (organization_id, program_id, name, status)
    values (v_org_id, v_program_id, 'Kindergarten Co-op · Group A', 'open')
    returning id into v_classroom_a_id;
  end if;

  if v_classroom_b_id is null then
    insert into public.classrooms (organization_id, program_id, name, status)
    values (v_org_id, v_program_id, 'Kindergarten Co-op · Group B', 'open')
    returning id into v_classroom_b_id;
  end if;

  if v_teacher_id is not null then
    insert into public.classroom_staff_assignments (
      organization_id,
      classroom_id,
      staff_member_id,
      role
    )
    values
      (v_org_id, v_classroom_a_id, v_teacher_id, 'lead'),
      (v_org_id, v_classroom_b_id, v_teacher_id, 'lead')
    on conflict (classroom_id, staff_member_id) do nothing;
  end if;
end $$;
