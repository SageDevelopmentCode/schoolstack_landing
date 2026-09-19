-- Promoted to supabase/migrations/20261008_fix_friday_branch_time_conflict_race.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Serialize same-student / same-block / same-slot-time enrollments to close TOCTOU race.
-- Run after: enroll_friday_branch_student_atomic_2026_09_19.sql

create or replace function public.enroll_friday_branch_student_atomic(
  p_organization_id uuid,
  p_class_id uuid,
  p_family_id uuid,
  p_student_id uuid,
  p_source text default 'parent'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.friday_branch_classes;
  v_block_id uuid;
  v_block_status text;
  v_slot_time text;
  v_existing_id uuid;
  v_existing_status text;
  v_confirmed_count int;
  v_status text;
  v_enrollment_id uuid;
begin
  if p_source not in ('parent', 'admin') then
    raise exception 'invalid_source'
      using errcode = 'P0001';
  end if;

  select c.*
  into v_class
  from public.friday_branch_classes c
  where c.id = p_class_id
    and c.organization_id = p_organization_id
  for update;

  if not found then
    raise exception 'class_not_found'
      using errcode = 'P0001';
  end if;

  select ts.block_id, ts.time, b.status
  into v_block_id, v_slot_time, v_block_status
  from public.friday_branch_time_slots ts
  join public.friday_branch_blocks b on b.id = ts.block_id
  where ts.id = v_class.time_slot_id
    and ts.organization_id = p_organization_id;

  if not found then
    raise exception 'class_not_found'
      using errcode = 'P0001';
  end if;

  if not v_class.family_visible then
    raise exception 'class_not_visible'
      using errcode = 'P0001';
  end if;

  if v_block_status not in ('current', 'upcoming') then
    raise exception 'block_not_open'
      using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.students s
    where s.id = p_student_id
      and s.family_id = p_family_id
      and s.organization_id = p_organization_id
  ) then
    raise exception 'student_not_in_family'
      using errcode = 'P0001';
  end if;

  select e.id, e.status
  into v_existing_id, v_existing_status
  from public.friday_branch_class_enrollments e
  where e.class_id = p_class_id
    and e.student_id = p_student_id;

  if v_existing_status in ('confirmed', 'waitlisted') then
    raise exception 'already_enrolled'
      using errcode = 'P0001';
  end if;

  -- Serialize same student + block + slot-time enrollments across different classes.
  perform pg_advisory_xact_lock(
    hashtext(p_student_id::text || v_block_id::text),
    hashtext(v_slot_time)
  );

  if exists (
    select 1
    from public.friday_branch_class_enrollments e
    join public.friday_branch_classes c on c.id = e.class_id
    join public.friday_branch_time_slots ts on ts.id = c.time_slot_id
    where e.organization_id = p_organization_id
      and e.block_id = v_block_id
      and e.student_id = p_student_id
      and e.status in ('confirmed', 'waitlisted')
      and e.class_id <> p_class_id
      and ts.time = v_slot_time
  ) then
    raise exception 'time_conflict'
      using errcode = 'P0001';
  end if;

  select count(*)::int
  into v_confirmed_count
  from public.friday_branch_class_enrollments
  where organization_id = p_organization_id
    and class_id = p_class_id
    and status = 'confirmed';

  if v_class.capacity is null or v_confirmed_count < v_class.capacity then
    v_status := 'confirmed';
  else
    v_status := 'waitlisted';
  end if;

  if v_existing_id is not null then
    update public.friday_branch_class_enrollments
    set status = v_status,
        source = p_source,
        block_id = v_block_id
    where id = v_existing_id
    returning id into v_enrollment_id;
  else
    insert into public.friday_branch_class_enrollments (
      organization_id,
      class_id,
      block_id,
      student_id,
      family_id,
      status,
      source
    ) values (
      p_organization_id,
      p_class_id,
      v_block_id,
      p_student_id,
      p_family_id,
      v_status,
      p_source
    )
    returning id into v_enrollment_id;
  end if;

  return jsonb_build_object(
    'enrollment_id', v_enrollment_id,
    'status', v_status
  );
end;
$$;

revoke all on function public.enroll_friday_branch_student_atomic(uuid, uuid, uuid, uuid, text)
  from public, authenticated;

grant execute on function public.enroll_friday_branch_student_atomic(uuid, uuid, uuid, uuid, text)
  to service_role;
