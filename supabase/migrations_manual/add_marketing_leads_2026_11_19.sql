-- Promoted to supabase/migrations/20261170_add_marketing_leads.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Lead magnets on the public marketing pages:
--   * marketing_leads: one row per email captured by a lead magnet (custom demo request,
--     unfinished demo booking, "email me my plan" on the free tools, the popup), with
--     first-touch attribution (UTMs, referrer, landing page).
--   * demo_requests gains concept_demo_slug and attribution so bookings carry the same data.
-- Writes go through the service role (API routes); platform admins read and update.
-- Run after: 20261169_add_crm_outreach_touches.sql

create table if not exists public.marketing_leads (
  id                  uuid primary key default gen_random_uuid(),

  email               text not null,
  name                text,
  school_name         text,
  website_url         text,
  role                text,
  message             text,

  magnet              text not null,
  magnet_detail       text,
  source_path         text,

  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  utm_content         text,
  utm_term            text,
  referrer            text,
  gclid               text,
  fbclid              text,
  first_landing_path  text,

  status              text not null default 'new',
  demo_slug           text,
  school_id           uuid references public.schools (id) on delete set null,
  admin_notes         text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.marketing_leads
  drop constraint if exists marketing_leads_magnet_check;
alter table public.marketing_leads
  add constraint marketing_leads_magnet_check
  check (magnet in ('custom_demo', 'partial_booking', 'tool_plan', 'template', 'popup'));

alter table public.marketing_leads
  drop constraint if exists marketing_leads_status_check;
alter table public.marketing_leads
  add constraint marketing_leads_status_check
  check (status in ('new', 'building', 'delivered', 'booked', 'dead'));

alter table public.marketing_leads
  drop constraint if exists marketing_leads_lengths_check;
alter table public.marketing_leads
  add constraint marketing_leads_lengths_check
  check (
    char_length(email) <= 254
    and (name is null or char_length(name) <= 120)
    and (school_name is null or char_length(school_name) <= 200)
    and (website_url is null or char_length(website_url) <= 500)
    and (role is null or char_length(role) <= 40)
    and (message is null or char_length(message) <= 1000)
    and (magnet_detail is null or char_length(magnet_detail) <= 100)
    and (source_path is null or char_length(source_path) <= 500)
    and (utm_source is null or char_length(utm_source) <= 200)
    and (utm_medium is null or char_length(utm_medium) <= 200)
    and (utm_campaign is null or char_length(utm_campaign) <= 200)
    and (utm_content is null or char_length(utm_content) <= 200)
    and (utm_term is null or char_length(utm_term) <= 200)
    and (referrer is null or char_length(referrer) <= 500)
    and (gclid is null or char_length(gclid) <= 300)
    and (fbclid is null or char_length(fbclid) <= 300)
    and (first_landing_path is null or char_length(first_landing_path) <= 500)
    and (demo_slug is null or char_length(demo_slug) <= 100)
    and (admin_notes is null or char_length(admin_notes) <= 5000)
  );

drop trigger if exists on_marketing_leads_updated on public.marketing_leads;
create trigger on_marketing_leads_updated
  before update on public.marketing_leads
  for each row execute procedure public.handle_updated_at();

alter table public.marketing_leads enable row level security;

drop policy if exists "Platform admins read marketing leads" on public.marketing_leads;
create policy "Platform admins read marketing leads"
  on public.marketing_leads
  for select
  to authenticated
  using (public.is_platform_admin());

drop policy if exists "Platform admins update marketing leads" on public.marketing_leads;
create policy "Platform admins update marketing leads"
  on public.marketing_leads
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create index if not exists marketing_leads_created_at_idx
  on public.marketing_leads (created_at desc);
create index if not exists marketing_leads_status_idx
  on public.marketing_leads (status);
create index if not exists marketing_leads_email_magnet_idx
  on public.marketing_leads (email, magnet);

-- Bookings: keep the walkthrough demo slug and first-touch attribution.
alter table public.demo_requests
  add column if not exists concept_demo_slug text;
alter table public.demo_requests
  add column if not exists attribution jsonb;
