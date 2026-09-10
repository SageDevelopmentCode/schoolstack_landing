-- Co-op teaching schedule: parent instructor/assistant as text arrays.
-- Run after: 20260910_add_program_coop_teaching_schedule.sql

alter table public.program_coop_teaching_schedule_weeks
  add column if not exists parent_instructors text[] not null default '{}',
  add column if not exists parent_assistants text[] not null default '{}';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'program_coop_teaching_schedule_weeks'
      and column_name = 'parent_instructor'
  ) then
    update public.program_coop_teaching_schedule_weeks
    set
      parent_instructors = case
        when trim(parent_instructor) = '' then '{}'::text[]
        else array[trim(parent_instructor)]
      end,
      parent_assistants = case
        when parent_assistant is null or trim(parent_assistant) = '' then '{}'::text[]
        else array[trim(parent_assistant)]
      end;

    alter table public.program_coop_teaching_schedule_weeks
      drop column parent_instructor,
      drop column parent_assistant;
  end if;
end $$;
