-- Promoted to supabase/migrations/20261014_add_committee_member_writes.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-09-21: Parent committee member writes + creator attribution.

-- ── Creator attribution ───────────────────────────────────────────────────────

alter table public.committee_resources
  add column if not exists created_by_member_id uuid
    references public.committee_members(id) on delete set null;

alter table public.committee_events
  add column if not exists created_by_member_id uuid
    references public.committee_members(id) on delete set null;

alter table public.committee_tasks
  add column if not exists created_by_member_id uuid
    references public.committee_members(id) on delete set null;

create index if not exists committee_resources_created_by_idx
  on public.committee_resources (created_by_member_id)
  where created_by_member_id is not null;

create index if not exists committee_events_created_by_idx
  on public.committee_events (created_by_member_id)
  where created_by_member_id is not null;

create index if not exists committee_tasks_created_by_idx
  on public.committee_tasks (created_by_member_id)
  where created_by_member_id is not null;

-- ── Helper: active committee member row for auth.uid() ──────────────────────

create or replace function public.user_committee_member_id(p_committee_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.id
  from public.committee_members m
  where m.committee_id = p_committee_id
    and m.user_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

-- ── committee_resources: member writes ────────────────────────────────────────

create policy "Committee members create committee_resources"
  on public.committee_resources for insert to authenticated
  with check (
    public.user_is_committee_member(committee_id)
    and created_by_member_id = public.user_committee_member_id(committee_id)
  );

create policy "Committee members update own committee_resources"
  on public.committee_resources for update to authenticated
  using (
    created_by_member_id = public.user_committee_member_id(committee_id)
  )
  with check (
    created_by_member_id = public.user_committee_member_id(committee_id)
  );

create policy "Committee members delete own committee_resources"
  on public.committee_resources for delete to authenticated
  using (
    created_by_member_id = public.user_committee_member_id(committee_id)
  );

-- ── committee_events: member writes ───────────────────────────────────────────

create policy "Committee members create committee_events"
  on public.committee_events for insert to authenticated
  with check (
    public.user_is_committee_member(committee_id)
    and created_by_member_id = public.user_committee_member_id(committee_id)
  );

create policy "Committee members update own committee_events"
  on public.committee_events for update to authenticated
  using (
    created_by_member_id = public.user_committee_member_id(committee_id)
  )
  with check (
    created_by_member_id = public.user_committee_member_id(committee_id)
  );

create policy "Committee members delete own committee_events"
  on public.committee_events for delete to authenticated
  using (
    created_by_member_id = public.user_committee_member_id(committee_id)
  );

-- ── committee_tasks: member writes ────────────────────────────────────────────

create policy "Committee members create committee_tasks"
  on public.committee_tasks for insert to authenticated
  with check (
    public.user_is_committee_member(committee_id)
    and created_by_member_id = public.user_committee_member_id(committee_id)
  );

create policy "Committee members update committee_tasks"
  on public.committee_tasks for update to authenticated
  using (public.user_is_committee_member(committee_id))
  with check (public.user_is_committee_member(committee_id));

create policy "Committee members delete own committee_tasks"
  on public.committee_tasks for delete to authenticated
  using (
    created_by_member_id = public.user_committee_member_id(committee_id)
  );

-- ── committee_messages: member writes ─────────────────────────────────────────

create policy "Committee members create committee_messages"
  on public.committee_messages for insert to authenticated
  with check (
    public.user_is_committee_member(committee_id)
    and sender_member_id = public.user_committee_member_id(committee_id)
  );

-- ── Storage: committee members upload resource files ──────────────────────────

create policy "Committee members upload committee-resource-files storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'committee-resource-files'
    and (storage.foldername(name))[2] = 'committees'
    and public.user_is_committee_member(
      public.committee_resource_storage_committee_id(name)
    )
  );

create policy "Committee members update own committee-resource-files storage"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'committee-resource-files'
    and public.user_is_committee_member(
      public.committee_resource_storage_committee_id(name)
    )
  )
  with check (
    bucket_id = 'committee-resource-files'
    and (storage.foldername(name))[2] = 'committees'
    and public.user_is_committee_member(
      public.committee_resource_storage_committee_id(name)
    )
  );

create policy "Committee members delete own committee-resource-files storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'committee-resource-files'
    and public.user_is_committee_member(
      public.committee_resource_storage_committee_id(name)
    )
  );
