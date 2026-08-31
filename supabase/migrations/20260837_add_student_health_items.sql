-- Student health items (parent portal allergies, medications, updates)
-- Run after: 20260836_add_program_description.sql

create table if not exists public.student_health_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  item_type text not null check (item_type in ('allergy', 'medication', 'update')),
  payload jsonb not null default '{}'::jsonb,
  start_date date,
  end_date date,
  ongoing boolean not null default false,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_by_guardian_id uuid references public.guardians(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_health_items_student_org_idx
  on public.student_health_items (student_id, organization_id);

create index if not exists student_health_items_org_updated_idx
  on public.student_health_items (organization_id, updated_at desc);

drop trigger if exists on_student_health_items_updated on public.student_health_items;
create trigger on_student_health_items_updated
  before update on public.student_health_items
  for each row execute procedure public.handle_updated_at();

alter table public.student_health_items enable row level security;

create policy "Platform admins manage student_health_items"
  on public.student_health_items for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage student_health_items"
  on public.student_health_items for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians read student_health_items for own students"
  on public.student_health_items for select to authenticated
  using (public.user_is_guardian_for_student(student_id));
