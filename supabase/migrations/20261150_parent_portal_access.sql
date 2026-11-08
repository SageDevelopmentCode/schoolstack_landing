-- Phase 3 of docs/parent-portal-audit.md (findings P1, P2, A1): one query for parent portal access
-- and a cheap unread-message count.
--
-- Today every parent access check runs 4-6 sequential queries (portal link context, guardians per
-- linked login, students, enrollments, programs) and every API route repeats them. This adds:
--
--   parent_portal_access(p_organization_id)
--     One call for the signed-in user (auth.uid(), including linked-account logins via the same
--     rules as portal_account_link_peer_user_ids): link context, guardian ids, family ids,
--     student ids, enrolled programs (with parent_portal_settings so isolated / co-op flags are
--     available) and whether the user has any enrolled child.
--
--   parent_unread_message_count(p_organization_id, p_program_id default null)
--     The parent badge count computed in SQL. Mirrors getParentMessagesUnreadCount: 0 unless the
--     user has enrolled access; threads where one of the user's OWN guardian rows is a participant;
--     unread = messages from other senders newer than message_thread_reads.last_read_at (same rule
--     as thread_unread_counts). p_program_id null = every thread (what the API does today); a
--     program id applies the program portal inbox rule (program threads plus school-office /
--     platform-support threads with no program).
--
-- Both functions only ever look at auth.uid(), so a user can only learn about themselves. With no
-- auth.uid() (service role) they return an empty access result / 0.
-- Additive only: nothing existing changes.
--
-- Run after: 20261149_submit_classroom_signup_response_atomic.sql
-- Note: since 20261146 new functions are locked by default, so grants are explicit.

create or replace function public.parent_portal_access(p_organization_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_group_id uuid;
  v_primary_user_id uuid;
  v_member_user_ids uuid[];
  v_guardian_ids uuid[];
  v_family_ids uuid[];
  v_student_ids uuid[];
  v_programs jsonb;
  v_has_enrolled boolean;
begin
  if v_uid is null or p_organization_id is null then
    return jsonb_build_object(
      'link', jsonb_build_object(
        'group_id', null,
        'primary_user_id', null,
        'member_user_ids', '[]'::jsonb,
        'is_primary_login', true
      ),
      'guardian_ids', '[]'::jsonb,
      'family_ids', '[]'::jsonb,
      'student_ids', '[]'::jsonb,
      'enrolled_programs', '[]'::jsonb,
      'has_enrolled_access', false
    );
  end if;

  -- Portal account link context (same rules as getPortalAccountLinkContext).
  select m.group_id
  into v_group_id
  from public.organization_portal_account_link_members m
  where m.organization_id = p_organization_id
    and m.user_id = v_uid
  limit 1;

  if v_group_id is not null then
    select g.primary_user_id
    into v_primary_user_id
    from public.organization_portal_account_link_groups g
    where g.id = v_group_id;

    if not found then
      v_group_id := null;
      v_primary_user_id := null;
    end if;
  end if;

  if v_group_id is not null then
    select coalesce(
      array_agg(m.user_id order by (m.user_id = v_uid) desc, m.user_id),
      '{}'::uuid[]
    )
    into v_member_user_ids
    from public.organization_portal_account_link_members m
    where m.group_id = v_group_id;
  end if;

  if v_member_user_ids is null or cardinality(v_member_user_ids) = 0 then
    v_member_user_ids := array[v_uid];
  end if;
  if v_primary_user_id is null then
    v_primary_user_id := v_uid;
  end if;

  -- The user's own guardian rows (used for messaging, which is per login).
  select coalesce(array_agg(g.id order by g.created_at, g.id), '{}'::uuid[])
  into v_guardian_ids
  from public.guardians g
  where g.organization_id = p_organization_id
    and g.user_id = v_uid;

  -- Families across all linked logins, ordered by when the family was first linked so the
  -- "primary" family is stable between requests.
  select coalesce(array_agg(f.family_id order by f.first_linked_at, f.family_id), '{}'::uuid[])
  into v_family_ids
  from (
    select g.family_id, min(g.created_at) as first_linked_at
    from public.guardians g
    where g.organization_id = p_organization_id
      and g.user_id = any (v_member_user_ids)
    group by g.family_id
  ) f;

  select coalesce(array_agg(s.id order by s.created_at, s.id), '{}'::uuid[])
  into v_student_ids
  from public.students s
  where s.organization_id = p_organization_id
    and s.family_id = any (v_family_ids);

  select exists (
    select 1
    from public.enrollments e
    where e.organization_id = p_organization_id
      and e.status = 'enrolled'
      and e.student_id = any (v_student_ids)
  )
  into v_has_enrolled;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'portal_slug', p.portal_slug,
        'parent_portal_settings', p.parent_portal_settings
      )
      order by p.name, p.id
    ),
    '[]'::jsonb
  )
  into v_programs
  from public.programs p
  where p.organization_id = p_organization_id
    and p.id in (
      select e.program_id
      from public.enrollments e
      where e.organization_id = p_organization_id
        and e.status = 'enrolled'
        and e.student_id = any (v_student_ids)
    );

  return jsonb_build_object(
    'link', jsonb_build_object(
      'group_id', v_group_id,
      'primary_user_id', v_primary_user_id,
      'member_user_ids', to_jsonb(v_member_user_ids),
      'is_primary_login', v_uid = v_primary_user_id
    ),
    'guardian_ids', to_jsonb(v_guardian_ids),
    'family_ids', to_jsonb(v_family_ids),
    'student_ids', to_jsonb(v_student_ids),
    'enrolled_programs', v_programs,
    'has_enrolled_access', coalesce(v_has_enrolled, false)
  );
end;
$$;

create or replace function public.parent_unread_message_count(
  p_organization_id uuid,
  p_program_id uuid default null
)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count bigint;
begin
  if v_uid is null or p_organization_id is null then
    return 0;
  end if;

  if not coalesce(
    (public.parent_portal_access(p_organization_id) ->> 'has_enrolled_access')::boolean,
    false
  ) then
    return 0;
  end if;

  select count(*)
  into v_count
  from public.portal_messages pm
  join public.message_threads t on t.id = pm.thread_id
  left join public.message_thread_reads mtr
    on mtr.thread_id = pm.thread_id
   and mtr.user_id = v_uid
  where t.organization_id = p_organization_id
    and pm.sender_user_id <> v_uid
    and (mtr.last_read_at is null or pm.created_at > mtr.last_read_at)
    and exists (
      select 1
      from public.message_thread_participants p
      join public.guardians g on g.id = p.guardian_id
      where p.thread_id = t.id
        and p.organization_id = p_organization_id
        and p.participant_kind = 'guardian'
        and g.user_id = v_uid
        and g.organization_id = p_organization_id
    )
    and (
      p_program_id is null
      or t.program_id = p_program_id
      or (
        t.program_id is null
        and exists (
          select 1
          from public.message_thread_participants sp
          where sp.thread_id = t.id
            and sp.participant_kind in ('school_office', 'platform_support')
        )
      )
    );

  return v_count::integer;
end;
$$;

revoke all on function public.parent_portal_access(uuid) from public, anon;
grant execute on function public.parent_portal_access(uuid) to authenticated, service_role;

revoke all on function public.parent_unread_message_count(uuid, uuid) from public, anon;
grant execute on function public.parent_unread_message_count(uuid, uuid) to authenticated, service_role;
