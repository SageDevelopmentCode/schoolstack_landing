-- Set default public slug for Rooted Meadows application form.
-- Run after: add_application_form_public_slug.sql

update public.application_form_versions
set public_slug = 'apply'
where id = 'a57d66cf-1c0b-4052-a1cd-3067c07361d3'
  and public_slug is null;
