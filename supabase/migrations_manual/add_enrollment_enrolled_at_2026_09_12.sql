-- Promoted to supabase/migrations/20260924_add_enrollment_enrolled_at.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.enrollments
  add column if not exists enrolled_at timestamptz;

comment on column public.enrollments.enrolled_at is
  'First transition to enrolled; used for tuition billing start (not checklist created_at).';

update public.enrollments e
set enrolled_at = completed.completed_at
from (
  select
    ae.entity_id as enrollment_id,
    min(ae.created_at) as completed_at
  from public.activity_events ae
  where ae.action = 'enrollment.completed'
    and ae.entity_type = 'enrollment'
    and ae.entity_id is not null
  group by ae.entity_id
) completed
where e.id = completed.enrollment_id
  and e.status = 'enrolled'
  and e.enrolled_at is null;

update public.enrollments
set enrolled_at = created_at
where status = 'enrolled'
  and enrolled_at is null;

create or replace function public.set_enrollment_enrolled_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'enrolled' and new.enrolled_at is null then
    if tg_op = 'INSERT'
      or (tg_op = 'UPDATE' and old.status is distinct from 'enrolled') then
      new.enrolled_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_enrollments_set_enrolled_at on public.enrollments;
create trigger on_enrollments_set_enrolled_at
  before insert or update on public.enrollments
  for each row execute procedure public.set_enrollment_enrolled_at();

create index if not exists enrollments_enrolled_at_idx
  on public.enrollments (enrolled_at)
  where enrolled_at is not null;
