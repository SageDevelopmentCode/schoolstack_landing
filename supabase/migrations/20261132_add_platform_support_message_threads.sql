-- Private MudKitchen Support threads: one guardian plus platform_support.
-- School org admins cannot read or write these rows. Platform admins and the
-- parent guardian still can.
-- Run after: 20261131_add_platform_support_message_kinds.sql

alter table public.message_thread_participants
  drop constraint if exists message_thread_participants_identity_check;

alter table public.message_thread_participants
  add constraint message_thread_participants_identity_check check (
    (
      participant_kind = 'family'
      and family_id is not null
      and staff_member_id is null
      and guardian_id is null
    )
    or (
      participant_kind = 'guardian'
      and guardian_id is not null
      and family_id is null
      and staff_member_id is null
    )
    or (
      participant_kind = 'staff_member'
      and staff_member_id is not null
      and family_id is null
      and guardian_id is null
    )
    or (
      participant_kind = 'school_office'
      and family_id is null
      and staff_member_id is null
      and guardian_id is null
    )
    or (
      participant_kind = 'platform_support'
      and family_id is null
      and staff_member_id is null
      and guardian_id is null
    )
  );

create unique index if not exists message_thread_participants_platform_support_uidx
  on public.message_thread_participants (thread_id)
  where participant_kind = 'platform_support';

create or replace function public.thread_has_platform_support(p_thread_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.message_thread_participants p
    where p.thread_id = p_thread_id
      and p.participant_kind = 'platform_support'
  );
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
        or (
          public.user_is_org_admin(t.organization_id)
          and not public.thread_has_platform_support(t.id)
        )
        or exists (
          select 1
          from public.message_thread_participants p
          where p.thread_id = t.id
            and p.participant_kind = 'guardian'
            and public.user_is_guardian(p.guardian_id)
        )
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

-- message_thread_reads has no separate org-admin policy. Access goes through
-- user_can_access_message_thread, updated above.

drop policy if exists "Org admins manage message_threads" on public.message_threads;
create policy "Org admins manage message_threads"
  on public.message_threads for all to authenticated
  using (
    public.user_is_org_admin(organization_id)
    and not public.thread_has_platform_support(id)
  )
  with check (
    public.user_is_org_admin(organization_id)
    and not public.thread_has_platform_support(id)
  );

drop policy if exists "Org admins manage message_thread_participants" on public.message_thread_participants;
create policy "Org admins manage message_thread_participants"
  on public.message_thread_participants for all to authenticated
  using (
    public.user_is_org_admin(organization_id)
    and not public.thread_has_platform_support(thread_id)
  )
  with check (
    public.user_is_org_admin(organization_id)
    and not public.thread_has_platform_support(thread_id)
  );

drop policy if exists "Org admins manage portal_messages" on public.portal_messages;
create policy "Org admins manage portal_messages"
  on public.portal_messages for all to authenticated
  using (
    public.user_is_org_admin(organization_id)
    and not public.thread_has_platform_support(thread_id)
  )
  with check (
    public.user_is_org_admin(organization_id)
    and not public.thread_has_platform_support(thread_id)
  );

drop policy if exists "Org admins manage portal_message_attachments" on public.portal_message_attachments;
create policy "Org admins manage portal_message_attachments"
  on public.portal_message_attachments for all to authenticated
  using (
    public.user_is_org_admin(organization_id)
    and not public.thread_has_platform_support(thread_id)
  )
  with check (
    public.user_is_org_admin(organization_id)
    and not public.thread_has_platform_support(thread_id)
  );

drop policy if exists "Org admins manage portal-message-files storage" on storage.objects;
create policy "Org admins manage portal-message-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'portal-message-files'
    and public.user_is_org_admin(public.portal_message_storage_org_id(name))
    and not public.thread_has_platform_support(public.portal_message_storage_thread_id(name))
  )
  with check (
    bucket_id = 'portal-message-files'
    and (storage.foldername(name))[2] = 'message-threads'
    and public.user_is_org_admin(public.portal_message_storage_org_id(name))
    and not public.thread_has_platform_support(public.portal_message_storage_thread_id(name))
  );

create or replace function public.count_admin_unread_messages(
  p_organization_id uuid,
  p_user_id uuid
)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.portal_messages pm
  inner join public.message_threads mt on mt.id = pm.thread_id
  left join public.message_thread_reads mtr
    on mtr.thread_id = pm.thread_id
   and mtr.user_id = p_user_id
  where mt.organization_id = p_organization_id
    and pm.sender_user_id <> p_user_id
    and not public.thread_has_platform_support(mt.id)
    and (
      mtr.last_read_at is null
      or pm.created_at > mtr.last_read_at
    );
$$;

grant execute on function public.thread_has_platform_support(uuid) to authenticated, service_role;
