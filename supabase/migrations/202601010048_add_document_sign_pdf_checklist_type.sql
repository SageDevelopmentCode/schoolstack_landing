-- Allow document_sign_pdf as a checklist template item type (Agreement PDF blank item).

alter table public.enrollment_checklist_template_items
  drop constraint if exists enrollment_checklist_template_items_type_check;

alter table public.enrollment_checklist_template_items
  add constraint enrollment_checklist_template_items_type_check
  check (type in (
    'document_sign',
    'document_sign_pdf',
    'form',
    'file_upload',
    'payment',
    'acknowledgment'
  ));
