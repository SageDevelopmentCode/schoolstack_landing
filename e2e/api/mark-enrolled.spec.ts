import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { materializeApplicationStudent } from "../../src/lib/admissions/application-entity-materialization";
import { AUTH_STATE_PATHS } from "../fixtures/constants";
import { getSeedManifest } from "../helpers/seed-manifest";

function createAdminClient() {
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

const E2E_MARK_ENROLLED_TEMPLATE_ITEMS = [
  {
    item_key: "e2e_acknowledgment",
    sort_order: 0,
    label: "E2E acknowledgment",
    type: "acknowledgment",
    required: true,
    metadata: {},
  },
  {
    item_key: "e2e_supply_fee",
    sort_order: 1,
    label: "Supply Fee",
    type: "payment",
    required: true,
    metadata: {
      payment: {
        label: "Supply Fee",
        amountCents: 50000,
      },
    },
  },
] as const;

async function ensurePublishedEnrollmentChecklistWithPayment(
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
  programId: string,
) {
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
        name: "E2E Mark Enrolled Checklist",
        enrollment_path: "enrollment",
        status: "published",
      })
      .select("id")
      .single();

    if (templateError) throw templateError;
    templateId = String(template.id);
  }

  for (const item of E2E_MARK_ENROLLED_TEMPLATE_ITEMS) {
    const { data: existingItem } = await admin
      .from("enrollment_checklist_template_items")
      .select("id")
      .eq("template_id", templateId)
      .eq("item_key", item.item_key)
      .maybeSingle();

    if (existingItem?.id) continue;

    const { error: itemError } = await admin
      .from("enrollment_checklist_template_items")
      .insert({
        template_id: templateId,
        organization_id: organizationId,
        ...item,
      });

    if (itemError) throw itemError;
  }

  return templateId;
}

async function resetApplicationEnrollmentState(
  admin: ReturnType<typeof createAdminClient>,
  applicationId: string,
  baselineStatus: string,
) {
  const { data: application, error: applicationError } = await admin
    .from("applications")
    .select("student_id")
    .eq("id", applicationId)
    .single();

  if (applicationError) throw applicationError;

  await admin
    .from("application_payments")
    .delete()
    .eq("application_id", applicationId)
    .eq("payment_type", "enrollment_checklist");

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

  if (application?.student_id) {
    await admin
      .from("enrollments")
      .delete()
      .eq("student_id", application.student_id);

    await admin
      .from("students")
      .update({ status: "prospect" })
      .eq("id", application.student_id);
  }

  const { error: statusError } = await admin
    .from("applications")
    .update({ status: baselineStatus })
    .eq("id", applicationId);

  if (statusError) throw statusError;
}

test("mark-enrolled POST returns 403 for non-admin user", async ({
  playwright,
  baseURL,
}) => {
  const manifest = getSeedManifest();
  const context = await playwright.request.newContext({
    baseURL,
    storageState: AUTH_STATE_PATHS.nonAdmin,
  });

  const response = await context.post(
    `/api/admissions/applications/${manifest.applications.alphaChild}/mark-enrolled`,
    { data: {} },
  );

  expect(response.status()).toBe(403);
  await context.dispose();
});

test("mark-enrolled POST returns 400 for non-accepted application", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const response = await request.post(
    `/api/admissions/applications/${manifest.applications.alphaChild}/mark-enrolled`,
    { data: {} },
  );

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe("invalid_status");
});

test("mark-enrolled POST marks an accepted application as enrolled", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const admin = createAdminClient();
  const applicationId = manifest.applications.enrollTarget;

  await resetApplicationEnrollmentState(admin, applicationId, "submitted");

  const { data: application, error: applicationLookupError } = await admin
    .from("applications")
    .select("program_id")
    .eq("id", applicationId)
    .single();

  expect(applicationLookupError).toBeNull();
  expect(application?.program_id).toBeTruthy();

  await ensurePublishedEnrollmentChecklistWithPayment(
    admin,
    manifest.organizationId,
    String(application?.program_id),
  );

  await materializeApplicationStudent(admin, applicationId);

  const acceptResponse = await request.patch(
    `/api/admissions/applications/${applicationId}/status`,
    { data: { status: "accepted" } },
  );
  expect(acceptResponse.status()).toBe(200);

  const response = await request.post(
    `/api/admissions/applications/${applicationId}/mark-enrolled`,
    { data: { note: "E2E bypass", completeChecklist: true } },
  );

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.applicationId).toBe(applicationId);
  expect(body.enrollmentId).toBeTruthy();

  const { data: updatedApplication, error: applicationError } = await admin
    .from("applications")
    .select("status, student_id, program_id")
    .eq("id", applicationId)
    .single();

  expect(applicationError).toBeNull();
  expect(updatedApplication?.status).toBe("enrolled");

  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .select("status")
    .eq("id", body.enrollmentId)
    .single();

  expect(enrollmentError).toBeNull();
  expect(enrollment?.status).toBe("enrolled");

  const { data: student, error: studentError } = await admin
    .from("students")
    .select("status")
    .eq("id", updatedApplication?.student_id)
    .single();

  expect(studentError).toBeNull();
  expect(student?.status).toBe("active");

  const { data: checklist, error: checklistError } = await admin
    .from("enrollment_checklists")
    .select("id, status")
    .eq("application_id", applicationId)
    .maybeSingle();

  expect(checklistError).toBeNull();
  expect(checklist?.status).toBe("completed");

  const { data: checklistItems, error: checklistItemsError } = await admin
    .from("enrollment_checklist_items")
    .select("status, payment_status, item_key")
    .eq("checklist_id", checklist?.id);

  expect(checklistItemsError).toBeNull();
  expect(checklistItems?.length).toBeGreaterThan(0);
  expect(
    checklistItems?.every((item) => item.status === "completed" || item.status === "waived"),
  ).toBe(true);

  const paymentItem = checklistItems?.find((item) => item.item_key === "e2e_supply_fee");
  expect(paymentItem?.payment_status).toBe("paid");

  const { data: ledgerPayments, error: ledgerError } = await admin
    .from("application_payments")
    .select("payment_type, status, amount_cents, label")
    .eq("application_id", applicationId)
    .eq("payment_type", "enrollment_checklist");

  expect(ledgerError).toBeNull();
  expect(ledgerPayments?.some((row) => row.status === "succeeded")).toBe(true);
  expect(
    ledgerPayments?.some(
      (row) => row.label === "Supply Fee" && row.amount_cents === 50000,
    ),
  ).toBe(true);
});

