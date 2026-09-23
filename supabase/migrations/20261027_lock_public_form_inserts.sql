-- Lock public marketing form inserts behind API routes (service role).
-- Run after: 20261026_add_teacher_parent_form_category.sql

-- public_support_requests
drop policy if exists "Anyone can submit public support requests"
  on public.public_support_requests;

alter table public.public_support_requests
  drop constraint if exists public_support_requests_submitter_name_length_check;

alter table public.public_support_requests
  add constraint public_support_requests_submitter_name_length_check
  check (char_length(submitter_name) <= 120);

alter table public.public_support_requests
  drop constraint if exists public_support_requests_submitter_email_length_check;

alter table public.public_support_requests
  add constraint public_support_requests_submitter_email_length_check
  check (char_length(submitter_email) <= 254);

alter table public.public_support_requests
  drop constraint if exists public_support_requests_source_page_path_length_check;

alter table public.public_support_requests
  add constraint public_support_requests_source_page_path_length_check
  check (
    source_page_path is null
    or char_length(source_page_path) <= 500
  );

alter table public.public_support_requests
  drop constraint if exists public_support_requests_description_length_check;

alter table public.public_support_requests
  add constraint public_support_requests_description_length_check
  check (char_length(description) <= 5000);

-- demo_requests
drop policy if exists "Anyone can submit demo request"
  on public.demo_requests;

alter table public.demo_requests
  drop constraint if exists demo_requests_name_length_check;

alter table public.demo_requests
  add constraint demo_requests_name_length_check
  check (char_length(name) <= 120);

alter table public.demo_requests
  drop constraint if exists demo_requests_email_length_check;

alter table public.demo_requests
  add constraint demo_requests_email_length_check
  check (char_length(email) <= 254);

alter table public.demo_requests
  drop constraint if exists demo_requests_school_name_length_check;

alter table public.demo_requests
  add constraint demo_requests_school_name_length_check
  check (char_length(school_name) <= 200);

alter table public.demo_requests
  drop constraint if exists demo_requests_current_systems_length_check;

alter table public.demo_requests
  add constraint demo_requests_current_systems_length_check
  check (char_length(current_systems) <= 500);

alter table public.demo_requests
  drop constraint if exists demo_requests_website_url_length_check;

alter table public.demo_requests
  add constraint demo_requests_website_url_length_check
  check (char_length(website_url) <= 500);

alter table public.demo_requests
  drop constraint if exists demo_requests_current_tools_length_check;

alter table public.demo_requests
  add constraint demo_requests_current_tools_length_check
  check (char_length(current_tools) <= 500);

alter table public.demo_requests
  drop constraint if exists demo_requests_prep_notes_length_check;

alter table public.demo_requests
  add constraint demo_requests_prep_notes_length_check
  check (char_length(prep_notes) <= 500);

alter table public.demo_requests
  drop constraint if exists demo_requests_scheduled_time_length_check;

alter table public.demo_requests
  add constraint demo_requests_scheduled_time_length_check
  check (char_length(scheduled_time) <= 20);

-- demo_feedback
drop policy if exists "Anyone can submit demo feedback"
  on public.demo_feedback;

alter table public.demo_feedback
  drop constraint if exists demo_feedback_school_slug_length_check;

alter table public.demo_feedback
  add constraint demo_feedback_school_slug_length_check
  check (char_length(school_slug) <= 100);

alter table public.demo_feedback
  drop constraint if exists demo_feedback_school_name_length_check;

alter table public.demo_feedback
  add constraint demo_feedback_school_name_length_check
  check (char_length(school_name) <= 200);

alter table public.demo_feedback
  drop constraint if exists demo_feedback_name_length_check;

alter table public.demo_feedback
  add constraint demo_feedback_name_length_check
  check (name is null or char_length(name) <= 120);

alter table public.demo_feedback
  drop constraint if exists demo_feedback_email_length_check;

alter table public.demo_feedback
  add constraint demo_feedback_email_length_check
  check (email is null or char_length(email) <= 254);

alter table public.demo_feedback
  drop constraint if exists demo_feedback_message_length_check;

alter table public.demo_feedback
  add constraint demo_feedback_message_length_check
  check (char_length(message) <= 5000);

alter table public.demo_feedback
  drop constraint if exists demo_feedback_source_length_check;

alter table public.demo_feedback
  add constraint demo_feedback_source_length_check
  check (char_length(source) <= 100);
