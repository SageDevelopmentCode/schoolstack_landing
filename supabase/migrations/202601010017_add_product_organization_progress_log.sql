-- Organization progress log (daily build updates for school owners)
-- Run after: add_product_organizations.sql
-- Open access for now (no org-member / platform-admin helpers required).

create table if not exists public.organization_progress_log (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  entry_date       date not null,
  phase_number     text not null,
  phase_title      text not null,
  title            text not null,
  summary          text not null,
  highlights       jsonb not null default '[]'::jsonb,
  published        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint organization_progress_log_highlights_is_array
    check (jsonb_typeof(highlights) = 'array'),

  unique (organization_id, entry_date)
);

create index if not exists organization_progress_log_org_date_idx
  on public.organization_progress_log (organization_id, entry_date desc);

create index if not exists organization_progress_log_published_idx
  on public.organization_progress_log (organization_id, published, entry_date desc);

drop trigger if exists on_organization_progress_log_updated on public.organization_progress_log;
create trigger on_organization_progress_log_updated
  before update on public.organization_progress_log
  for each row execute procedure public.handle_updated_at();

alter table public.organization_progress_log enable row level security;

create policy "Allow all access"
  on public.organization_progress_log
  for all
  using (true)
  with check (true);


-- =============================================================================
-- Seed: July 1, 2026 — Phase 1 (run after Rooted Meadows org exists)
-- =============================================================================
--
-- insert into public.organization_progress_log (
--   organization_id,
--   entry_date,
--   phase_number,
--   phase_title,
--   title,
--   summary,
--   highlights
-- )
-- select
--   o.id,
--   '2026-07-01'::date,
--   '01',
--   'Foundation',
--   'Laying the groundwork for your school''s records',
--   'We started building the foundation for Rooted Meadows in MudKitchen. Think of this as preparing the filing system before we move your records in — we set up the secure structure that will hold your students, families, staff, programs, and classrooms. Your school gets its own private space on the platform, so your information stays separate and protected. This work happens behind the scenes, but it''s what makes everything else possible: your admin dashboard, admissions, and parent portal will all connect to this same foundation as we build them over the next few weeks.',
--   '[
--     "Set up Rooted Meadows as its own school on the platform",
--     "Prepared secure storage for student and family records",
--     "Prepared storage for staff, programs, and classrooms",
--     "Built the foundation that admissions and billing will connect to next"
--   ]'::jsonb
-- from public.organizations o
-- where o.slug = 'rooted-meadows-school';
