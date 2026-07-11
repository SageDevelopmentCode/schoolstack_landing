-- CRM schools table (internal prospect list)
-- Required before add_demo_slug.sql and add_profiles_and_admin_rls.sql.
-- Idempotent — safe to re-run.

create table if not exists public.schools (
  id                  uuid primary key default gen_random_uuid(),
  school_id           text unique not null,
  name                text not null,
  state               text not null,
  location            text not null,
  website             text not null,
  school_model        text not null,
  grades              text not null default '',
  estimated_size      text not null default '',
  tuition_schedule    text not null default '',
  strengths           text[] not null default '{}',
  pain_points         text[] not null default '{}',
  software_fit_reason text not null default '',
  priority_score      int  not null default 4,
  confidence          text not null default '',
  is_closing          boolean not null default false,
  source_file         text not null default 'texas',
  crm_status          text not null default 'not_contacted'
                        check (crm_status in (
                          'not_contacted',
                          'contacted',
                          'nurturing',
                          'demo_scheduled',
                          'proposal_sent',
                          'not_interested',
                          'won'
                        )),
  contact_name        text not null default '',
  contact_email       text not null default '',
  contact_phone       text not null default '',
  notes               text not null default '',
  last_contacted_at   timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_schools_updated on public.schools;
create trigger on_schools_updated
  before update on public.schools
  for each row execute procedure public.handle_updated_at();

alter table public.schools enable row level security;

drop policy if exists "Allow all access" on public.schools;
create policy "Allow all access"
  on public.schools
  for all
  using (true)
  with check (true);
