-- Add audience targeting for teacher/parent forms (classrooms, specific families, or unassigned).
-- Run after: 20261020_expo_push_tokens_per_device.sql

alter table public.teacher_parent_forms
  add column if not exists audience_type text not null default 'classrooms'
    check (audience_type in ('unassigned', 'classrooms', 'families')),
  add column if not exists family_ids uuid[] not null default '{}';

update public.teacher_parent_forms
set audience_type = 'unassigned'
where coalesce(array_length(classroom_ids, 1), 0) = 0;
