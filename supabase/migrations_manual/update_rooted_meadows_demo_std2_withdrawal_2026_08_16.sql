-- Update Rooted Meadows DEMO std-2 Withdrawal and Termination text.
-- Date: 2026-08-16
-- Purpose: Mirror production std-2 withdrawal update for rooted-meadows-demo testing.
-- Safe to re-run: updates std-2 body in place; Step B only affects completed standard agreements.
-- Target org: rooted-meadows-demo
--
-- Run after add_document_template_content_revision_2026_08_16.sql (if content_revision column missing).
-- Run Step B after deploying app re-sign support.
-- Review verification SELECTs at the bottom before closing.

do $$
declare
  v_org_id uuid;
  v_std2_body text := $std2$
## Tuition Summary

Full Names will show once contract selections are made.

### Tuition

Grade 5 — $7,200.00

### Additional Fees

**Supply Fee**

- Supply fee: $500.00
- Selection TBD

**Activity Fee**

- Activity fee: $150.00
- Selection TBD

### Total Cost

(includes $0.00 initial payment due at signing)

## Additional Fees

**Supply Fee**

Supply fee is due upon signing of the contract to reserve your child's spot.

**Activity Fee**

Activity fee is due no later than July 1, 2026 to maintain your reservation.

## Withdrawal and Termination

