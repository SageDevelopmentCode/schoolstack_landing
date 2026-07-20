import { test, expect } from "@playwright/test";
import { getSeedManifest } from "../helpers/seed-manifest";

test("bootstrap returns 401 when unauthenticated", async ({ playwright, baseURL }) => {
  const manifest = getSeedManifest();
  const context = await playwright.request.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
  });
  const response = await context.post("/api/admissions/applicant-bootstrap", {
    data: {
      organizationId: manifest.organizationId,
      formVersionId: manifest.forms.default,
    },
  });

  expect(response.status()).toBe(401);
  await context.dispose();
});

test("bootstrap returns 400 when required fields are missing", async ({
  request,
}) => {
  const response = await request.post("/api/admissions/applicant-bootstrap", {
    data: {},
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe("missing_fields");
});

test("bootstrap resumes an existing application for authenticated parent", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const response = await request.post("/api/admissions/applicant-bootstrap", {
    data: {
      organizationId: manifest.organizationId,
      formVersionId: manifest.forms.default,
      firstName: "E2E",
      lastName: "Parent",
    },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.action).toBe("resume");
  expect(body.applicationId).toBeTruthy();
  expect(body.familyId).toBeTruthy();
});
