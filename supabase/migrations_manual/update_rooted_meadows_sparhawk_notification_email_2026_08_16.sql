-- Rooted Meadows: route Sparhawk family notifications to personal email.
-- Date: 2026-08-16
-- Purpose: Send parent/family portal emails to sparhawk.ar@gmail.com instead of admin login email.
-- Family: Sparhawk (Olivia + Daniella)
--
-- Run in Supabase SQL Editor after deploying notification settings support.

update public.families
set notification_emails = array['sparhawk.ar@gmail.com'],
    updated_at = now()
where id = 'b1c2d3e4-f5a6-4789-b012-3456789abc02'
  and organization_id = (
    select id from public.organizations where slug = 'rooted-meadows' limit 1
  );

-- Optional: add a second address (max 2)
-- update public.families
-- set notification_emails = array['sparhawk.ar@gmail.com', 'second@example.com'],
--     updated_at = now()
-- where id = 'b1c2d3e4-f5a6-4789-b012-3456789abc02';

-- Verify:
-- select id, name, primary_email, notification_emails
-- from public.families
-- where id = 'b1c2d3e4-f5a6-4789-b012-3456789abc02';