1. The cost of providing education and operating a school is not lessened by the failure of a student to attend classes whether for withdrawal or personal reasons. By signing this Agreement, You agree unconditionally, unless due to reasons stated in section 2, to pay tuition, fees, and other charges for the two following bill cycles (months) following the date of withdrawal (the child's last day of attendance) unless RMS receives in writing a notification of withdrawal of the student from the school for the upcoming school year, on or before June 30th for the upcoming contracted school year of 2026-2027.
2. To withdraw Child(ren) during the Contracted School Year, a 30-day written notice is required. Tuition, at the same regular tuition level, will continue to be owed every month of the Contracted School Year for the last month of attendance and the two full months from the date of withdrawal (the child's last day of attendance), unless withdrawal is due to the tuition payee(s) loss of work or death, or a work-required relocation out of a reasonable commuting distance of 40 minutes from RMS (measured by standard driving time from RMS's address), or due to a Personal Education Plan. I.e. Parents submit a withdrawal notice on October 23 which they already have paid for. The child attends school until November 23 and had previously been billed for November. Then tuition will still be billed for December and January. This tuition agreement covers the entire academic school year. Previously paid fees and deposits are non refundable.
3. RMS may exclude any Child from attendance, temporarily or permanently, under any circumstances deemed at the sole and exclusive discretion of RMS, if said attendance is to be interfering with the health, safety or educational development of the Child or any other student(s), or whose progress or conduct is unsatisfactory to School policy, or are more than 30 days past due on payment of tuition or other fees owed to the school. RMS further reserves the right to deny continued enrollment, or re-enrollment, to any Child if RMS reasonably concludes that Your actions (including inappropriate verbal, written or email communications) are inconsistent or are nonsupportive of the educational environment or counterproductive to a positive working relationship between RMS and that student's parents or guardians.

Such exclusion is the last resort option and appropriate efforts for resolution will be made to help rectify the situation and continue the student's enrollment in RMS according to the Parent and Student Handbook. Decisions under this clause will be made after consulting with the parent or guardian and with the guidance of the Pedagogical Council and the School Policy Handbook, determining if the continued enrollment of one or more Child(ren) is not in the best interest of the other children in class or RMS, or Your involvement or in some cases lack of involvement is not supportive to the school community's mission and vision. Such decisions will include written notice and an opportunity for a meeting with RMS and such as outlined in the School Policy Handbook.

Due to the financial obligations RMS maintains each year and the cash flow that is based on the number of students enrolled at the beginning of the school year, the remaining tuition obligation will be 50% of the previously determined tuition for each relevant Child each month, until the Child's vacant spot is filled or the Contracted School Year ends. Fees and tuition deposits are nonrefundable.

By signing below, I/we acknowledge that I/we have read and understood the tuition summary, additional fees, and withdrawal and termination terms described herein.
$std2$;
  v_amendment_notice text := 'The Withdrawal and Termination section of your enrollment agreement was updated. Please review and re-sign.';
  v_standard_template_item_id uuid := '86b6945d-7581-451d-a8e8-16766aacb74b';
  v_resign_section_id text := 'std-2';
  v_updated_templates int;
  v_reset_instances int;
  v_reset_checklists int;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows-demo';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows-demo not found.';
  end if;

  -- Step A: patch std-2 body in standard enrollment agreement document template
  update public.document_templates dt
  set
    content = jsonb_set(
      dt.content,
      '{sections}',
      (
        select jsonb_agg(
          case
            when section->>'id' = 'std-2'
              then jsonb_set(section, '{body}', to_jsonb(v_std2_body))
            else section
          end
          order by ordinality
        )
        from jsonb_array_elements(dt.content->'sections') with ordinality as t(section, ordinality)
      ),
      false
    ),
    content_revision = coalesce(dt.content_revision, 1) + 1,
    updated_at = now()
  from public.enrollment_checklist_template_items i
  where i.document_template_id = dt.id
    and i.organization_id = v_org_id
    and i.metadata->'variant'->>'variantKey' = 'standard'
    and dt.organization_id = v_org_id;

  get diagnostics v_updated_templates = row_count;

  raise notice 'Step A: updated % standard agreement document template(s).', v_updated_templates;

  -- Step B: require re-sign for families who completed the standard enrollment agreement
  with affected_instances as (
    select
      eci.id,
      eci.checklist_id,
      eci.responses,
      coalesce(
        (
          select jsonb_agg(sig order by ordinality)
          from jsonb_array_elements(eci.responses->'sectionSignatures') with ordinality as t(sig, ordinality)
          where sig->>'sectionId' <> v_resign_section_id
        ),
        '[]'::jsonb
      ) as filtered_signatures
    from public.enrollment_checklist_items eci
    where eci.organization_id = v_org_id
      and eci.template_item_id = v_standard_template_item_id
      and eci.status = 'completed'
  ),
  updated_instances as (
    update public.enrollment_checklist_items eci
    set
      status = 'in_progress',
      completed_at = null,
      completed_by_user_id = null,
      responses = (
        coalesce(eci.responses, '{}'::jsonb)
        - 'sectionSignatures'
        - 'amendmentNotice'
        - 'pendingResignSectionIds'
      )
      || jsonb_build_object(
        'sectionSignatures', ai.filtered_signatures,
        'amendmentNotice', v_amendment_notice,
        'pendingResignSectionIds', jsonb_build_array(v_resign_section_id)
      ),
      updated_at = now()
    from affected_instances ai
    where eci.id = ai.id
    returning eci.checklist_id
  )
  select count(*) into v_reset_instances from updated_instances;

  raise notice 'Step B: reset % completed agreement instance(s) for re-sign.', v_reset_instances;

  with affected_checklists as (
    select distinct checklist_id from (
      select eci.checklist_id
      from public.enrollment_checklist_items eci
      where eci.organization_id = v_org_id
        and eci.template_item_id = v_standard_template_item_id
        and eci.status = 'in_progress'
        and eci.responses ? 'pendingResignSectionIds'
    ) s
  ),
  updated_checklists as (
    update public.enrollment_checklists ec
    set status = 'in_progress', updated_at = now()
    from affected_checklists ac
    where ec.id = ac.checklist_id
      and ec.status = 'completed'
    returning ec.id
  )
  select count(*) into v_reset_checklists from updated_checklists;

  raise notice 'Step B: set % enrollment checklist(s) back to in_progress.', v_reset_checklists;
end $$;

-- Verification
select
  dt.id,
  dt.content_revision,
  left(
    (
      select s->>'body'
      from jsonb_array_elements(dt.content->'sections') s
      where s->>'id' = 'std-2'
    ),
    200
  ) as std2_body_preview
from public.document_templates dt
join public.organizations o on o.id = dt.organization_id
join public.enrollment_checklist_template_items i on i.document_template_id = dt.id
where o.slug = 'rooted-meadows-demo'
  and i.metadata->'variant'->>'variantKey' = 'standard';

select
  eci.id as instance_id,
  eci.status,
  eci.responses->'pendingResignSectionIds' as pending_resign,
  eci.responses->>'amendmentNotice' as amendment_notice,
  jsonb_array_length(eci.responses->'sectionSignatures') as signature_count,
  a.family_id,
  f.name as family_name,
  e.status as enrollment_status
from public.enrollment_checklist_items eci
join public.enrollment_checklists ec on ec.id = eci.checklist_id
join public.enrollments e on e.id = ec.enrollment_id
join public.applications a on a.id = ec.application_id
join public.families f on f.id = a.family_id
join public.organizations o on o.id = a.organization_id
where o.slug = 'rooted-meadows-demo'
  and eci.template_item_id = '86b6945d-7581-451d-a8e8-16766aacb74b'
  and eci.responses ? 'pendingResignSectionIds'
order by eci.updated_at desc;
