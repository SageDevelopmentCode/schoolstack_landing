-- Post-submit steps configured on application forms (tour, interview, observation, etc.)
alter table public.application_form_versions
  add column if not exists post_submit_config jsonb not null default '{"actions":[]}'::jsonb;
