-- Phase 1.5b: tier on enrollment assignments + pending schedule selection metadata

alter table public.tuition_enrollment_assignments
  add column if not exists rate_tier_id uuid references public.tuition_rate_tiers(id) on delete restrict,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists tuition_enrollment_assignments_rate_tier_id_idx
  on public.tuition_enrollment_assignments (rate_tier_id);

-- Backfill existing assignments to each rate plan's default tier
update public.tuition_enrollment_assignments a
set rate_tier_id = t.id
from public.tuition_rate_tiers t
where t.rate_plan_id = a.rate_plan_id
  and t.is_default = true
  and a.rate_tier_id is null;
