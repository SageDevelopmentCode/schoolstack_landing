import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { materializeApplicationStudent } from "../../src/lib/admissions/application-entity-materialization";
import { getSeedManifest } from "./seed-manifest";

const E2E_INLINE_AGREEMENT_ITEM_KEY = "e2e_inline_agreement";
const E2E_INLINE_AGREEMENT_TEMPLATE_NAME = "E2E Inline Agreement Template";

const inlineAgreementSections = [
  { id: "std-1", title: "Tuition Summary", body: "Section 1 body" },
  { id: "std-2", title: "Withdrawal", body: "Section 2 body" },
  { id: "std-3", title: "Sign and Complete Your Contract", body: "Section 3 body" },
];

export type SeededIncompleteAgreementState = {
  applicationId: string;
  templateItemId: string;
  instanceId: string;
  enrollmentHref: string;
};

function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin credentials for e2e tests.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws as never },
  });
}

async function ensureInlineAgreementTemplate(
  admin: SupabaseClient,
  organizationId: string,
  programId: string,
): Promise<{ templateId: string; templateItemId: string }> {
  const { data: existingTemplate } = await admin
    .from("enrollment_checklist_templates")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .eq("status", "published")
    .maybeSingle();

  let templateId = existingTemplate?.id ? String(existingTemplate.id) : null;

  if (!templateId) {
    const { data: template, error: templateError } = await admin
      .from("enrollment_checklist_templates")
      .insert({
        organization_id: organizationId,
        program_id: programId,
        name: "E2E Enrollment Agreement Checklist",
        enrollment_path: "enrollment",
        status: "published",
      })
      .select("id")
      .single();

    if (templateError) throw templateError;
    templateId = String(template.id);
  }

  const { data: existingItem } = await admin
    .from("enrollment_checklist_template_items")
    .select("id, document_template_id")
    .eq("template_id", templateId)
    .eq("item_key", E2E_INLINE_AGREEMENT_ITEM_KEY)
    .maybeSingle();

  if (existingItem?.id) {
    return {
      templateId,
      templateItemId: String(existingItem.id),
    };
  }

  const { data: documentTemplate, error: documentTemplateError } = await admin
    .from("document_templates")
    .insert({
      organization_id: organizationId,
      name: E2E_INLINE_AGREEMENT_TEMPLATE_NAME,
      kind: "inline_sections",
      content: { sections: inlineAgreementSections },
      status: "published",
    })
    .select("id")
    .single();

  if (documentTemplateError) throw documentTemplateError;

  const { data: templateItem, error: templateItemError } = await admin
    .from("enrollment_checklist_template_items")
    .insert({
      template_id: templateId,
      organization_id: organizationId,
      item_key: E2E_INLINE_AGREEMENT_ITEM_KEY,
      sort_order: 0,
      label: "E2E Standard Enrollment Agreement",
      type: "document_sign",
      required: true,
      document_template_id: documentTemplate.id,
      metadata: {},
    })
    .select("id")
    .single();

  if (templateItemError) throw templateItemError;

  return {
    templateId,
    templateItemId: String(templateItem.id),
  };
}

