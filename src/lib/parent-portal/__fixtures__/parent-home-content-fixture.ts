import type { OrganizationFeatures } from "@/lib/organization-settings/types";

/**
 * A family with two submitted applications (one enrolled), a draft, and
 * enrollment checklists that produce one incomplete-agreement banner, one
 * amendment banner and checklist progress for both children. Rows from
 * another organisation are mixed in to prove the org filters still apply.
 */

export const HOME_FIXTURE_ORG_ID = "org-1";
export const HOME_FIXTURE_USER_ID = "user-1";
export const HOME_FIXTURE_FAMILY_ID = "fam-1";

const formVersion = { title: "Enrollment application", public_slug: "apply", post_submit_config: {} };

function templateItem(input: {
  id: string;
  templateId: string;
  itemKey: string;
  label: string;
  type: string;
  required: boolean;
  sortOrder: number;
  sections?: Array<{ id: string; title: string; body: string }>;
}) {
  return {
    id: input.id,
    template_id: input.templateId,
    item_key: input.itemKey,
    label: input.label,
    type: input.type,
    required: input.required,
    sort_order: input.sortOrder,
    metadata: {},
    document_template_id: input.sections ? `doc-${input.id}` : null,
    fee_definition_id: null,
    document_templates: input.sections
      ? { id: `doc-${input.id}`, kind: "inline_sections", content: { sections: input.sections } }
      : null,
    fee_definitions: null,
  };
}

function instance(input: {
  id: string;
  checklistId: string;
  templateItemId: string;
  itemKey: string;
  status: string;
  responses?: Record<string, unknown>;
  organizationId?: string;
  paymentStatus?: string | null;
  createdAt: string;
}) {
  return {
    id: input.id,
    organization_id: input.organizationId ?? HOME_FIXTURE_ORG_ID,
    checklist_id: input.checklistId,
    template_item_id: input.templateItemId,
    item_key: input.itemKey,
    status: input.status,
    payment_status: input.paymentStatus ?? null,
    responses: input.responses ?? {},
    created_at: input.createdAt,
  };
}

