-- Product foundation: enrollments
-- Run after: add_product_students.sql, add_product_programs.sql, add_product_classrooms.sql

create table if not exists public.enrollments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  student_id       uuid not null references public.students(id) on delete cascade,
  program_id       uuid not null references public.programs(id) on delete cascade,
  classroom_id     uuid references public.classrooms(id) on delete set null,
  status           text not null default 'enrolled'
                     check (status in ('pending', 'enrolled', 'waitlisted', 'withdrawn')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (student_id, program_id)
);

create index if not exists enrollments_organization_id_idx
  on public.enrollments (organization_id);

create index if not exists enrollments_student_id_idx
  on public.enrollments (student_id);

create index if not exists enrollments_program_id_idx
  on public.enrollments (program_id);

create index if not exists enrollments_classroom_id_idx
  on public.enrollments (classroom_id)
  where classroom_id is not null;

drop trigger if exists on_enrollments_updated on public.enrollments;
create trigger on_enrollments_updated
  before update on public.enrollments
  for each row execute procedure public.handle_updated_at();
