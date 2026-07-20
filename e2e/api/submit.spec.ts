import { test, expect } from "@playwright/test";
import { getSeedManifest } from "../helpers/seed-manifest";

test("submit returns 401 when unauthenticated", async ({ playwright, baseURL }) => {
  const manifest = getSeedManifest();
  const context = await playwright.request.newContext({ baseURL });
  const response = await context.post(
    `/api/admissions/applications/${manifest.applications.noFeeDraft}/submit`,
  );

  expect(response.status()).toBe(401);
  await context.dispose();
});

test("submit returns 404 when parent does not own the application", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const response = await request.post(
    `/api/admissions/applications/${manifest.applications.betaChild}/submit`,
  );

  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body.code).toBe("not_found");
});

test("submit returns fee_required when application fee is pending", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const response = await request.post(
    `/api/admissions/applications/${manifest.applications.feePendingDraft}/submit`,
  );

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe("fee_required");
});

test("submit succeeds for a complete no-fee draft application", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const response = await request.post(
    `/api/admissions/applications/${manifest.applications.noFeeDraft}/submit`,
  );

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.success).toBe(true);
});
