-- Repeat demo availability weekly pattern from 2026-08-30 .. 2026-09-05
-- for 2026-09-06 through 2026-11-30.
-- Idempotent: safe to re-run.
-- Date: 2026-08-26

insert into public.demo_availability_slots (date, time_slot)
select d::date, slot
from generate_series('2026-09-06'::date, '2026-11-30'::date, interval '1 day') as d
cross join lateral (
  select unnest(
    case extract(dow from d::date)::int
      when 0 then array[  -- Sunday
        '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
      ]
      when 1 then array[  -- Monday
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'
      ]
      when 2 then array[  -- Tuesday
        '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
        '10:00 AM', '10:30 AM', '11:00 AM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
      ]
      when 3 then array[  -- Wednesday
        '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
        '10:00 AM', '10:30 AM', '11:00 AM'
      ]
      when 4 then array[  -- Thursday
        '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
        '10:00 AM', '10:30 AM', '11:00 AM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
      ]
      when 5 then array[  -- Friday
        '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
        '10:00 AM', '10:30 AM', '11:00 AM'
      ]
      when 6 then array[  -- Saturday
        '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
        '10:00 AM', '10:30 AM', '11:00 AM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
      ]
    end
  ) as slot
) slots
on conflict (date, time_slot) do nothing;

-- Optional: spot-check one week (e.g. Sept 7–13)
select date, array_agg(time_slot order by time_slot) as slots
from public.demo_availability_slots
where date between '2026-09-07' and '2026-09-13'
group by date
order by date;
