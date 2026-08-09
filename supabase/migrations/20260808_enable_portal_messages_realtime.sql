-- Enable Supabase Realtime for portal messaging
-- Run after: 20260806_add_portal_messages.sql

alter publication supabase_realtime add table public.portal_messages;
alter publication supabase_realtime add table public.message_threads;
