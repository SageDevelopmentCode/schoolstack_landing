-- Demo availability weekly pattern for 2026-12-01 through 2027-02-28.
-- All times are Central Time, 30-minute starts (20-minute calls).
--   Sat / Sun:      8:00 AM – 9:30 PM
--   Mon / Wed / Fri: 8:00 – 9:00 AM, then 5:00 – 9:30 PM
--   Tue / Thu:      8:00 – 9:00 AM, then 3:00 – 9:30 PM
-- Idempotent: safe to re-run.
-- Date: 2026-11-21

with
  morning as (select array['8:00 AM', '8:30 AM', '9:00 AM'] as s),
  weekend as (select array[
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
  ] as s),
  from_3pm as (select array[
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
  ] as s),
  from_5pm as (select array[
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
  ] as s)
insert into public.demo_availability_slots (date, time_slot)
select d::date, slot
from generate_series('2026-12-01'::date, '2027-02-28'::date, interval '1 day') as d
cross join morning, weekend, from_3pm, from_5pm
cross join lateral unnest(
  case extract(dow from d::date)::int
    when 0 then weekend.s                      -- Sunday
    when 6 then weekend.s                      -- Saturday
    when 2 then morning.s || from_3pm.s        -- Tuesday
    when 4 then morning.s || from_3pm.s        -- Thursday
    else morning.s || from_5pm.s               -- Monday, Wednesday, Friday
  end
) as slot
on conflict (date, time_slot) do nothing;

-- Spot-check: slots per weekday (expect Sun/Sat 28, Tue/Thu 17, Mon/Wed/Fri 13).
select to_char(date, 'Dy') as weekday, min(n) as min_slots, max(n) as max_slots, count(*) as days
from (
  select date, count(*) as n
  from public.demo_availability_slots
  where date between '2026-12-01' and '2027-02-28'
  group by date
) per_day
group by 1, extract(dow from date)
order by extract(dow from date);
