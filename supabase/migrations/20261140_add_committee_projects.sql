-- Committee projects + per-project supply lists.
-- Run after: 20261139_add_school_newsletter_edition_versions.sql

create table if not exists public.committee_projects (
  id                    uuid primary key default gen_random_uuid(),
  committee_id          uuid not null references public.committees(id) on delete cascade,
  organization_id       uuid not null references public.organizations(id) on delete cascade,
  name                  text not null default '',
  description           text not null default '',
  status                text not null default 'draft'
    check (status in ('draft', 'active')),
  sort_order            int not null default 0,
  created_by_member_id  uuid references public.committee_members(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists committee_projects_committee_id_idx
  on public.committee_projects (committee_id);

create index if not exists committee_projects_organization_id_idx
  on public.committee_projects (organization_id);

create index if not exists committee_projects_committee_id_sort_order_idx
  on public.committee_projects (committee_id, sort_order);

drop trigger if exists on_committee_projects_updated on public.committee_projects;
create trigger on_committee_projects_updated
  before update on public.committee_projects
  for each row execute procedure public.handle_updated_at();

create table if not exists public.committee_project_supply_color_legend (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.committee_projects(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  color_id        text not null,
  hex             text not null,
  label           text not null default '',
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (project_id, color_id)
);

create index if not exists committee_project_supply_color_legend_project_id_idx
  on public.committee_project_supply_color_legend (project_id);

drop trigger if exists on_committee_project_supply_color_legend_updated
  on public.committee_project_supply_color_legend;
create trigger on_committee_project_supply_color_legend_updated
  before update on public.committee_project_supply_color_legend
  for each row execute procedure public.handle_updated_at();

create table if not exists public.committee_project_supply_items (
  id                    uuid primary key default gen_random_uuid(),
  project_id            uuid not null references public.committee_projects(id) on delete cascade,
  organization_id       uuid not null references public.organizations(id) on delete cascade,
  name                  text not null default '',
  item_type             text not null default 'consumable'
    check (item_type in ('consumable', 'reusable', 'both')),
  usage_timing          text not null default 'year_round'
    check (usage_timing in ('year_round', 'specific_months')),
  months                text[] not null default '{}',
  color_id              text,
  assigned_member_ids   uuid[] not null default '{}',
  where_to_buy          text not null default '',
  quantity              int not null default 1 check (quantity >= 1),
  quantity_label        text not null default '',
  estimated_price       jsonb not null default '{"mode":"unset"}'::jsonb,
  sort_order            int not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists committee_project_supply_items_project_id_idx
  on public.committee_project_supply_items (project_id);

create index if not exists committee_project_supply_items_organization_id_idx
  on public.committee_project_supply_items (organization_id);

drop trigger if exists on_committee_project_supply_items_updated
  on public.committee_project_supply_items;
create trigger on_committee_project_supply_items_updated
  before update on public.committee_project_supply_items
  for each row execute procedure public.handle_updated_at();

create or replace function public.committee_project_committee_id(p_project_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.committee_id
  from public.committee_projects p
  where p.id = p_project_id
  limit 1;
$$;

create or replace function public.committee_project_organization_id(p_project_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select public.committee_organization_id(p.committee_id)
  from public.committee_projects p
  where p.id = p_project_id
  limit 1;
$$;

-- ── RLS: committee_projects ─────────────────────────────────────────────────

alter table public.committee_projects enable row level security;

create policy "Platform admins manage committee_projects"
  on public.committee_projects for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read committee_projects"
  on public.committee_projects for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_organization_id(committee_id))
  );

create policy "Org admins manage committee_projects"
  on public.committee_projects for all to authenticated
  using (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  )
  with check (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  );

create policy "Committee members read committee_projects"
  on public.committee_projects for select to authenticated
  using (public.user_is_committee_member(committee_id));

create policy "Committee members create committee_projects"
  on public.committee_projects for insert to authenticated
  with check (
    public.user_is_committee_member(committee_id)
    and organization_id = public.committee_organization_id(committee_id)
    and (
      created_by_member_id is null
      or created_by_member_id = public.user_committee_member_id(committee_id)
    )
  );

create policy "Committee members update committee_projects"
  on public.committee_projects for update to authenticated
  using (public.user_is_committee_member(committee_id))
  with check (
    public.user_is_committee_member(committee_id)
    and organization_id = public.committee_organization_id(committee_id)
  );

create policy "Committee members delete committee_projects"
  on public.committee_projects for delete to authenticated
  using (public.user_is_committee_member(committee_id));

-- ── RLS: supply color legend ────────────────────────────────────────────────

alter table public.committee_project_supply_color_legend enable row level security;

create policy "Platform admins manage committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_project_organization_id(project_id))
  );

create policy "Org admins manage committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend for all to authenticated
  using (
    public.user_is_org_admin(public.committee_project_organization_id(project_id))
  )
  with check (
    public.user_is_org_admin(public.committee_project_organization_id(project_id))
  );

create policy "Committee members read committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend for select to authenticated
  using (
    public.user_is_committee_member(public.committee_project_committee_id(project_id))
  );

create policy "Committee members write committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend for all to authenticated
  using (
    public.user_is_committee_member(public.committee_project_committee_id(project_id))
  )
  with check (
    public.user_is_committee_member(public.committee_project_committee_id(project_id))
    and organization_id = public.committee_project_organization_id(project_id)
  );

-- ── RLS: supply items ───────────────────────────────────────────────────────

alter table public.committee_project_supply_items enable row level security;

create policy "Platform admins manage committee_project_supply_items"
  on public.committee_project_supply_items for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read committee_project_supply_items"
  on public.committee_project_supply_items for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_project_organization_id(project_id))
  );

create policy "Org admins manage committee_project_supply_items"
  on public.committee_project_supply_items for all to authenticated
  using (
    public.user_is_org_admin(public.committee_project_organization_id(project_id))
  )
  with check (
    public.user_is_org_admin(public.committee_project_organization_id(project_id))
  );

create policy "Committee members read committee_project_supply_items"
  on public.committee_project_supply_items for select to authenticated
  using (
    public.user_is_committee_member(public.committee_project_committee_id(project_id))
  );

create policy "Committee members write committee_project_supply_items"
  on public.committee_project_supply_items for all to authenticated
  using (
    public.user_is_committee_member(public.committee_project_committee_id(project_id))
  )
  with check (
    public.user_is_committee_member(public.committee_project_committee_id(project_id))
    and organization_id = public.committee_project_organization_id(project_id)
  );
