-- Program-wide co-op curriculum discussion feed (one channel per program).
-- Run after: 20260854_add_program_coop_curriculum.sql

create table if not exists public.program_coop_curriculum_discussion_messages (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations(id) on delete cascade,
  program_id          uuid not null references public.programs(id) on delete cascade,
  sender_guardian_id  uuid not null references public.guardians(id) on delete cascade,
  body                text not null,
  page_number         integer,
  created_at          timestamptz not null default now(),
  constraint program_coop_curriculum_discussion_messages_body_check
    check (char_length(trim(body)) > 0 and char_length(body) <= 4000),
  constraint program_coop_curriculum_discussion_messages_page_number_check
    check (page_number is null or page_number > 0)
);

create index if not exists program_coop_curriculum_discussion_messages_program_id_idx
  on public.program_coop_curriculum_discussion_messages (program_id, created_at asc);

create index if not exists program_coop_curriculum_discussion_messages_organization_id_idx
  on public.program_coop_curriculum_discussion_messages (organization_id);

alter table public.program_coop_curriculum_discussion_messages enable row level security;

create policy "Platform admins manage program_coop_curriculum_discussion_messages"
  on public.program_coop_curriculum_discussion_messages for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage program_coop_curriculum_discussion_messages"
  on public.program_coop_curriculum_discussion_messages for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Staff read program_coop_curriculum_discussion_messages"
  on public.program_coop_curriculum_discussion_messages for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

create policy "Enrolled guardians read program_coop_curriculum_discussion_messages"
  on public.program_coop_curriculum_discussion_messages for select to authenticated
  using (public.user_can_read_program_coop_curriculum(program_id));

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
  );

alter publication supabase_realtime add table public.program_coop_curriculum_discussion_messages;
