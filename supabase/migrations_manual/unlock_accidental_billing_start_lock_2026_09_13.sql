-- Unlock tuition assignments where billingStartLocked was set accidentally
-- (e.g. tier/plan-only save from TuitionAssignmentModal before 2026-09-13 fix).
--
-- Run preview first. After unlock, use recompute_late_join_billing_start_2026_09_12.sql
-- for enrolled late joiners, then regenerate charges per assignment.
--
-- computed_start_from_enrolled_at matches resolveAssignmentBillingStart (see recompute SQL).

-- Preview: locked rows where stored start matches rate-plan fallback or would
-- differ from enrolled_at-derived start (likely accidental lock).
select
  f.name as family_name,
  e.id as enrollment_id,
  e.status as enrollment_status,
  tea.id as assignment_id,
  tea.effective_start as current_start,
  rp.effective_start as rate_plan_start,
  e.enrolled_at,
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
  end as computed_start_from_enrolled_at,
  tea.metadata->>'billingStartLocked' as billing_start_locked
from public.tuition_enrollment_assignments tea
join public.enrollments e on e.id = tea.enrollment_id
join public.families f on f.id = tea.family_id
join public.tuition_rate_plans rp on rp.id = tea.rate_plan_id
join public.tuition_payment_plans pp on pp.id = tea.payment_plan_id
where tea.status = 'active'
  and coalesce(tea.metadata->>'billingStartLocked', 'false') = 'true'
  and (
    -- Pending enrollment: locked while effective_start still mirrors plan start
    (
      e.enrolled_at is null
      and tea.effective_start is not null
      and tea.effective_start = rp.effective_start
    )
    or
    -- Enrolled late joiner: locked start disagrees with enrolled_at computation
    (
      e.enrolled_at is not null
      and e.status = 'enrolled'
      and tea.effective_start is not null
      and tea.effective_start < (
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
        end
      )
    )
  )
order by f.name;

-- Apply unlock (uncomment after reviewing preview).
-- Does not change effective_start; run recompute SQL afterward if needed.
/*
update public.tuition_enrollment_assignments tea
set metadata = tea.metadata - 'billingStartLocked',
    updated_at = now()
from (
  select tea.id as assignment_id
  from public.tuition_enrollment_assignments tea
  join public.enrollments e on e.id = tea.enrollment_id
  join public.tuition_rate_plans rp on rp.id = tea.rate_plan_id
  join public.tuition_payment_plans pp on pp.id = tea.payment_plan_id
  where tea.status = 'active'
    and coalesce(tea.metadata->>'billingStartLocked', 'false') = 'true'
    and (
      (
        e.enrolled_at is null
        and tea.effective_start is not null
        and tea.effective_start = rp.effective_start
      )
      or
      (
        e.enrolled_at is not null
        and e.status = 'enrolled'
        and tea.effective_start is not null
        and tea.effective_start < (
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
          end
        )
      )
    )
) sub
where tea.id = sub.assignment_id;
*/
