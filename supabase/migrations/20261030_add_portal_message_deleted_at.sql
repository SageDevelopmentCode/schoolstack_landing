-- Soft-delete timestamp for portal messages
-- Run after: 20261029_add_portal_message_edited_at.sql

alter table public.portal_messages
  add column if not exists deleted_at timestamptz null;
