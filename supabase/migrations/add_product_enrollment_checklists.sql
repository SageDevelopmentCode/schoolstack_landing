-- Product admissions: enrollment checklists, items, and document signatures
-- Run after: add_product_enrollment_checklist_templates.sql, add_product_enrollments.sql

create table if not exists public.enrollment_checklists (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  enrollment_id    uuid not null references public.enrollments(id) on delete cascade,
  template_id      uuid not null references public.enrollment_checklist_templates(id) on delete restrict,
  status           text not null default 'not_started'
                     check (status in ('not_started', 'in_progress', 'completed')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (enrollment_id)
);

create index if not exists enrollment_checklists_organization_id_idx
  on public.enrollment_checklists (organization_id);

create index if not exists enrollment_checklists_template_id_idx
  on public.enrollment_checklists (template_id);

create index if not exists enrollment_checklists_org_status_idx
  on public.enrollment_checklists (organization_id, status);

drop trigger if exists on_enrollment_checklists_updated on public.enrollment_checklists;
create trigger on_enrollment_checklists_updated
  before update on public.enrollment_checklists
  for each row execute procedure public.handle_updated_at();

-- ── document_signatures ───────────────────────────────────────────────────────

create table if not exists public.document_signatures (
  id                     uuid primary key default gen_random_uuid(),
  organization_id        uuid not null references public.organizations(id) on delete cascade,
  document_template_id   uuid not null references public.document_templates(id) on delete restrict,
  signed_by_user_id      uuid references auth.users(id) on delete set null,
  signer_name            text not null,
  signature_data         jsonb not null default '{}'::jsonb,
  signed_at              timestamptz not null default now(),
  ip_address             text,
  created_at             timestamptz not null default now()
);

create index if not exists document_signatures_organization_id_idx
  on public.document_signatures (organization_id);

create index if not exists document_signatures_document_template_id_idx
  on public.document_signatures (document_template_id);

create index if not exists document_signatures_signed_by_user_id_idx
  on public.document_signatures (signed_by_user_id)
  where signed_by_user_id is not null;

-- ── enrollment_checklist_items ──────────────────────────────────────────────────

create table if not exists public.enrollment_checklist_items (
  id                      uuid primary key default gen_random_uuid(),
  checklist_id            uuid not null references public.enrollment_checklists(id) on delete cascade,
  organization_id         uuid not null references public.organizations(id) on delete cascade,
  template_item_id        uuid not null references public.enrollment_checklist_template_items(id) on delete restrict,
  item_key                text not null,
  status                  text not null default 'not_started'
                            check (status in ('not_started', 'in_progress', 'completed', 'waived')),
  responses               jsonb not null default '{}'::jsonb,
  storage_path            text,
  document_signature_id   uuid references public.document_signatures(id) on delete set null,
  payment_status          text not null default 'not_required'
                            check (payment_status in ('not_required', 'pending', 'paid', 'waived')),
  completed_at            timestamptz,
  completed_by_user_id    uuid references auth.users(id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  unique (checklist_id, template_item_id)
);

create index if not exists enrollment_checklist_items_checklist_id_idx
  on public.enrollment_checklist_items (checklist_id);

create index if not exists enrollment_checklist_items_organization_id_idx
  on public.enrollment_checklist_items (organization_id);

create index if not exists enrollment_checklist_items_checklist_status_idx
  on public.enrollment_checklist_items (checklist_id, status);

create index if not exists enrollment_checklist_items_document_signature_id_idx
  on public.enrollment_checklist_items (document_signature_id)
  where document_signature_id is not null;

drop trigger if exists on_enrollment_checklist_items_updated on public.enrollment_checklist_items;
create trigger on_enrollment_checklist_items_updated
  before update on public.enrollment_checklist_items
  for each row execute procedure public.handle_updated_at();

-- =============================================================================
-- Optional helper: materialize checklist items from template (app layer or manual)
-- =============================================================================
--
-- create or replace function public.materialize_enrollment_checklist_items(p_checklist_id uuid)
-- returns void
-- language plpgsql
-- security definer
-- set search_path = public
-- as $$
-- declare
--   v_template_id uuid;
--   v_organization_id uuid;
-- begin
--   select template_id, organization_id
--   into v_template_id, v_organization_id
--   from public.enrollment_checklists
--   where id = p_checklist_id;
--
--   insert into public.enrollment_checklist_items (
--     checklist_id,
--     organization_id,
--     template_item_id,
--     item_key,
--     payment_status
--   )
--   select
--     p_checklist_id,
--     v_organization_id,
--     ti.id,
--     ti.item_key,
--     case when ti.type = 'payment' then 'pending' else 'not_required' end
--   from public.enrollment_checklist_template_items ti
--   where ti.template_id = v_template_id
--   on conflict (checklist_id, template_item_id) do nothing;
-- end;
-- $$;
