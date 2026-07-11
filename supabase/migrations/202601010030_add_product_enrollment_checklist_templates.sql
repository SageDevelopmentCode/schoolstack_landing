-- Product admissions: enrollment checklist templates
-- Run after: add_product_document_templates.sql, add_product_fee_definitions.sql

create table if not exists public.enrollment_checklist_templates (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  program_id       uuid references public.programs(id) on delete set null,
  name             text not null,
  enrollment_path  text not null,
  status           text not null default 'draft'
                     check (status in ('draft', 'published', 'archived')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists enrollment_checklist_templates_organization_id_idx
  on public.enrollment_checklist_templates (organization_id);

create index if not exists enrollment_checklist_templates_org_status_idx
  on public.enrollment_checklist_templates (organization_id, status);

create index if not exists enrollment_checklist_templates_org_path_idx
  on public.enrollment_checklist_templates (organization_id, enrollment_path);

create index if not exists enrollment_checklist_templates_program_id_idx
  on public.enrollment_checklist_templates (program_id)
  where program_id is not null;

drop trigger if exists on_enrollment_checklist_templates_updated on public.enrollment_checklist_templates;
create trigger on_enrollment_checklist_templates_updated
  before update on public.enrollment_checklist_templates
  for each row execute procedure public.handle_updated_at();

-- ── enrollment_checklist_template_items ───────────────────────────────────────

create table if not exists public.enrollment_checklist_template_items (
  id                     uuid primary key default gen_random_uuid(),
  template_id            uuid not null references public.enrollment_checklist_templates(id) on delete cascade,
  organization_id        uuid not null references public.organizations(id) on delete cascade,
  item_key               text not null,
  sort_order             integer not null default 0,
  label                  text not null,
  type                   text not null
                           check (type in (
                             'document_sign',
                             'form',
                             'file_upload',
                             'payment',
                             'acknowledgment'
                           )),
  required               boolean not null default true,
  document_template_id   uuid references public.document_templates(id) on delete set null,
  fee_definition_id      uuid references public.fee_definitions(id) on delete set null,
  form_schema            jsonb,
  metadata               jsonb not null default '{}'::jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  unique (template_id, item_key)
);

create index if not exists enrollment_checklist_template_items_template_id_idx
  on public.enrollment_checklist_template_items (template_id);

create index if not exists enrollment_checklist_template_items_organization_id_idx
  on public.enrollment_checklist_template_items (organization_id);

create index if not exists enrollment_checklist_template_items_template_sort_idx
  on public.enrollment_checklist_template_items (template_id, sort_order);

drop trigger if exists on_enrollment_checklist_template_items_updated on public.enrollment_checklist_template_items;
create trigger on_enrollment_checklist_template_items_updated
  before update on public.enrollment_checklist_template_items
  for each row execute procedure public.handle_updated_at();
