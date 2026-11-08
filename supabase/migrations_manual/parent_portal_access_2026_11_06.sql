-- Promoted to supabase/migrations/20261150_parent_portal_access.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-06 — Phase 3 (docs/parent-portal-audit.md, findings P1, P2, A1).
--
-- DEPLOY ORDER: paste this FIRST, then deploy the app code. The new code calls both functions; if
-- they do not exist yet, parent API routes and the parent layout fail.
-- The change is additive (two new functions nothing else uses), so pasting it early is harmless.
--
-- HOW TO RUN SAFELY
--   1. Run between the "=== MIGRATION ===" markers.
--   2. Optional dry run (bottom of file): calls both functions as a real parent inside a
--      transaction that rolls back, and compares the unread count with an independent query.
--   3. Smoke-check after deploy: parent home, messages badge, billing, a linked login.
--
-- === MIGRATION START ===

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

-- === MIGRATION END ===

-- ===========================================================================
-- DRY RUN (uncomment, run, read the NOTICE lines; it always rolls back)
-- Picks a school that has a parent with a guardian row, then calls the functions as that parent.
-- ===========================================================================
--
-- begin;
--   create temp table _dry (k text primary key, v text);
--   insert into _dry
--   select 'user', g.user_id::text from public.guardians g
--   join public.enrollments e on true
--   join public.students s on s.id = e.student_id and s.family_id = g.family_id
--   where g.user_id is not null and e.status = 'enrolled'
--   limit 1;
--   insert into _dry
--   select 'org', g.organization_id::text from public.guardians g
--   where g.user_id::text = (select v from _dry where k = 'user') limit 1;
--   select * from _dry;
--
--   select set_config('request.jwt.claims',
--     json_build_object('sub', (select v from _dry where k = 'user'), 'role', 'authenticated')::text, true);
--   set local role authenticated;
--
--   select jsonb_pretty(public.parent_portal_access((select v::uuid from _dry where k = 'org')));
--   select public.parent_unread_message_count((select v::uuid from _dry where k = 'org')) as unread_all;
--
--   -- Independent check: same rule written differently (own guardian rows only).
--   select count(*) as unread_independent
--   from public.portal_messages pm
--   join public.message_threads t on t.id = pm.thread_id
--   where t.organization_id = (select v::uuid from _dry where k = 'org')
--     and pm.sender_user_id <> (select v::uuid from _dry where k = 'user')
--     and pm.created_at > coalesce(
--       (select r.last_read_at from public.message_thread_reads r
--        where r.thread_id = pm.thread_id and r.user_id = (select v::uuid from _dry where k = 'user')),
--       '-infinity'::timestamptz)
--     and t.id in (
--       select p.thread_id from public.message_thread_participants p
--       join public.guardians g on g.id = p.guardian_id
--       where p.participant_kind = 'guardian' and g.user_id = (select v::uuid from _dry where k = 'user'));
--   -- unread_all and unread_independent should match.
--
--   reset role;
-- rollback;  -- never commit the dry run

-- ===========================================================================
-- ROLLBACK (only safe after reverting the app code that calls these functions)
-- ===========================================================================
--
-- drop function if exists public.parent_unread_message_count(uuid, uuid);
-- drop function if exists public.parent_portal_access(uuid);
