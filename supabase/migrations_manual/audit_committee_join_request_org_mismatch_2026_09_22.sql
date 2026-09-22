-- Read-only audit for cross-school committee join request / member mismatches.
-- Run in Supabase SQL Editor after deploying the join-request org validation fix.
-- Review any rows returned before deleting or correcting them.

-- Join requests where organization_id does not match the committee's school
select
  jr.id,
  jr.status,
  jr.organization_id as request_org_id,
  c.organization_id as committee_org_id,
  jr.committee_id,
  jr.user_id,
  jr.created_at
from public.committee_join_requests jr
join public.committees c on c.id = jr.committee_id
where jr.organization_id != c.organization_id
order by jr.created_at desc;

-- Committee members whose organization_id does not match the committee's school
select
  m.id,
  m.status,
  m.organization_id as member_org_id,
  c.organization_id as committee_org_id,
  m.committee_id,
  m.user_id,
  m.display_name,
  m.created_at
from public.committee_members m
join public.committees c on c.id = m.committee_id
where m.organization_id != c.organization_id
order by m.created_at desc;
