import { test, expect } from "@playwright/test";
import { AUTH_STATE_PATHS } from "../fixtures/constants";
import { getSeedManifest } from "../helpers/seed-manifest";

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

  const getResponse = await request.get(
    `/api/admissions/applications/${manifest.applications.alphaChild}/status`,
  );
  const current = await getResponse.json();

  const nextStatus =
    current.status === "submitted" ? "under_review" : "submitted";

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
