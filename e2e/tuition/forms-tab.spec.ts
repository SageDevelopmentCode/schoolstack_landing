import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { createRatePlanFromWizard } from "../../src/lib/tuition/setup-wizard";
import { AUTH_STATE_PATHS } from "../fixtures/constants";
import { ADMIN_TUITION_PATH } from "../helpers/constants";
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

async function ensureSmokeRatePlan(
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
  programId: string,
) {
  const { data: existingPlan } = await admin
    .from("tuition_rate_plans")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existingPlan?.id) return;

  await createRatePlanFromWizard(admin, {
    organizationId,
    programId,
    name: `E2E Forms Tab ${Date.now()}`,
    billingBasis: "annual",
    tiers: [{ label: "Standard", amount: "7200", isDefault: true }],
    effectiveStart: "2026-08-01",
    effectiveEnd: "2027-06-01",
    paymentCounts: [10],
    defaultPaymentCount: 10,
    fees: [],
  });
}

test.describe("Tuition forms tab", () => {
  test.use({ storageState: AUTH_STATE_PATHS.schoolAdmin });

  test("shows the Forms sub-tab in tuition", async ({ page }) => {
    const admin = createAdminClient();
    const manifest = getSeedManifest();
    const organizationId = manifest.organizationId;

    const { data: program } = await admin
      .from("programs")
      .select("id")
      .eq("organization_id", organizationId)
      .limit(1)
      .maybeSingle();

    expect(program?.id).toBeTruthy();
    await ensureSmokeRatePlan(admin, organizationId, String(program!.id));

    await page.goto(ADMIN_TUITION_PATH);
    await expect(page.getByRole("heading", { name: "Tuition" })).toBeVisible();
    await expect(page.getByTestId("tuition-tab-forms")).toBeVisible();

    const formsResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/school-admin/forms-documents") &&
        response.url().includes("category=tuition") &&
        response.ok(),
    );
    await page.getByTestId("tuition-tab-forms").click();
    await formsResponse;

    await expect(page.getByTestId("tuition-forms-new-agreement")).toBeVisible();
    await expect(page.getByText("Tuition agreements", { exact: true })).toBeVisible();
  });
});
