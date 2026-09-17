-- Family-level incomplete admissions reminder tracking (draft apps + enrollment checklists)
-- Run after: 20261001_add_message_broadcast_deliveries.sql

alter table public.families
  add column if not exists incomplete_admissions_reminder_count smallint not null default 0,
  add column if not exists incomplete_admissions_reminder_sent_at timestamptz;

create index if not exists families_incomplete_admissions_reminder_idx
  on public.families (organization_id, incomplete_admissions_reminder_count)
  where incomplete_admissions_reminder_count < 2;
