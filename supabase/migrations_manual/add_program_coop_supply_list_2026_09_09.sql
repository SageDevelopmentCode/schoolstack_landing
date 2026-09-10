-- Promoted to supabase/migrations/20260909_add_program_coop_supply_list.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Co-op program supply list: color legend + supply items per program.

create table if not exists public.program_coop_supply_color_legend (
  id              uuid primary key default gen_random_uuid(),
  program_id      uuid not null references public.programs(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  color_id        text not null,
  hex             text not null,
  label           text not null default '',
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (program_id, color_id)
);

create index if not exists program_coop_supply_color_legend_program_id_idx
  on public.program_coop_supply_color_legend (program_id);

create index if not exists program_coop_supply_color_legend_organization_id_idx
  on public.program_coop_supply_color_legend (organization_id);

drop trigger if exists on_program_coop_supply_color_legend_updated
  on public.program_coop_supply_color_legend;
create trigger on_program_coop_supply_color_legend_updated
  before update on public.program_coop_supply_color_legend
  for each row execute procedure public.handle_updated_at();

create table if not exists public.program_coop_supply_items (
  id                uuid primary key default gen_random_uuid(),
  program_id        uuid not null references public.programs(id) on delete cascade,
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  name              text not null default '',
  item_type         text not null default 'consumable'
    check (item_type in ('consumable', 'reusable', 'both')),
  usage_timing      text not null default 'year_round'
    check (usage_timing in ('year_round', 'specific_months')),
  months            text[] not null default '{}',
  color_id          text,
  assigned_families text[] not null default '{}',
  where_to_buy      text not null default '',
  quantity          int not null default 1 check (quantity >= 1),
  quantity_label    text not null default '',
  estimated_price   jsonb not null default '{"mode":"unset"}'::jsonb,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists program_coop_supply_items_program_id_idx
  on public.program_coop_supply_items (program_id);

create index if not exists program_coop_supply_items_organization_id_idx
  on public.program_coop_supply_items (organization_id);

create index if not exists program_coop_supply_items_program_id_sort_order_idx
  on public.program_coop_supply_items (program_id, sort_order);

drop trigger if exists on_program_coop_supply_items_updated on public.program_coop_supply_items;
create trigger on_program_coop_supply_items_updated
  before update on public.program_coop_supply_items
  for each row execute procedure public.handle_updated_at();

alter table public.program_coop_supply_color_legend enable row level security;
alter table public.program_coop_supply_items enable row level security;

drop policy if exists "Platform admins manage program_coop_supply_color_legend"
  on public.program_coop_supply_color_legend;
create policy "Platform admins manage program_coop_supply_color_legend"
  on public.program_coop_supply_color_legend for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage program_coop_supply_color_legend"
  on public.program_coop_supply_color_legend;
create policy "Org admins manage program_coop_supply_color_legend"
  on public.program_coop_supply_color_legend for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Staff read program_coop_supply_color_legend"
  on public.program_coop_supply_color_legend;
create policy "Staff read program_coop_supply_color_legend"
  on public.program_coop_supply_color_legend for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Enrolled guardians read program_coop_supply_color_legend"
  on public.program_coop_supply_color_legend;
create policy "Enrolled guardians read program_coop_supply_color_legend"
  on public.program_coop_supply_color_legend for select to authenticated
  using (public.user_can_read_program_coop_curriculum(program_id));

drop policy if exists "Platform admins manage program_coop_supply_items"
  on public.program_coop_supply_items;
create policy "Platform admins manage program_coop_supply_items"
  on public.program_coop_supply_items for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage program_coop_supply_items"
  on public.program_coop_supply_items;
create policy "Org admins manage program_coop_supply_items"
  on public.program_coop_supply_items for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Staff read program_coop_supply_items"
  on public.program_coop_supply_items;
create policy "Staff read program_coop_supply_items"
  on public.program_coop_supply_items for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Enrolled guardians read program_coop_supply_items"
  on public.program_coop_supply_items;
create policy "Enrolled guardians read program_coop_supply_items"
  on public.program_coop_supply_items for select to authenticated
  using (public.user_can_read_program_coop_curriculum(program_id));
