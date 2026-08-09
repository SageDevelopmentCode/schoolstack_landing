-- Promoted to supabase/migrations/20260806_add_portal_messages.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Portal messaging: threads between families, teachers, and school office

-- ── Enums ────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.message_participant_kind as enum (
    'family',
    'staff_member',
    'school_office'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.portal_message_sender_kind as enum (
    'guardian',
    'staff_member',
    'org_admin'
  );
exception
  when duplicate_object then null;
end $$;

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists public.message_threads (
  id                 uuid primary key default gen_random_uuid(),
  organization_id    uuid not null references public.organizations(id) on delete cascade,
  subject            text,
  participant_signature text not null,
  last_message_at    timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (organization_id, participant_signature)
);

create index if not exists message_threads_organization_id_idx
  on public.message_threads (organization_id);

create index if not exists message_threads_last_message_at_idx
  on public.message_threads (organization_id, last_message_at desc nulls last);

create table if not exists public.message_thread_participants (
  id                 uuid primary key default gen_random_uuid(),
  thread_id          uuid not null references public.message_threads(id) on delete cascade,
  organization_id    uuid not null references public.organizations(id) on delete cascade,
  participant_kind   public.message_participant_kind not null,
  family_id          uuid references public.families(id) on delete cascade,
  staff_member_id    uuid references public.staff_members(id) on delete cascade,
  created_at         timestamptz not null default now(),
  constraint message_thread_participants_identity_check check (
    (participant_kind = 'family' and family_id is not null and staff_member_id is null)
    or (participant_kind = 'staff_member' and staff_member_id is not null and family_id is null)
    or (participant_kind = 'school_office' and family_id is null and staff_member_id is null)
  )
);

create unique index if not exists message_thread_participants_family_uidx
  on public.message_thread_participants (thread_id, family_id)
  where participant_kind = 'family';

create unique index if not exists message_thread_participants_staff_uidx
  on public.message_thread_participants (thread_id, staff_member_id)
  where participant_kind = 'staff_member';

create unique index if not exists message_thread_participants_school_office_uidx
  on public.message_thread_participants (thread_id)
  where participant_kind = 'school_office';

create index if not exists message_thread_participants_family_id_idx
  on public.message_thread_participants (organization_id, family_id)
  where family_id is not null;

create index if not exists message_thread_participants_staff_member_id_idx
  on public.message_thread_participants (organization_id, staff_member_id)
  where staff_member_id is not null;

create table if not exists public.portal_messages (
  id                   uuid primary key default gen_random_uuid(),
  thread_id            uuid not null references public.message_threads(id) on delete cascade,
  organization_id      uuid not null references public.organizations(id) on delete cascade,
  body                 text not null,
  sender_user_id       uuid not null references auth.users(id) on delete cascade,
  sender_kind          public.portal_message_sender_kind not null,
  sender_guardian_id     uuid references public.guardians(id) on delete set null,
  sender_staff_member_id uuid references public.staff_members(id) on delete set null,
  created_at           timestamptz not null default now(),
  constraint portal_messages_body_not_empty check (char_length(trim(body)) > 0)
);

create index if not exists portal_messages_thread_id_created_at_idx
  on public.portal_messages (thread_id, created_at asc);

create index if not exists portal_messages_organization_id_idx
  on public.portal_messages (organization_id);

create table if not exists public.message_thread_reads (
  id             uuid primary key default gen_random_uuid(),
  thread_id      uuid not null references public.message_threads(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  last_read_at   timestamptz not null default now(),
  unique (thread_id, user_id)
);

create index if not exists message_thread_reads_user_id_idx
  on public.message_thread_reads (user_id);

-- ── Triggers ─────────────────────────────────────────────────────────────────

drop trigger if exists on_message_threads_updated on public.message_threads;
create trigger on_message_threads_updated
  before update on public.message_threads
  for each row execute procedure public.handle_updated_at();

create or replace function public.touch_message_thread_last_message_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.message_threads
  set last_message_at = new.created_at,
      updated_at = now()
  where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists on_portal_messages_touch_thread on public.portal_messages;
create trigger on_portal_messages_touch_thread
  after insert on public.portal_messages
  for each row execute procedure public.touch_message_thread_last_message_at();

-- ── Helpers ──────────────────────────────────────────────────────────────────

create or replace function public.message_thread_organization_id(p_thread_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select t.organization_id
  from public.message_threads t
  where t.id = p_thread_id
  limit 1;
$$;

create or replace function public.user_staff_member_id_for_org(p_organization_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select sm.id
  from public.staff_members sm
  where sm.organization_id = p_organization_id
    and sm.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.user_can_access_message_thread(p_thread_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.message_threads t
    where t.id = p_thread_id
      and (
        public.is_platform_admin()
        or public.user_is_org_admin(t.organization_id)
        or exists (
          select 1
          from public.message_thread_participants p
          where p.thread_id = t.id
            and p.participant_kind = 'family'
            and public.user_is_guardian_for_family(p.family_id)
        )
        or exists (
          select 1
          from public.message_thread_participants p
          where p.thread_id = t.id
            and p.participant_kind = 'staff_member'
            and p.staff_member_id = public.user_staff_member_id_for_org(t.organization_id)
        )
      )
  );
$$;

-- ── RLS: message_threads ─────────────────────────────────────────────────────

alter table public.message_threads enable row level security;

drop policy if exists "Platform admins manage message_threads" on public.message_threads;
create policy "Platform admins manage message_threads"
  on public.message_threads for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage message_threads" on public.message_threads;
create policy "Org admins manage message_threads"
  on public.message_threads for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Participants read message_threads" on public.message_threads;
create policy "Participants read message_threads"
  on public.message_threads for select to authenticated
  using (public.user_can_access_message_thread(id));

drop policy if exists "Participants insert message_threads" on public.message_threads;
create policy "Participants insert message_threads"
  on public.message_threads for insert to authenticated
  with check (public.user_can_access_message_thread(id));

-- ── RLS: message_thread_participants ─────────────────────────────────────────

alter table public.message_thread_participants enable row level security;

drop policy if exists "Platform admins manage message_thread_participants" on public.message_thread_participants;
create policy "Platform admins manage message_thread_participants"
  on public.message_thread_participants for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage message_thread_participants" on public.message_thread_participants;
create policy "Org admins manage message_thread_participants"
  on public.message_thread_participants for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Participants read message_thread_participants" on public.message_thread_participants;
create policy "Participants read message_thread_participants"
  on public.message_thread_participants for select to authenticated
  using (public.user_can_access_message_thread(thread_id));

drop policy if exists "Participants insert message_thread_participants" on public.message_thread_participants;
create policy "Participants insert message_thread_participants"
  on public.message_thread_participants for insert to authenticated
  with check (public.user_can_access_message_thread(thread_id));

-- ── RLS: portal_messages ─────────────────────────────────────────────────────

alter table public.portal_messages enable row level security;

drop policy if exists "Platform admins manage portal_messages" on public.portal_messages;
create policy "Platform admins manage portal_messages"
  on public.portal_messages for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage portal_messages" on public.portal_messages;
create policy "Org admins manage portal_messages"
  on public.portal_messages for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Participants read portal_messages" on public.portal_messages;
create policy "Participants read portal_messages"
  on public.portal_messages for select to authenticated
  using (public.user_can_access_message_thread(thread_id));

drop policy if exists "Participants insert portal_messages" on public.portal_messages;
create policy "Participants insert portal_messages"
  on public.portal_messages for insert to authenticated
  with check (
    public.user_can_access_message_thread(thread_id)
    and sender_user_id = auth.uid()
  );

-- ── RLS: message_thread_reads ────────────────────────────────────────────────

alter table public.message_thread_reads enable row level security;

drop policy if exists "Users manage own message_thread_reads" on public.message_thread_reads;
create policy "Users manage own message_thread_reads"
  on public.message_thread_reads for all to authenticated
  using (user_id = auth.uid() and public.user_can_access_message_thread(thread_id))
  with check (user_id = auth.uid() and public.user_can_access_message_thread(thread_id));

drop policy if exists "Platform admins manage message_thread_reads" on public.message_thread_reads;
create policy "Platform admins manage message_thread_reads"
  on public.message_thread_reads for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
