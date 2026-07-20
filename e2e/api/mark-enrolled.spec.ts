import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
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
  });
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

  await materializeApplicationStudent(admin, applicationId);

  const acceptResponse = await request.patch(
    `/api/admissions/applications/${applicationId}/status`,
    { data: { status: "accepted" } },
  );
  expect(acceptResponse.status()).toBe(200);

  const response = await request.post(
    `/api/admissions/applications/${applicationId}/mark-enrolled`,
    { data: { note: "E2E bypass" } },
  );

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.applicationId).toBe(applicationId);
  expect(body.enrollmentId).toBeTruthy();

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
    .eq("id", body.enrollmentId)
    .single();

  expect(enrollmentError).toBeNull();
  expect(enrollment?.status).toBe("enrolled");

  const { data: student, error: studentError } = await admin
    .from("students")
    .select("status")
    .eq("id", application?.student_id)
    .single();

  expect(studentError).toBeNull();
  expect(student?.status).toBe("active");
});
