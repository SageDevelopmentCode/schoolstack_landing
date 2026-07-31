-- Add actor_name to activity_events for readable admin activity log previews.
-- Run in Supabase SQL Editor before deploying the activity log UI changes.
--
-- New events will populate actor_name at write time; optional backfill below
-- resolves parent actor names from guardians for historical rows.

alter table public.activity_events
  add column if not exists actor_name text;

-- Optional backfill: parent events with user_id but no stored name.
-- Safe to re-run (only updates rows where actor_name is still null).
update public.activity_events ae
set actor_name = trim(concat(g.first_name, ' ', g.last_name))
from public.guardians g
where ae.actor_name is null
  and ae.actor_type = 'parent'
  and ae.actor_user_id is not null
  and g.user_id = ae.actor_user_id
  and (
    ae.organization_id is null
    or g.organization_id = ae.organization_id
  );
