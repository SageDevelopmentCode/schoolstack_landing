-- -- Normalize tuition assignment effective_start to billing-day anchors.
-- -- Legacy rows may store rate-plan calendar dates (e.g. 2026-08-17) instead of
-- -- first due dates (2026-08-01). Run preview first; then uncomment update block.
-- --
-- -- After update, regenerate charges per assignment (admin PATCH or regen script).

-- -- Preview rows where day-of-month does not match payment plan billing day
-- select
--   f.name as family_name,
--   tea.id as assignment_id,
--   tea.effective_start as current_start,
--   to_char(
--     date_trunc(
--       'month',
--       tea.effective_start::timestamp at time zone 'UTC'
--     ) + (least(coalesce(pp.billing_day_of_month, 1), 28) - 1) * interval '1 day',
--     'YYYY-MM-DD'
--   ) as normalized_start,
--   pp.billing_day_of_month,
--   coalesce(tea.metadata->>'billingStartLocked', 'false') as billing_start_locked
-- from public.tuition_enrollment_assignments tea
-- join public.families f on f.id = tea.family_id
-- join public.tuition_payment_plans pp on pp.id = tea.payment_plan_id
-- where tea.status = 'active'
--   and tea.effective_start is not null
--   and extract(
--     day from tea.effective_start::timestamp at time zone 'UTC'
--   ) != least(coalesce(pp.billing_day_of_month, 1), 28)
--   and coalesce(tea.metadata->>'billingStartLocked', 'false') <> 'true'
-- order by f.name;

/*
update public.tuition_enrollment_assignments tea
set effective_start = sub.normalized_start,
    updated_at = now()
from (
  select
    tea.id as assignment_id,
    to_char(
      date_trunc(
        'month',
        tea.effective_start::timestamp at time zone 'UTC'
      ) + (least(coalesce(pp.billing_day_of_month, 1), 28) - 1) * interval '1 day',
      'YYYY-MM-DD'
    ) as normalized_start
  from public.tuition_enrollment_assignments tea
  join public.tuition_payment_plans pp on pp.id = tea.payment_plan_id
  where tea.status = 'active'
    and tea.effective_start is not null
    and extract(
      day from tea.effective_start::timestamp at time zone 'UTC'
    ) != least(coalesce(pp.billing_day_of_month, 1), 28)
    and coalesce(tea.metadata->>'billingStartLocked', 'false') <> 'true'
) sub
where tea.id = sub.assignment_id;
*/