export async function seedIncompleteAgreementState(
  schoolSlug: string,
): Promise<SeededIncompleteAgreementState> {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const applicationId = manifest.applications.alphaChild;

  const { data: application, error: applicationError } = await admin
    .from("applications")
    .select("id, organization_id, program_id, student_id, family_id")
    .eq("id", applicationId)
    .single();

  if (applicationError) throw applicationError;
  if (!application?.program_id) {
    throw new Error("E2E alphaChild application is missing program_id.");
  }

  await materializeApplicationStudent(admin, applicationId);

  const { data: refreshedApplication, error: refreshedApplicationError } = await admin
    .from("applications")
    .select("student_id")
    .eq("id", applicationId)
    .single();

  if (refreshedApplicationError) throw refreshedApplicationError;
  if (!refreshedApplication?.student_id) {
    throw new Error("E2E alphaChild application is missing student_id.");
  }

  const studentId = String(refreshedApplication.student_id);
  const organizationId = String(application.organization_id);
  const programId = String(application.program_id);

  const { templateId, templateItemId } = await ensureInlineAgreementTemplate(
    admin,
    organizationId,
    programId,
  );

  const { data: existingEnrollment } = await admin
    .from("enrollments")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .maybeSingle();

  let enrollmentId = existingEnrollment?.id ? String(existingEnrollment.id) : null;

  if (!enrollmentId) {
    const { data: enrollment, error: enrollmentError } = await admin
      .from("enrollments")
      .insert({
        organization_id: organizationId,
        student_id: studentId,
        program_id: programId,
        status: "enrolled",
      })
      .select("id")
      .single();

    if (enrollmentError) throw enrollmentError;
    enrollmentId = String(enrollment.id);
  } else {
    await admin
      .from("enrollments")
      .update({ status: "enrolled" })
      .eq("id", enrollmentId);
  }

  await admin
    .from("applications")
    .update({ status: "enrolled", student_id: studentId })
    .eq("id", applicationId);

  await admin
    .from("students")
    .update({ status: "active" })
    .eq("id", studentId);

  const { data: existingChecklist } = await admin
    .from("enrollment_checklists")
    .select("id")
    .eq("application_id", applicationId)
    .maybeSingle();

  let checklistId = existingChecklist?.id ? String(existingChecklist.id) : null;

  if (!checklistId) {
    const { data: checklist, error: checklistError } = await admin
      .from("enrollment_checklists")
      .insert({
        organization_id: organizationId,
        enrollment_id: enrollmentId,
        application_id: applicationId,
        template_id: templateId,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (checklistError) throw checklistError;
    checklistId = String(checklist.id);
  } else {
    await admin
      .from("enrollment_checklists")
      .update({ status: "in_progress", template_id: templateId })
      .eq("id", checklistId);
  }

  const partialSignatures = {
    sectionSignatures: [
      {
        sectionId: "std-2",
        signerName: "E2E Parent",
        signedAt: "2026-08-30T00:00:00.000Z",
      },
      {
        sectionId: "std-3",
        signerName: "E2E Parent",
        signedAt: "2026-08-30T00:00:01.000Z",
      },
    ],
  };

  const { data: existingInstance } = await admin
    .from("enrollment_checklist_items")
    .select("id")
    .eq("checklist_id", checklistId)
    .eq("template_item_id", templateItemId)
    .maybeSingle();

  let instanceId = existingInstance?.id ? String(existingInstance.id) : null;

  if (!instanceId) {
    const { data: instance, error: instanceError } = await admin
      .from("enrollment_checklist_items")
      .insert({
        checklist_id: checklistId,
        organization_id: organizationId,
        template_item_id: templateItemId,
        item_key: E2E_INLINE_AGREEMENT_ITEM_KEY,
        status: "in_progress",
        responses: partialSignatures,
      })
      .select("id")
      .single();

    if (instanceError) throw instanceError;
    instanceId = String(instance.id);
  } else {
    const { error: instanceUpdateError } = await admin
      .from("enrollment_checklist_items")
      .update({
        status: "in_progress",
        completed_at: null,
        completed_by_user_id: null,
        responses: partialSignatures,
      })
      .eq("id", instanceId);

    if (instanceUpdateError) throw instanceUpdateError;
  }

  return {
    applicationId,
    templateItemId,
    instanceId,
    enrollmentHref: `/school/${schoolSlug}/apply/${applicationId}/enrollment?item=${templateItemId}&section=std-3`,
  };
}

export async function cleanupIncompleteAgreementState(): Promise<void> {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const applicationId = manifest.applications.alphaChild;

  const { data: checklist } = await admin
    .from("enrollment_checklists")
    .select("id")
    .eq("application_id", applicationId)
    .maybeSingle();

  if (checklist?.id) {
    await admin
      .from("enrollment_checklist_items")
      .delete()
      .eq("checklist_id", checklist.id);
    await admin.from("enrollment_checklists").delete().eq("id", checklist.id);
  }

  const { data: application } = await admin
    .from("applications")
    .select("student_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (application?.student_id) {
    await admin
      .from("enrollments")
      .delete()
      .eq("student_id", application.student_id);
  }

  await admin
    .from("applications")
    .update({ status: "submitted" })
    .eq("id", applicationId);
}
