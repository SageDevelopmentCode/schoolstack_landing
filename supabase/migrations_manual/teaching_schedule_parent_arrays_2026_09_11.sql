-- Promoted to supabase/migrations/20260911_teaching_schedule_parent_arrays.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-09-11

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
