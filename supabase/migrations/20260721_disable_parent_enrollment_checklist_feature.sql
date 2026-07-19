-- Disable parent portal enrollment_checklist feature for all orgs
update public.organization_settings
set features = jsonb_set(
  coalesce(features, '{}'::jsonb),
  '{parent,enrollment_checklist}',
  'false'::jsonb,
  true
);

-- Remove from feature_nav.parent.order if present
update public.organization_settings
set features = jsonb_set(
  features,
  '{feature_nav,parent,order}',
  (
    select coalesce(jsonb_agg(elem), '[]'::jsonb)
    from jsonb_array_elements_text(features->'feature_nav'->'parent'->'order') elem
    where elem <> 'enrollment_checklist'
  ),
  true
)
where features->'feature_nav'->'parent'->'order' ? 'enrollment_checklist';
