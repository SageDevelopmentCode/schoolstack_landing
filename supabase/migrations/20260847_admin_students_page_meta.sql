-- Lean aggregates for school admin students roster tab
-- Run after: 20260846_admin_tuition_page_meta.sql

create or replace function public.admin_students_page_meta(
  p_organization_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with enrolled_students as (
    select distinct e.student_id as student_id
    from public.enrollments e
    where e.organization_id = p_organization_id
      and e.status = 'enrolled'
  ),
  student_enrolled_at as (
    select
      e.student_id,
      min(e.created_at) as enrolled_at
    from public.enrollments e
    where e.organization_id = p_organization_id
      and e.status = 'enrolled'
    group by e.student_id
  ),
  unassigned_students as (
    select es.student_id
    from enrolled_students es
    where not exists (
      select 1
      from public.student_teacher_assignments sta
      where sta.organization_id = p_organization_id
        and sta.student_id = es.student_id
    )
  ),
  new_enrollments as (
    select sea.student_id
    from student_enrolled_at sea
    where sea.enrolled_at >= (now() - interval '30 days')
  ),
  program_options as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object('name', program_name)
        order by program_name
      ),
      '[]'::jsonb
    ) as options
    from (
      select distinct p.name as program_name
      from public.enrollments e
      inner join public.programs p on p.id = e.program_id
      where e.organization_id = p_organization_id
        and e.status = 'enrolled'
        and nullif(trim(p.name), '') is not null
    ) programs
  )
  select jsonb_build_object(
    'total_count',
    (select count(*)::int from enrolled_students),
    'unassigned_count',
    (select count(*)::int from unassigned_students),
    'new_enrollment_count',
    (select count(*)::int from new_enrollments),
    'program_count',
    (
      select count(*)::int
      from (
        select distinct p.name
        from public.enrollments e
        inner join public.programs p on p.id = e.program_id
        where e.organization_id = p_organization_id
          and e.status = 'enrolled'
          and nullif(trim(p.name), '') is not null
      ) distinct_programs
    ),
    'program_options',
    (select options from program_options)
  );
$$;

create index if not exists enrollments_org_status_student_idx
  on public.enrollments (organization_id, status, student_id);
