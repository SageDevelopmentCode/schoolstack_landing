-- Promoted to supabase/migrations/20261110_committee_member_section_reads.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Per-member committee workspace section read timestamps (unread badges).

create table if not exists public.committee_member_section_reads (
  id                  uuid primary key default gen_random_uuid(),
  committee_member_id uuid not null references public.committee_members(id) on delete cascade,
  section             text not null,
  read_at             timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint committee_member_section_reads_section_check
    check (section in ('messages', 'tasks', 'resources', 'calendar')),

  constraint committee_member_section_reads_member_section_unique
    unique (committee_member_id, section)
);

create index if not exists committee_member_section_reads_member_idx
  on public.committee_member_section_reads (committee_member_id);

drop trigger if exists on_committee_member_section_reads_updated on public.committee_member_section_reads;
create trigger on_committee_member_section_reads_updated
  before update on public.committee_member_section_reads
  for each row execute procedure public.handle_updated_at();

alter table public.committee_member_section_reads enable row level security;

create policy "Platform admins manage committee_member_section_reads"
  on public.committee_member_section_reads for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Committee members read own section reads"
  on public.committee_member_section_reads for select to authenticated
  using (
    exists (
      select 1
      from public.committee_members m
      where m.id = committee_member_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy "Committee members insert own section reads"
  on public.committee_member_section_reads for insert to authenticated
  with check (
    exists (
      select 1
      from public.committee_members m
      where m.id = committee_member_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy "Committee members update own section reads"
  on public.committee_member_section_reads for update to authenticated
  using (
    exists (
      select 1
      from public.committee_members m
      where m.id = committee_member_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.committee_members m
      where m.id = committee_member_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );
