-- Recompute tuition effective_start from enrollments.enrolled_at for late joiners.
-- Run AFTER add_enrollment_enrolled_at_2026_09_12.sql and billing-start code deploy.
--
-- Matches resolveAssignmentBillingStart in src/lib/tuition/billing-start.ts:
--   - day > billing_day advances month only in the plan-start month
--   - after plan-start month, bills enrollment month regardless of day
--   - output uses least(billing_day, 28), not always the 1st
--
-- Targets active assignments where auto billing start (from enrolled_at) is later
-- than the stored effective_start, and billing start was not manually locked.
--
-- After running, regenerate charges per assignment (admin PATCH with same values,
-- or browser console fetch to /api/tuition/assignments/{id}).

-- Preview rows that would change
select
  f.name as family_name,
  e.id as enrollment_id,
  tea.id as assignment_id,
  tea.effective_start as current_start,
  case
    when e.enrolled_at is null then null
    when date_trunc('month', e.enrolled_at at time zone 'UTC')
      < date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
      then (
        date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
        + (least(coalesce(pp.billing_day_of_month, 1), 28) - 1) * interval '1 day'
      )::date
    when date_trunc('month', e.enrolled_at at time zone 'UTC')
      = date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
      and extract(day from e.enrolled_at at time zone 'UTC')
        > least(coalesce(pp.billing_day_of_month, 1), 28)
      then (
        date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
        + interval '1 month'
        + (least(coalesce(pp.billing_day_of_month, 1), 28) - 1) * interval '1 day'
      )::date
    when date_trunc('month', e.enrolled_at at time zone 'UTC')
      = date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
      then (
        date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
        + (least(coalesce(pp.billing_day_of_month, 1), 28) - 1) * interval '1 day'
      )::date
    else (
      date_trunc('month', e.enrolled_at at time zone 'UTC')
      + (least(coalesce(pp.billing_day_of_month, 1), 28) - 1) * interval '1 day'
    )::date
  end as computed_start,
  e.enrolled_at,
  e.created_at as checklist_started_at
from public.tuition_enrollment_assignments tea
join public.enrollments e on e.id = tea.enrollment_id
join public.families f on f.id = tea.family_id
join public.tuition_rate_plans rp on rp.id = tea.rate_plan_id
join public.tuition_payment_plans pp on pp.id = tea.payment_plan_id
where tea.status = 'active'
  and e.status = 'enrolled'
  and e.enrolled_at is not null
  and coalesce(tea.metadata->>'billingStartLocked', 'false') <> 'true'
  and tea.effective_start is not null;

-- Apply updates (uncomment after reviewing preview)
/*
update public.tuition_enrollment_assignments tea
set effective_start = sub.computed_start,
    updated_at = now()
from (
  select
    tea.id as assignment_id,
    to_char(
      case
        when date_trunc('month', e.enrolled_at at time zone 'UTC')
          < date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
          then (
            date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
            + (least(coalesce(pp.billing_day_of_month, 1), 28) - 1) * interval '1 day'
          )::date
        when date_trunc('month', e.enrolled_at at time zone 'UTC')
          = date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
          and extract(day from e.enrolled_at at time zone 'UTC')
            > least(coalesce(pp.billing_day_of_month, 1), 28)
          then (
            date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
            + interval '1 month'
            + (least(coalesce(pp.billing_day_of_month, 1), 28) - 1) * interval '1 day'
          )::date
        when date_trunc('month', e.enrolled_at at time zone 'UTC')
          = date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
          then (
            date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
            + (least(coalesce(pp.billing_day_of_month, 1), 28) - 1) * interval '1 day'
          )::date
        else (
          date_trunc('month', e.enrolled_at at time zone 'UTC')
          + (least(coalesce(pp.billing_day_of_month, 1), 28) - 1) * interval '1 day'
        )::date
      end,
      'YYYY-MM-DD'
    ) as computed_start
  from public.tuition_enrollment_assignments tea
  join public.enrollments e on e.id = tea.enrollment_id
  join public.tuition_rate_plans rp on rp.id = tea.rate_plan_id
  join public.tuition_payment_plans pp on pp.id = tea.payment_plan_id
  where tea.status = 'active'
    and e.status = 'enrolled'
    and e.enrolled_at is not null
    and coalesce(tea.metadata->>'billingStartLocked', 'false') <> 'true'
) sub
where tea.id = sub.assignment_id
  and sub.computed_start is not null
  and sub.computed_start::date > tea.effective_start;
*/
