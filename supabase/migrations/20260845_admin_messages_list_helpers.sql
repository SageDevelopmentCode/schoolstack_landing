-- Lean batch helpers for admin messages thread list
-- Run after: 20260844_admin_submissions_page_meta.sql

create or replace function public.thread_unread_counts(
  p_user_id uuid,
  p_thread_ids uuid[]
)
returns table (thread_id uuid, unread_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    pm.thread_id,
    count(*)::bigint as unread_count
  from public.portal_messages pm
  left join public.message_thread_reads mtr
    on mtr.thread_id = pm.thread_id
   and mtr.user_id = p_user_id
  where pm.thread_id = any(p_thread_ids)
    and pm.sender_user_id <> p_user_id
    and (
      mtr.last_read_at is null
      or pm.created_at > mtr.last_read_at
    )
  group by pm.thread_id;
$$;

create or replace function public.latest_messages_for_threads(
  p_thread_ids uuid[]
)
returns setof public.portal_messages
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (pm.thread_id) pm.*
  from public.portal_messages pm
  where pm.thread_id = any(p_thread_ids)
  order by pm.thread_id, pm.created_at desc;
$$;
