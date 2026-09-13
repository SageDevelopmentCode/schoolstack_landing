-- Lock billing start for assignments where effective_start is later than the
-- enrolled_at-derived algorithm (admin-delayed billing). Run AFTER billing-start
-- code deploy and recompute_late_join_billing_start_2026_09_12.sql if used.
--
-- Does NOT lock rows where stored < computed (those need forward recompute).
-- computed_start matches resolveAssignmentBillingStart (see recompute SQL).

-- Preview rows that would be locked
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
  coalesce(tea.metadata->>'billingStartLocked', 'false') as billing_start_locked
from public.tuition_enrollment_assignments tea
join public.enrollments e on e.id = tea.enrollment_id
join public.families f on f.id = tea.family_id
join public.tuition_rate_plans rp on rp.id = tea.rate_plan_id
join public.tuition_payment_plans pp on pp.id = tea.payment_plan_id
where tea.status = 'active'
  and e.status = 'enrolled'
  and e.enrolled_at is not null
  and tea.effective_start is not null
  and coalesce(tea.metadata->>'billingStartLocked', 'false') <> 'true'
  and tea.effective_start > (
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
order by f.name;

-- Apply lock (uncomment after reviewing preview)
/*
update public.tuition_enrollment_assignments tea
set metadata = coalesce(tea.metadata, '{}'::jsonb) || '{"billingStartLocked": true}'::jsonb,
    updated_at = now()
from (
  select tea.id as assignment_id
  from public.tuition_enrollment_assignments tea
  join public.enrollments e on e.id = tea.enrollment_id
  join public.tuition_rate_plans rp on rp.id = tea.rate_plan_id
  join public.tuition_payment_plans pp on pp.id = tea.payment_plan_id
  where tea.status = 'active'
    and e.status = 'enrolled'
    and e.enrolled_at is not null
    and tea.effective_start is not null
    and coalesce(tea.metadata->>'billingStartLocked', 'false') <> 'true'
    and tea.effective_start > (
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
) sub
where tea.id = sub.assignment_id;
*/
