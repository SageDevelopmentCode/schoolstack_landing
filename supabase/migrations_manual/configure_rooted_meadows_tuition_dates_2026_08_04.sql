-- Configure Rooted Meadows (production) tuition due & late-fee dates.
-- Target org: rooted-meadows
-- Run in Supabase SQL Editor.
--
-- Schedule (2026):
--   August:   tuition due Aug 10, late fee Aug 15
--   September+: tuition due 1st of month, late fee on the 10th
--
-- Part 1 — run now (late fees + August late-fee override)
-- Part 2 — run after tuition charges are generated (August due-date fix)

-- ── Part 1: Late fee settings + August 2026 override ─────────────────────────

do $$
declare
  v_org_id uuid;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows not found.';
  end if;

  insert into public.organization_settings (organization_id, tuition)
  values (
    v_org_id,
    jsonb_build_object(
      'lateFeeEnabled', true,
      'lateFeeAmountCents', 5000,
      'lateFeeDayOfMonth', 10,
      'lateFeeRecurring', true
    )
  )
  on conflict (organization_id) do update
  set tuition = coalesce(public.organization_settings.tuition, '{}'::jsonb) || jsonb_build_object(
    'lateFeeEnabled', true,
    'lateFeeAmountCents', 5000,
    'lateFeeDayOfMonth', 10,
    'lateFeeRecurring', true
  ),
  updated_at = now();

  insert into public.tuition_late_fee_overrides (
    organization_id,
    year,
    month,
    late_fee_day_of_month
  )
  values (v_org_id, 2026, 8, 15)
  on conflict (organization_id, year, month) do update
  set late_fee_day_of_month = excluded.late_fee_day_of_month,
      updated_at = now();

  raise notice 'Part 1 complete: late fees enabled for rooted-meadows (default day 10, August 2026 override day 15).';
end $$;

-- Verify Part 1
select
  o.slug,
  os.tuition,
  lfo.year,
  lfo.month,
  lfo.late_fee_day_of_month
from public.organizations o
left join public.organization_settings os on os.organization_id = o.id
left join public.tuition_late_fee_overrides lfo
  on lfo.organization_id = o.id
  and lfo.year = 2026
  and lfo.month = 8
where o.slug = 'rooted-meadows';

-- ── Part 2: August tuition due-date correction ───────────────────────────────
-- Run after charges are generated. billing_day_of_month = 1 creates Aug 1 due
-- dates; this moves August tuition to Aug 10. Safe to re-run (idempotent).

do $$
declare
  v_org_id uuid;
  v_updated int;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows not found.';
  end if;

  update public.tuition_charges tc
  set due_date = '2026-08-10',
      updated_at = now()
  where tc.organization_id = v_org_id
    and tc.charge_type = 'tuition'
    and tc.due_date = '2026-08-01'
    and tc.status in ('scheduled', 'sent');

  get diagnostics v_updated = row_count;
  raise notice 'Part 2 complete: updated % August tuition charge(s) to due 2026-08-10.', v_updated;
end $$;

-- Verify Part 2 (expect rows after charges exist)
select
  tc.due_date,
  tc.label,
  tc.status,
  count(*) as charge_count
from public.tuition_charges tc
join public.organizations o on o.id = tc.organization_id
where o.slug = 'rooted-meadows'
  and tc.charge_type = 'tuition'
  and tc.due_date >= '2026-08-01'
  and tc.due_date < '2026-10-01'
group by tc.due_date, tc.label, tc.status
order by tc.due_date, tc.status;
