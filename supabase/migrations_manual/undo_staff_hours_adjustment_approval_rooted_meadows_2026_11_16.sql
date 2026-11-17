-- One-off: undo accidental approval of a staff hours adjustment request.
-- School: Rooted Meadows Waldorf School (rooted-meadows)
-- Run once in Supabase SQL Editor on production. Not applied by supabase db reset.
-- 2026-11-16 — approval email already sent; notify teacher separately after undo.
--
-- Request:  47a43d74-0ff1-477d-92fc-dd3c7a755176
-- Work date: 2026-11-04 (proposed 09:30–11:45 America/Denver)
-- Entry inserted on approve: 290300c1-396a-4723-a290-3a0c4e1f90f6

-- =============================================================================
-- PRE-FLIGHT — run and confirm before the undo block
-- =============================================================================

-- Request should be approved with expected snapshot
select
  id,
  status,
  work_date,
  proposed_sessions,
  previous_sessions,
  reviewed_by_user_id,
  reviewed_at
from public.staff_hours_adjustment_requests
where id = '47a43d74-0ff1-477d-92fc-dd3c7a755176'::uuid;

-- Applied work-time row (only closed session for that day)
select
  id,
  work_date,
  clock_in_at,
  clock_out_at,
  recorded_by_user_id,
  created_at
from public.staff_work_time_entries
where id = '290300c1-396a-4723-a290-3a0c4e1f90f6'::uuid;

-- Must be zero other pending requests for same staff/day
select id, status
from public.staff_hours_adjustment_requests
where organization_id = '8adbfe08-b25b-4626-b3ac-23424a1a0a3b'::uuid
  and staff_member_id = 'ca82d6e8-673b-486d-91c9-fae6fe2cbe61'::uuid
  and work_date = '2026-11-04'::date
  and status = 'pending';

-- =============================================================================
-- UNDO — revert to pending and remove hours written by approval
-- =============================================================================

do $$
declare
  v_request_id uuid := '47a43d74-0ff1-477d-92fc-dd3c7a755176'::uuid;
  v_org_id uuid := '8adbfe08-b25b-4626-b3ac-23424a1a0a3b'::uuid;
  v_staff_id uuid := 'ca82d6e8-673b-486d-91c9-fae6fe2cbe61'::uuid;
  v_work_date date := '2026-11-04'::date;
  v_entry_id uuid := '290300c1-396a-4723-a290-3a0c4e1f90f6'::uuid;
  v_expected_reviewer uuid := '4d4d2d8c-ad79-4da2-951a-7df2027cbcce'::uuid;
  v_expected_reviewed_at timestamptz := '2026-11-16 07:41:21.669985+00'::timestamptz;
  v_request public.staff_hours_adjustment_requests%rowtype;
  v_pending_count integer;
  v_deleted integer;
  v_updated integer;
begin
  select count(*)::integer
  into v_pending_count
  from public.staff_hours_adjustment_requests
  where organization_id = v_org_id
    and staff_member_id = v_staff_id
    and work_date = v_work_date
    and status = 'pending'
    and id is distinct from v_request_id;

  if v_pending_count > 0 then
    raise exception 'undo_hours_approval:another_pending_request_exists (%)', v_pending_count;
  end if;

  select *
  into v_request
  from public.staff_hours_adjustment_requests
  where id = v_request_id
    and organization_id = v_org_id
    and staff_member_id = v_staff_id
    and work_date = v_work_date
  for update;

  if not found then
    raise exception 'undo_hours_approval:request_not_found';
  end if;

  if v_request.status is distinct from 'approved' then
    raise exception 'undo_hours_approval:expected_status_approved got %', v_request.status;
  end if;

  if v_request.reviewed_by_user_id is distinct from v_expected_reviewer then
    raise exception 'undo_hours_approval:unexpected_reviewer';
  end if;

  if v_request.reviewed_at is distinct from v_expected_reviewed_at then
    raise exception 'undo_hours_approval:unexpected_reviewed_at got %', v_request.reviewed_at;
  end if;

  if v_request.proposed_sessions::text
    is distinct from '[{"clockIn": "09:30", "clockOut": "11:45"}]'::text
    and v_request.proposed_sessions::text
    is distinct from '[{"clockIn":"09:30","clockOut":"11:45"}]'::text
  then
    raise exception 'undo_hours_approval:unexpected_proposed_sessions';
  end if;

  if v_request.previous_sessions::text is distinct from '[]'::text then
    raise exception
      'undo_hours_approval:previous_sessions_not_empty — extend script to restore sessions';
  end if;

  if not exists (
    select 1
    from public.staff_work_time_entries e
    where e.id = v_entry_id
      and e.organization_id = v_org_id
      and e.staff_member_id = v_staff_id
      and e.work_date = v_work_date
      and e.clock_out_at is not null
      and e.recorded_by_user_id = v_expected_reviewer
  ) then
    raise exception 'undo_hours_approval:expected_work_time_entry_missing';
  end if;

  delete from public.staff_work_time_entries
  where id = v_entry_id
    and organization_id = v_org_id
    and staff_member_id = v_staff_id
    and work_date = v_work_date;

  get diagnostics v_deleted = row_count;
  if v_deleted <> 1 then
    raise exception 'undo_hours_approval:delete_entry_expected_1_deleted_%', v_deleted;
  end if;

  update public.staff_hours_adjustment_requests
  set
    status = 'pending',
    reviewed_by_user_id = null,
    reviewed_at = null
  where id = v_request_id
    and status = 'approved';

  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception 'undo_hours_approval:update_request_expected_1_updated_%', v_updated;
  end if;
end;
$$;

-- =============================================================================
-- POST-FLIGHT — expect status pending, no closed entries for 2026-11-04
-- =============================================================================

select id, status, reviewed_by_user_id, reviewed_at
from public.staff_hours_adjustment_requests
where id = '47a43d74-0ff1-477d-92fc-dd3c7a755176'::uuid;

select id, clock_in_at, clock_out_at
from public.staff_work_time_entries
where organization_id = '8adbfe08-b25b-4626-b3ac-23424a1a0a3b'::uuid
  and staff_member_id = 'ca82d6e8-673b-486d-91c9-fae6fe2cbe61'::uuid
  and work_date = '2026-11-04'::date
  and clock_out_at is not null;