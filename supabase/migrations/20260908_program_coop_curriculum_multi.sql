-- Allow up to five co-op curriculum PDF guides per program; scope discussion by guide.
-- Run after: 20260855_add_program_coop_curriculum_discussion.sql

-- program_coop_curriculum: one-to-many (was one row per program_id PK)

alter table public.program_coop_curriculum
  add column if not exists id uuid default gen_random_uuid();

alter table public.program_coop_curriculum
  add column if not exists sort_order smallint not null default 0;

alter table public.program_coop_curriculum
  add column if not exists display_name text;

update public.program_coop_curriculum
set id = gen_random_uuid()
where id is null;

alter table public.program_coop_curriculum
  alter column id set not null;

alter table public.program_coop_curriculum
  alter column id set default gen_random_uuid();

alter table public.program_coop_curriculum
  drop constraint if exists program_coop_curriculum_pkey;

alter table public.program_coop_curriculum
  add primary key (id);

create index if not exists program_coop_curriculum_program_id_sort_order_idx
  on public.program_coop_curriculum (program_id, sort_order);

-- Discussion threads: NULL curriculum_id = General; non-null = guide-specific

alter table public.program_coop_curriculum_discussion_messages
  add column if not exists curriculum_id uuid references public.program_coop_curriculum(id) on delete cascade;

create index if not exists program_coop_curriculum_discussion_messages_thread_idx
  on public.program_coop_curriculum_discussion_messages (program_id, curriculum_id, created_at asc);

drop policy if exists "Enrolled guardians insert program_coop_curriculum_discussion_messages"
  on public.program_coop_curriculum_discussion_messages;

create policy "Enrolled guardians insert program_coop_curriculum_discussion_messages"
  on public.program_coop_curriculum_discussion_messages for insert to authenticated
  with check (
    public.user_can_read_program_coop_curriculum(program_id)
    and organization_id = (
      select g.organization_id
      from public.guardians g
      where g.id = sender_guardian_id
        and g.user_id = auth.uid()
      limit 1
    )
    and program_id in (
      select e.program_id
      from public.enrollments e
      join public.students s on s.id = e.student_id
      join public.guardians g on g.family_id = s.family_id
      where e.status = 'enrolled'
        and g.id = sender_guardian_id
        and g.user_id = auth.uid()
    )
    and (
      curriculum_id is null
      or exists (
        select 1
        from public.program_coop_curriculum c
        where c.id = curriculum_id
          and c.program_id = program_coop_curriculum_discussion_messages.program_id
      )
    )
  );
