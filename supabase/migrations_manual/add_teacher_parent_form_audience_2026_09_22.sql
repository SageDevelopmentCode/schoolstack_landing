-- Promoted to supabase/migrations/20261021_add_teacher_parent_form_audience.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-09-22: Add audience_type + family_ids for Forms & Documents targeting.

alter table public.teacher_parent_forms
  add column if not exists audience_type text not null default 'classrooms'
    check (audience_type in ('unassigned', 'classrooms', 'families')),
  add column if not exists family_ids uuid[] not null default '{}';

update public.teacher_parent_forms
set audience_type = 'unassigned'
where coalesce(array_length(classroom_ids, 1), 0) = 0;
