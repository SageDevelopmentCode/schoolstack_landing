-- Product admissions: document templates
-- Run after: add_product_organizations.sql

create table if not exists public.document_templates (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,
  kind             text not null
                     check (kind in ('inline_sections', 'pdf')),
  content          jsonb not null default '{}'::jsonb,
  status           text not null default 'draft'
                     check (status in ('draft', 'published', 'archived')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists document_templates_organization_id_idx
  on public.document_templates (organization_id);

create index if not exists document_templates_org_status_idx
  on public.document_templates (organization_id, status);

drop trigger if exists on_document_templates_updated on public.document_templates;
create trigger on_document_templates_updated
  before update on public.document_templates
  for each row execute procedure public.handle_updated_at();
