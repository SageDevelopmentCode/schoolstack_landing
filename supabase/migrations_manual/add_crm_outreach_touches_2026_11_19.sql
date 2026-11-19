-- Promoted to supabase/migrations/20261169_add_crm_outreach_touches.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Demo outreach tracking for /admin/demos.
--   * schools.crm_status gains 'followed_up' and 'replied'.
--   * schools.next_follow_up_at: when to reach out next.
--   * crm_outreach_touches: one row per email / DM / call / reply logged against a CRM school.
-- Run after: 20261168_add_website_marketing_schedule_posts.sql

-- 1. Widen the crm_status check. The inline check from 202601010001 is auto-named, so drop
--    whichever check constraint covers crm_status before adding the named one.
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.schools'::regclass
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%crm_status%'
  loop
    execute format('alter table public.schools drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.schools
  add constraint schools_crm_status_check
  check (crm_status in (
    'not_contacted',
    'contacted',
    'followed_up',
    'replied',
    'nurturing',
    'demo_scheduled',
    'proposal_sent',
    'not_interested',
    'won'
  ));

-- 2. Next follow-up date.
alter table public.schools
  add column if not exists next_follow_up_at timestamptz;

-- 3. Touch log.
create table if not exists public.crm_outreach_touches (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  channel      text not null default 'email'
               check (channel in ('email', 'instagram', 'facebook', 'linkedin', 'phone', 'in_person', 'other')),
  direction    text not null default 'outbound'
               check (direction in ('outbound', 'inbound')),
  note         text not null default '',
  occurred_at  timestamptz not null default now(),
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists crm_outreach_touches_school_occurred_idx
  on public.crm_outreach_touches (school_id, occurred_at desc);

alter table public.crm_outreach_touches enable row level security;

drop policy if exists "Platform admins manage crm outreach touches"
  on public.crm_outreach_touches;
create policy "Platform admins manage crm outreach touches"
  on public.crm_outreach_touches
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
