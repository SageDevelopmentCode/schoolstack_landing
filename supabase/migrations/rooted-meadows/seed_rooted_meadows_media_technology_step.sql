-- Add Media & Technology policy step to Rooted Meadows enrollment checklist.
-- Safe to re-run: skips if item_key already exists on the published template.
-- Target org: rooted-meadows

do $$
declare
  v_org_id uuid;
  v_template_id uuid;
  v_doc_id uuid;
  v_item_id uuid := gen_random_uuid();
  v_sort_order integer;
  v_item_key text := 'media_technology_policy';
  v_sections jsonb := $sections$[
  {
    "id": "media-tech-1",
    "title": "Media & Technology Policy",
    "body": "## The Reason Why\n\nIn Waldorf education, based on the philosophy of Rudolf Steiner, the classroom is viewed as a \"sacred space\" for holistic development. The exclusion of screens isn't just about being \"old-fashioned\"; it's a deliberate pedagogical choice rooted in how children interact with the world.\n\nIt is a common misconception that Waldorf is \"anti-science.\" In later high school years, technology is often introduced—but as a tool to be mastered and understood (how it works) rather than just a medium to be consumed.\n\nAccording to Waldorf principles, child development happens in seven-year cycles. During the first two cycles (ages 0–14), the focus is on physical growth, imaginative play, and rhythmic learning. Technology is viewed as a barrier to these goals for several reasons, here are a few:\n\nSteiner emphasized \"learning through doing.\" Screens provide a secondary, two-dimensional representation of the world. A child learns more about gravity by dropping various objects than by watching a simulation of it. Second, early exposure to abstract, digital logic and simple unseen cause of effect activities tends to \"harden\" a child's blossoming imagination prematurely, pulling them out of their natural, wonder-filled state before they are developmentally ready. We also seek to nourish all the senses, whereas the flicker rate of screens and the compressed audio of digital devices are seen as overstimulating and taxing to a child's developing nervous system and reduces the development of many other senses.\n\n---\n\n## The Benefits\n\nWhen children and youth leave their smartphones, smartwatches, and tablets at the door, several developmental benefits emerge:\n\n- Deepened Social Intelligence\n- Sustained \"Deep Work\", Attention, and Memory\n- Preserves the \"Inner Picture\" the child imagined and then becomes an active creator rather than a passive consumer of pre-made activities and images.\n- Mental Health and Autonomy due to a reduction in Cyberbullying and Comparison and False Reality Traps\n\n---\n\n## Rooted Meadows Media & Technology Policy\n\n\n### Education Forum\n\nParents who enroll their children at the Rooted Meadows School are required to attend a Media Parent Education Forum and encouraged to give the gift of an intentional and low media filled childhood. As parents, we can be mindful and intentional about what, with whom, and how much screen time we allow our children. Teachers are available and willing to assist with transitions to reduce media use in your child's environment.\n\n\n### Media\n\nIt is a school policy that media such as music and movie stars, shows, social media profiles, etc., is not discussed in the classroom or on the playground, except if it is brought in as part of a lesson in the curriculum in the Middle School. That media characters are not worn on clothing, backpacks, lunch boxes, etc. on campus grounds.\n\n\n### Phones & Watches\n\nChildren of all grades are not allowed to have any smartphones on campus. The use of non-smart cell phones and smart-watches by children are not permitted during school hours 9:00 am-1:30 p.m. or during school events. If a child needs to have a cell phone or smart watch to communicate with parents after school, it must be kept in their backpack and turned off until school is dismissed. If parents need to communicate with their child for urgent matters during the school day, they should contact the teacher through the channel predesignated by the class teacher. If a child is found to be using their cellular device or smart-watch during school hours, the device will be confiscated and returned at the end of the day. A second violation will result in the loss of the privilege of bringing the device to school.\n\n\n### Schoolwide Recommendation for Play Dates, Hangouts, and Sleepovers\n\n- No media/electronics during play dates and/or sleepovers through fifth grade.\n- In middle school years, we recommend open communication and agreements about screen time and content among parents prior to play dates, such as cellphones are left on a counter or in a basket during the get together. We encourage openness on the part of all parents to honor no screen time if requested by another parent. Good communication around this issue is vital for the social health of the class.\n\n\n### Photography and Videography During School Events\n\nIn an effort to promote a screen-free environment for the children, we ask that adults be mindful of our cell-phone use on campus and at events.\n\nThe school requests that no videography or photography occurs during the following school events, festivals, celebrations, class plays, or ceremonies. The teacher may designate a parent or staff member to record or take pictures to share later on the class platform. This will ensure that parents have documentation and the focus of the audience is on the event. Everyone is welcome to take photos after the play, performance or event has concluded (i.e., while the children are still in costume).\n\nPhotography and videography will be allowed at events that are open to the public. The intention behind this policy is to support the pedagogical and educational purposes of plays, performances, festivals and school events in a Waldorf school. The primary purpose of these events is teaching, not performance. The goal of the event may be to learn to read and speak fluidly with good inflection or to expand on a topic of class study. To allow an opportunity to build confidence and role play through imagination. Too often children viewing themselves later in video will often become self-conscious, judging, and compare themselves to professionals or more experienced performers and lose the feelings of joy and confidence they had in the moment. The interaction between the children, and between the children and the audience, is a rich experience for the children. The audience's presence, unhindered by cameras and other recording devices, is incredibly valuable.\n\n---\n\nI certify that I am the parent or legal guardian and that I accept and agree to follow the Rooted Meadows Media & Technology Policy stated above."
  }
]$sections$::jsonb;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows not found.';
  end if;

  select t.id into v_template_id
  from public.enrollment_checklist_templates t
  where t.organization_id = v_org_id
    and t.enrollment_path = 'enrollment'
    and t.status = 'published'
  order by t.updated_at desc
  limit 1;

  if v_template_id is null then
    raise exception 'No published enrollment checklist found for rooted-meadows.';
  end if;

  if exists (
    select 1
    from public.enrollment_checklist_template_items i
    where i.template_id = v_template_id
      and i.item_key = v_item_key
  ) then
    raise notice 'Media & Technology step already exists — skipping.';
    return;
  end if;

  -- Place immediately after the enrollment agreement variant group.
  select coalesce(max(i.sort_order), -1) + 1
  into v_sort_order
  from public.enrollment_checklist_template_items i
  where i.template_id = v_template_id
    and i.metadata ? 'variant';

  update public.enrollment_checklist_template_items
  set sort_order = sort_order + 1,
      updated_at = now()
  where template_id = v_template_id
    and sort_order >= v_sort_order
    and not (metadata ? 'variant');

  insert into public.document_templates (
    organization_id,
    name,
    kind,
    content,
    status
  )
  values (
    v_org_id,
    'Media & Technology Policy',
    'inline_sections',
    jsonb_build_object('sections', v_sections),
    'published'
  )
  returning id into v_doc_id;

  insert into public.enrollment_checklist_template_items (
    id,
    template_id,
    organization_id,
    item_key,
    sort_order,
    label,
    type,
    required,
    document_template_id,
    metadata
  )
  values (
    v_item_id,
    v_template_id,
    v_org_id,
    v_item_key,
    v_sort_order,
    'Media & Technology',
    'document_sign',
    true,
    v_doc_id,
    '{}'::jsonb
  );

  -- Backfill families already in progress on this template.
  insert into public.enrollment_checklist_items (
    checklist_id,
    organization_id,
    template_item_id,
    item_key,
    status,
    payment_status
  )
  select
    ec.id,
    ec.organization_id,
    v_item_id,
    v_item_key,
    'not_started',
    'not_required'
  from public.enrollment_checklists ec
  where ec.template_id = v_template_id
    and ec.status in ('not_started', 'in_progress')
    and not exists (
      select 1
      from public.enrollment_checklist_items eci
      where eci.checklist_id = ec.id
        and eci.template_item_id = v_item_id
    );

  raise notice 'Added Media & Technology step at sort_order %.', v_sort_order;
end $$;

-- Verification
select
  i.sort_order,
  i.label,
  i.type,
  i.item_key,
  jsonb_array_length(dt.content->'sections') as section_count
from public.enrollment_checklist_template_items i
join public.enrollment_checklist_templates t on t.id = i.template_id
join public.organizations o on o.id = t.organization_id
left join public.document_templates dt on dt.id = i.document_template_id
where o.slug = 'rooted-meadows'
  and t.enrollment_path = 'enrollment'
  and t.status = 'published'
order by i.sort_order;
