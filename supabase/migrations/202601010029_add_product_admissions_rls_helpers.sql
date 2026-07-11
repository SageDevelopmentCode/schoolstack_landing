-- Product admissions: RLS helper functions for guardian-scoped access
-- Run after: add_product_guardians.sql, add_product_organization_memberships.sql
-- Requires: add_product_rls_helpers.sql

create or replace function public.user_is_guardian_for_family(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guardians g
    where g.family_id = p_family_id
      and g.user_id = auth.uid()
  );
$$;

create or replace function public.user_is_guardian_for_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    join public.guardians g on g.family_id = s.family_id
    where s.id = p_student_id
      and g.user_id = auth.uid()
  );
$$;

create or replace function public.user_is_guardian_for_enrollment(p_enrollment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.students s on s.id = e.student_id
    join public.guardians g on g.family_id = s.family_id
    where e.id = p_enrollment_id
      and g.user_id = auth.uid()
  );
$$;
