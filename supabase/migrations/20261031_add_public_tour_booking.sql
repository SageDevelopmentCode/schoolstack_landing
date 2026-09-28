-- Public tour page: group slot metadata, public visit registrants.
-- Run after: 20261030_add_portal_message_deleted_at.sql

alter table public.admissions_availability_slots
  add column if not exists tour_booking_mode text not null default 'exclusive'
    check (tour_booking_mode in ('exclusive', 'group'));

alter table public.admissions_availability_slots
  add column if not exists group_capacity int
    check (group_capacity is null or group_capacity > 0);

alter table public.admissions_availability_slots
  add column if not exists group_day_key date;

alter table public.admissions_availability_slots
  drop constraint if exists admissions_availability_slots_group_capacity_check;

alter table public.admissions_availability_slots
  add constraint admissions_availability_slots_group_capacity_check
  check (
    (tour_booking_mode = 'exclusive' and group_capacity is null)
    or (tour_booking_mode = 'group' and group_capacity is not null)
  );

alter table public.admissions_scheduled_visits
  add column if not exists booking_source text not null default 'application'
    check (booking_source in ('application', 'family_pre_app', 'public'));

alter table public.admissions_scheduled_visits
  add column if not exists registrant jsonb;

update public.admissions_scheduled_visits
set booking_source = 'family_pre_app'
where application_id is null
  and family_id is not null
  and booking_source = 'application';

alter table public.admissions_scheduled_visits
  drop constraint if exists admissions_scheduled_visits_owner_check;

alter table public.admissions_scheduled_visits
  add constraint admissions_scheduled_visits_owner_check
  check (
    application_id is not null
    or family_id is not null
    or booking_source = 'public'
  );

alter table public.admissions_scheduled_visits
  drop constraint if exists admissions_scheduled_visits_public_registrant_check;

alter table public.admissions_scheduled_visits
  add constraint admissions_scheduled_visits_public_registrant_check
  check (
    booking_source <> 'public'
    or registrant is not null
  );