test("mark-enrolled POST enroll-only leaves checklist in progress", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const admin = createAdminClient();
  const applicationId = manifest.applications.noFeeDraft;

  await resetApplicationEnrollmentState(admin, applicationId, "draft");

  const { data: application, error: applicationLookupError } = await admin
    .from("applications")
    .select("program_id")
    .eq("id", applicationId)
    .single();

  expect(applicationLookupError).toBeNull();

  await ensurePublishedEnrollmentChecklistWithPayment(
    admin,
    manifest.organizationId,
    String(application?.program_id),
  );

  await materializeApplicationStudent(admin, applicationId);

  await admin
    .from("applications")
    .update({ status: "accepted" })
    .eq("id", applicationId);

  const startResponse = await request.post(
    `/api/admissions/applications/${applicationId}/start-enrollment`,
    { data: { variantResolutions: {} } },
  );
  expect(startResponse.status()).toBe(200);

  const response = await request.post(
    `/api/admissions/applications/${applicationId}/mark-enrolled`,
    { data: { completeChecklist: false } },
  );

  expect(response.status()).toBe(200);

  const { data: updatedApplication } = await admin
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .single();

  expect(updatedApplication?.status).toBe("enrolled");

  const { data: checklist } = await admin
    .from("enrollment_checklists")
    .select("status")
    .eq("application_id", applicationId)
    .maybeSingle();

  expect(checklist?.status).toBe("in_progress");

  const { data: ledgerPayments } = await admin
    .from("application_payments")
    .select("id")
    .eq("application_id", applicationId)
    .eq("payment_type", "enrollment_checklist");

  expect(ledgerPayments ?? []).toHaveLength(0);
});

test("mark-enrolled POST completes an in-progress enrollment checklist", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const admin = createAdminClient();
  const applicationId = manifest.applications.betaChild;

  await resetApplicationEnrollmentState(admin, applicationId, "under_review");

  const { data: application, error: applicationLookupError } = await admin
    .from("applications")
    .select("program_id")
    .eq("id", applicationId)
    .single();

  expect(applicationLookupError).toBeNull();

  await ensurePublishedEnrollmentChecklistWithPayment(
    admin,
    manifest.organizationId,
    String(application?.program_id),
  );

  await materializeApplicationStudent(admin, applicationId);

  await admin
    .from("applications")
    .update({ status: "accepted" })
    .eq("id", applicationId);

  const startResponse = await request.post(
    `/api/admissions/applications/${applicationId}/start-enrollment`,
    { data: { variantResolutions: {} } },
  );
  expect(startResponse.status()).toBe(200);

  const response = await request.post(
    `/api/admissions/applications/${applicationId}/mark-enrolled`,
    { data: { note: "E2E in-progress completion", completeChecklist: true } },
  );

  expect(response.status()).toBe(200);

  const { data: updatedApplication } = await admin
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .single();

  expect(updatedApplication?.status).toBe("enrolled");

  const { data: checklist } = await admin
    .from("enrollment_checklists")
    .select("status")
    .eq("application_id", applicationId)
    .maybeSingle();

  expect(checklist?.status).toBe("completed");
});

test("start-enrollment POST moves submitted application directly to enrolling", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const admin = createAdminClient();
  const applicationId = manifest.applications.enrollTarget;

  await resetApplicationEnrollmentState(admin, applicationId, "submitted");

  const { data: application, error: applicationLookupError } = await admin
    .from("applications")
    .select("program_id, organization_id")
    .eq("id", applicationId)
    .single();

  expect(applicationLookupError).toBeNull();
  expect(application?.program_id).toBeTruthy();

  await ensurePublishedEnrollmentChecklistWithPayment(
    admin,
    manifest.organizationId,
    String(application?.program_id),
  );

  await materializeApplicationStudent(admin, applicationId);

  const startResponse = await request.post(
    `/api/admissions/applications/${applicationId}/start-enrollment`,
    { data: { variantResolutions: {} } },
  );

  expect(startResponse.status()).toBe(200);
  const body = await startResponse.json();
  expect(body.applicationId).toBe(applicationId);
  expect(body.enrollmentId).toBeTruthy();
  expect(body.checklistId).toBeTruthy();

  const { data: updatedApplication } = await admin
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .single();

  expect(updatedApplication?.status).toBe("enrolling");

  const { data: acceptedEvent } = await admin
    .from("activity_events")
    .select("action")
    .eq("entity_type", "application")
    .eq("entity_id", applicationId)
    .eq("action", "application.accepted")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  expect(acceptedEvent?.action).toBe("application.accepted");
});
