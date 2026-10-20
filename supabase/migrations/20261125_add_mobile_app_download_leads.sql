-- Android app download lead capture from marketing /download page.
-- Run after: 20261124_add_scheduled_visit_day_of_parent_reminder.sql

create table if not exists public.mobile_app_download_leads (
  id                 uuid primary key default gen_random_uuid(),

  name               text not null,
  email              text not null,
  platform           text not null default 'android',
  source_page_path   text,

  status             text not null default 'open',

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.mobile_app_download_leads
  drop constraint if exists mobile_app_download_leads_platform_check;

alter table public.mobile_app_download_leads
  add constraint mobile_app_download_leads_platform_check
  check (platform in ('android'));

alter table public.mobile_app_download_leads
  drop constraint if exists mobile_app_download_leads_status_check;

alter table public.mobile_app_download_leads
  add constraint mobile_app_download_leads_status_check
  check (status in ('open', 'contacted', 'cancelled'));

alter table public.mobile_app_download_leads
  drop constraint if exists mobile_app_download_leads_name_length_check;

alter table public.mobile_app_download_leads
  add constraint mobile_app_download_leads_name_length_check
  check (char_length(name) <= 120);

alter table public.mobile_app_download_leads
  drop constraint if exists mobile_app_download_leads_email_length_check;

alter table public.mobile_app_download_leads
  add constraint mobile_app_download_leads_email_length_check
  check (char_length(email) <= 254);

alter table public.mobile_app_download_leads
  drop constraint if exists mobile_app_download_leads_source_page_path_length_check;

alter table public.mobile_app_download_leads
  add constraint mobile_app_download_leads_source_page_path_length_check
  check (
    source_page_path is null
    or char_length(source_page_path) <= 500
  );

drop trigger if exists on_mobile_app_download_leads_updated on public.mobile_app_download_leads;

create trigger on_mobile_app_download_leads_updated
  before update on public.mobile_app_download_leads
  for each row execute procedure public.handle_updated_at();

alter table public.mobile_app_download_leads enable row level security;

drop policy if exists "Platform admins read mobile app download leads"
  on public.mobile_app_download_leads;

create policy "Platform admins read mobile app download leads"
  on public.mobile_app_download_leads
  for select
  to authenticated
  using (public.is_platform_admin());

drop policy if exists "Platform admins update mobile app download leads"
  on public.mobile_app_download_leads;

create policy "Platform admins update mobile app download leads"
  on public.mobile_app_download_leads
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create index if not exists mobile_app_download_leads_created_at_idx
  on public.mobile_app_download_leads (created_at desc);

create index if not exists mobile_app_download_leads_status_idx
  on public.mobile_app_download_leads (status);
