import { test, expect } from "@playwright/test";
import { ensureNoFeeDraftFixture } from "../helpers/api-fixtures";
import { getSeedManifest } from "../helpers/seed-manifest";

test("checkout returns 400 for invalid payment method", async ({ request }) => {
  const manifest = getSeedManifest();
  const response = await request.post(
    `/api/admissions/applications/${manifest.applications.feePendingDraft}/checkout`,
    {
      data: { paymentMethod: "bitcoin" },
    },
  );

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe("invalid_payment_method");
});

test("checkout returns fee_not_pending when no fee is required", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  await ensureNoFeeDraftFixture(manifest);
  const response = await request.post(
    `/api/admissions/applications/${manifest.applications.noFeeDraft}/checkout`,
    {
      data: { paymentMethod: "card" },
    },
  );

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe("fee_not_pending");
});

test("checkout returns not_draft for submitted applications", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const response = await request.post(
    `/api/admissions/applications/${manifest.applications.alphaChild}/checkout`,
    {
      data: { paymentMethod: "card" },
    },
  );

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe("not_draft");
});
