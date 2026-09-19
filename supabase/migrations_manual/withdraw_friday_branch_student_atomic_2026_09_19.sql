-- Promoted to supabase/migrations/20261007_withdraw_friday_branch_student_atomic.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-09-19 — Atomic Friday Branch withdrawal with waitlist promotion under row lock

create or replace function public.withdraw_friday_branch_student_atomic(
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
  v_enrollment_id uuid;
  v_existing_status text;
  v_confirmed_count int;
  v_promoted_enrollment_id uuid;
  v_promoted_student_id uuid;
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
  into v_enrollment_id, v_existing_status
  from public.friday_branch_class_enrollments e
  where e.organization_id = p_organization_id
    and e.class_id = p_class_id
    and e.family_id = p_family_id
    and e.student_id = p_student_id;

  if v_existing_status is null
    or v_existing_status not in ('confirmed', 'waitlisted') then
    raise exception 'not_enrolled'
      using errcode = 'P0001';
  end if;

  update public.friday_branch_class_enrollments
  set status = 'withdrawn',
      source = p_source
  where id = v_enrollment_id;

  v_promoted_enrollment_id := null;
  v_promoted_student_id := null;

  if v_existing_status = 'confirmed'
    and v_class.capacity is not null then
    select count(*)::int
    into v_confirmed_count
    from public.friday_branch_class_enrollments
    where organization_id = p_organization_id
      and class_id = p_class_id
      and status = 'confirmed';

    if v_confirmed_count < v_class.capacity then
      select e.id, e.student_id
      into v_promoted_enrollment_id, v_promoted_student_id
      from public.friday_branch_class_enrollments e
      where e.organization_id = p_organization_id
        and e.class_id = p_class_id
        and e.status = 'waitlisted'
      order by e.created_at asc
      limit 1
      for update;

      if v_promoted_enrollment_id is not null then
        update public.friday_branch_class_enrollments
        set status = 'confirmed'
        where id = v_promoted_enrollment_id;
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'withdrawn_enrollment_id', v_enrollment_id,
    'promoted_enrollment_id', v_promoted_enrollment_id,
    'promoted_student_id', v_promoted_student_id
  );
end;
$$;

revoke all on function public.withdraw_friday_branch_student_atomic(uuid, uuid, uuid, uuid, text)
  from public, authenticated;

grant execute on function public.withdraw_friday_branch_student_atomic(uuid, uuid, uuid, uuid, text)
  to service_role;