export function buildParentHomeFixtureTables(): Record<string, Record<string, unknown>[]> {
  return {
    applications: [
      {
        id: "app-1",
        organization_id: HOME_FIXTURE_ORG_ID,
        status: "accepted",
        submitted_at: "2026-03-01T00:00:00Z",
        created_at: "2026-02-01T00:00:00Z",
        updated_at: "2026-03-05T00:00:00Z",
        student_id: "stu-1",
        responses: { student_first_name: "Ada", student_last_name: "Lovelace", student_grade: "3" },
        application_form_versions: formVersion,
      },
      {
        id: "app-2",
        organization_id: HOME_FIXTURE_ORG_ID,
        status: "submitted",
        submitted_at: "2026-03-02T00:00:00Z",
        created_at: "2026-02-02T00:00:00Z",
        updated_at: "2026-03-04T00:00:00Z",
        student_id: "stu-2",
        responses: { student_first_name: "Ben", student_last_name: "Lovelace" },
        application_form_versions: formVersion,
      },
      {
        id: "app-3",
        organization_id: HOME_FIXTURE_ORG_ID,
        status: "draft",
        submitted_at: null,
        created_at: "2026-02-03T00:00:00Z",
        updated_at: "2026-03-03T00:00:00Z",
        student_id: null,
        responses: { student_first_name: "Cy" },
        application_form_versions: formVersion,
      },
    ],
    students: [
      { id: "stu-1", organization_id: HOME_FIXTURE_ORG_ID, family_id: HOME_FIXTURE_FAMILY_ID, profile_photo_url: "https://example.test/ada.jpg" },
      { id: "stu-2", organization_id: HOME_FIXTURE_ORG_ID, family_id: HOME_FIXTURE_FAMILY_ID, profile_photo_url: null },
    ],
    enrollments: [
      {
        id: "enr-1",
        organization_id: HOME_FIXTURE_ORG_ID,
        student_id: "stu-1",
        status: "enrolled",
        programs: { id: "prog-1", name: "Main", portal_slug: null, parent_portal_settings: {} },
      },
    ],
    enrollment_checklists: [
      { id: "chk-1", organization_id: HOME_FIXTURE_ORG_ID, enrollment_id: "enr-1", application_id: "app-1", template_id: "tpl-1", status: "in_progress", metadata: {} },
      { id: "chk-2", organization_id: HOME_FIXTURE_ORG_ID, enrollment_id: "enr-2", application_id: "app-2", template_id: "tpl-2", status: "in_progress", metadata: {} },
      { id: "chk-x", organization_id: "org-2", enrollment_id: "enr-x", application_id: "app-1", template_id: "tpl-1", status: "completed", metadata: {} },
    ],
    enrollment_checklist_templates: [
      { id: "tpl-1", organization_id: HOME_FIXTURE_ORG_ID, program_id: null, name: "Fall enrollment", enrollment_path: "default", status: "published", created_at: "2026-01-01", updated_at: "2026-01-01" },
      { id: "tpl-2", organization_id: HOME_FIXTURE_ORG_ID, program_id: null, name: "Spring enrollment", enrollment_path: "default", status: "published", created_at: "2026-01-01", updated_at: "2026-01-01" },
    ],
    enrollment_checklist_template_items: [
      templateItem({
        id: "ti-1",
        templateId: "tpl-1",
        itemKey: "agreement",
        label: "Enrollment agreement",
        type: "document_sign",
        required: true,
        sortOrder: 1,
        sections: [
          { id: "sec-a", title: "Tuition", body: "..." },
          { id: "sec-b", title: "Conduct", body: "..." },
        ],
      }),
      templateItem({ id: "ti-2", templateId: "tpl-1", itemKey: "fee", label: "Enrollment fee", type: "payment", required: true, sortOrder: 2 }),
      templateItem({ id: "ti-3", templateId: "tpl-1", itemKey: "medical", label: "Medical form", type: "form", required: true, sortOrder: 3 }),
      templateItem({
        id: "ti-4",
        templateId: "tpl-2",
        itemKey: "agreement",
        label: "Spring agreement",
        type: "document_sign",
        required: true,
        sortOrder: 1,
        sections: [{ id: "sec-c", title: "Photo consent", body: "..." }],
      }),
      templateItem({ id: "ti-5", templateId: "tpl-2", itemKey: "medical", label: "Medical form", type: "form", required: false, sortOrder: 2 }),
    ],
    enrollment_checklist_items: [
      instance({
        id: "ii-1",
        checklistId: "chk-1",
        templateItemId: "ti-1",
        itemKey: "agreement",
        status: "in_progress",
        responses: {
          sectionSignatures: [{ sectionId: "sec-a", signerName: "Pat", signedAt: "2026-03-02T00:00:00Z" }],
        },
        createdAt: "2026-03-01T00:00:01Z",
      }),
      instance({ id: "ii-2", checklistId: "chk-1", templateItemId: "ti-2", itemKey: "fee", status: "completed", paymentStatus: "paid", createdAt: "2026-03-01T00:00:02Z" }),
      instance({ id: "ii-3", checklistId: "chk-1", templateItemId: "ti-3", itemKey: "medical", status: "completed", createdAt: "2026-03-01T00:00:03Z" }),
      instance({
        id: "ii-4",
        checklistId: "chk-2",
        templateItemId: "ti-4",
        itemKey: "agreement",
        status: "completed",
        responses: { pendingResignSectionIds: ["sec-c"], amendmentNotice: "We updated photo consent." },
        createdAt: "2026-03-02T00:00:01Z",
      }),
      instance({ id: "ii-5", checklistId: "chk-2", templateItemId: "ti-5", itemKey: "medical", status: "not_started", createdAt: "2026-03-02T00:00:02Z" }),
      instance({
        id: "ii-6",
        checklistId: "chk-2",
        templateItemId: "ti-4",
        itemKey: "agreement",
        status: "in_progress",
        organizationId: "org-2",
        responses: { pendingResignSectionIds: ["sec-c"], amendmentNotice: "Other org notice." },
        createdAt: "2026-03-02T00:00:03Z",
      }),
    ],
  };
}

export const HOME_FIXTURE_FEATURES = {
  parent: { forms_documents: false },
  parent_home: {},
} as unknown as OrganizationFeatures;
