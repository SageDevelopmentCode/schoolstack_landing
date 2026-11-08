import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { materializeApplicationStudent } from "../../src/lib/admissions/application-entity-materialization";
import { AUTH_STATE_PATHS } from "../fixtures/constants";
import { ensureAlphaChildSubmittedFixture } from "../helpers/api-fixtures";
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

async function seedCoopSubmittedApplication(
  admin: ReturnType<typeof createAdminClient>,
  manifest: ReturnType<typeof getSeedManifest>,
) {
  const { data: family, error: familyError } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", manifest.organizationId)
    .limit(1)
    .maybeSingle();
  if (familyError) throw familyError;
  if (!family?.id) throw new Error("E2E family missing for coop accept test.");

  const { data: guardian, error: guardianError } = await admin
    .from("guardians")
    .select("id, user_id")
    .eq("organization_id", manifest.organizationId)
    .eq("family_id", family.id)
    .limit(1)
    .maybeSingle();
  if (guardianError) throw guardianError;
  if (!guardian?.id) throw new Error("E2E guardian missing for coop accept test.");

  const { data: application, error: applicationError } = await admin
    .from("applications")
    .insert({
      organization_id: manifest.organizationId,
      program_id: manifest.programs.coop.id,
      form_version_id: manifest.forms.default,
      family_id: family.id,
      primary_guardian_id: guardian.id,
      created_by_user_id: guardian.user_id,
      status: "submitted",
      submitted_at: new Date().toISOString(),
      responses: {
        student_first_name: "Coop",
        student_last_name: "AutoEnroll",
        student_date_of_birth: "2020-01-01",
        student_grade: "k",
      },
    })
    .select("id")
    .single();
  if (applicationError) throw applicationError;

  const applicationId = String(application.id);
  await materializeApplicationStudent(admin, applicationId);
  return applicationId;
}

test.beforeEach(async () => {
  await ensureAlphaChildSubmittedFixture(getSeedManifest());
});

test("status GET returns 403 for non-admin user", async ({ playwright, baseURL }) => {
  const manifest = getSeedManifest();
  const context = await playwright.request.newContext({
    baseURL,
    storageState: AUTH_STATE_PATHS.nonAdmin,
  });

  const response = await context.get(
    `/api/admissions/applications/${manifest.applications.alphaChild}/status`,
  );

  expect(response.status()).toBe(403);
  await context.dispose();
});

test("status GET returns allowed transitions for school admin", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const response = await request.get(
    `/api/admissions/applications/${manifest.applications.alphaChild}/status`,
  );

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.status).toBe("submitted");
  expect(body.allowedTransitions).toContain("under_review");
});

test("status PATCH returns 400 for invalid transition", async ({ request }) => {
  const manifest = getSeedManifest();
  const response = await request.patch(
    `/api/admissions/applications/${manifest.applications.alphaChild}/status`,
    {
      data: { status: "enrolled" },
    },
  );

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe("invalid_transition");
});

test("status PATCH updates application status for school admin", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const nextStatus = "under_review";

  const response = await request.patch(
    `/api/admissions/applications/${manifest.applications.alphaChild}/status`,
    {
      data: { status: nextStatus },
    },
  );

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.status).toBe(nextStatus);
});

test("status PATCH accept auto-enrolls when program has no published checklist", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const admin = createAdminClient();
  const applicationId = await seedCoopSubmittedApplication(admin, manifest);

  const response = await request.patch(
    `/api/admissions/applications/${applicationId}/status`,
    { data: { status: "accepted" } },
  );

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.status).toBe("enrolled");

  const { data: application, error: applicationError } = await admin
    .from("applications")
    .select("status, student_id, program_id")
    .eq("id", applicationId)
    .single();
  expect(applicationError).toBeNull();
  expect(application?.status).toBe("enrolled");

  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .select("status")
    .eq("student_id", application!.student_id)
    .eq("program_id", application!.program_id)
    .maybeSingle();
  expect(enrollmentError).toBeNull();
  expect(enrollment?.status).toBe("enrolled");
});

test("status PATCH accept stays accepted when program has a published checklist", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const admin = createAdminClient();
  const applicationId = manifest.applications.enrollTarget;

  const { data: application, error: applicationLookupError } = await admin
    .from("applications")
    .select("program_id")
    .eq("id", applicationId)
    .single();
  expect(applicationLookupError).toBeNull();

  const { data: existingTemplate } = await admin
    .from("enrollment_checklist_templates")
    .select("id")
    .eq("organization_id", manifest.organizationId)
    .eq("program_id", application!.program_id)
    .eq("status", "published")
    .maybeSingle();

  if (!existingTemplate?.id) {
    const { error: templateError } = await admin
      .from("enrollment_checklist_templates")
      .insert({
        organization_id: manifest.organizationId,
        program_id: application!.program_id,
        name: "E2E Accept Stays Accepted Checklist",
        enrollment_path: "enrollment",
        status: "published",
      });
    expect(templateError).toBeNull();
  }

  await admin
    .from("applications")
    .update({ status: "submitted" })
    .eq("id", applicationId);
  await materializeApplicationStudent(admin, applicationId);

  const response = await request.patch(
    `/api/admissions/applications/${applicationId}/status`,
    { data: { status: "accepted" } },
  );

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.status).toBe("accepted");

  const { data: updatedApplication, error: updatedApplicationError } = await admin
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .single();
  expect(updatedApplicationError).toBeNull();
  expect(updatedApplication?.status).toBe("accepted");
});
