-- Recompute tuition effective_start from enrollments.enrolled_at for late joiners.
-- Run AFTER add_enrollment_enrolled_at_2026_09_12.sql and billing-start code deploy.
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
      then date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')::date
    when extract(day from e.enrolled_at at time zone 'UTC')
      > coalesce(pp.billing_day_of_month, 1)
      then (
        date_trunc('month', e.enrolled_at at time zone 'UTC')
        + interval '1 month'
      )::date
    else date_trunc('month', e.enrolled_at at time zone 'UTC')::date
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
    case
      when date_trunc('month', e.enrolled_at at time zone 'UTC')
        < date_trunc('month', rp.effective_start::timestamp at time zone 'UTC')
        then to_char(
          date_trunc('month', rp.effective_start::timestamp at time zone 'UTC'),
          'YYYY-MM-DD'
        )
      when extract(day from e.enrolled_at at time zone 'UTC')
        > coalesce(pp.billing_day_of_month, 1)
        then to_char(
          date_trunc('month', e.enrolled_at at time zone 'UTC') + interval '1 month',
          'YYYY-MM-DD'
        )
      else to_char(
        date_trunc('month', e.enrolled_at at time zone 'UTC'),
        'YYYY-MM-DD'
      )
    end as computed_start
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
  and sub.computed_start > tea.effective_start;
*/
