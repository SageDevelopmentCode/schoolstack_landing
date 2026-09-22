-- Expression index for committee activity feeds (metadata.committeeId lookups).
-- Run after: 202601010042_add_activity_events.sql

create index if not exists activity_events_org_committee_created_idx
  on public.activity_events (organization_id, ((metadata->>'committeeId')), created_at desc)
  where metadata ? 'committeeId';
