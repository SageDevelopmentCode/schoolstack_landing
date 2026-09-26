-- Promoted to supabase/migrations/20261029_add_portal_message_edited_at.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.portal_messages
  add column if not exists edited_at timestamptz null;

drop policy if exists "Participants update own portal_messages" on public.portal_messages;
create policy "Participants update own portal_messages"
  on public.portal_messages for update to authenticated
  using (
    public.user_can_access_message_thread(thread_id)
    and sender_user_id = auth.uid()
  )
  with check (
    public.user_can_access_message_thread(thread_id)
    and sender_user_id = auth.uid()
  );
