-- Void duplicate August 2026 late fees for Joseph Olson / Olson Family (rooted-meadows).
-- Root cause: daily charge regeneration created new tuition rows; late fees deduped by
-- source charge ID, producing one $50 fee per day instead of one per month.
-- Keep add5d797-2d5e-44dd-a148-d3f318391f59 (already paid) for audit trail.
-- Run in Supabase SQL Editor.

update public.tuition_charges
set status = 'void',
    updated_at = now()
where id in (
  'c65e7490-eaa5-480c-ac3f-02b16069c4fd',
  'ac019dc3-70c9-40b9-a618-7d4863397b4e',
  'f29b61aa-28bb-4d3b-bc1e-8221c4ead3fd'
)
and family_id = '5ec9c59c-1065-4269-a331-991016acc32d'
and charge_type = 'late_fee'
and status = 'overdue';

-- Verify: expect 0 rows with overdue duplicate late fees for this family/period
select tc.id, tc.label, tc.status, tc.amount_cents, tc.metadata
from public.tuition_charges tc
where tc.family_id = '5ec9c59c-1065-4269-a331-991016acc32d'
  and tc.charge_type = 'late_fee'
  and tc.metadata->>'periodYear' = '2026'
  and tc.metadata->>'periodMonth' = '8'
  and tc.status != 'void'
order by tc.created_at;
