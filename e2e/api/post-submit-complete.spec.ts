import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { AUTH_STATE_PATHS } from "../fixtures/constants";
import { getSeedManifest } from "../helpers/seed-manifest";

const TEST_ACTION_ID = "e2e-post-submit-shadow";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("E2E post-submit complete spec aborted: missing Supabase env");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws as never },
  });
}

async function ensurePostSubmitAction(applicationId: string, formVersionId: string) {
  const admin = createAdminClient();

  const { error: formError } = await admin
    .from("application_form_versions")
    .update({
      post_submit_config: {
        actions: [
          {
            id: TEST_ACTION_ID,
            type: "schedule_observation_day",
            enabled: true,
            required: true,
          },
        ],
      },
    })
    .eq("id", formVersionId);

  if (formError) throw formError;

  await admin
    .from("admissions_scheduled_visits")
    .delete()
    .eq("application_id", applicationId)
    .eq("post_submit_action_id", TEST_ACTION_ID);
}

test("post-submit complete returns 403 for non-admin user", async ({
  playwright,
  baseURL,
}) => {
  const manifest = getSeedManifest();
  await ensurePostSubmitAction(
    manifest.applications.alphaChild,
    manifest.forms.default,
  );

  const context = await playwright.request.newContext({
    baseURL,
    storageState: AUTH_STATE_PATHS.nonAdmin,
  });

  const response = await context.post(
    `/api/admissions/applications/${manifest.applications.alphaChild}/post-submit/complete`,
    {
      data: { actionId: TEST_ACTION_ID },
    },
  );

  expect(response.status()).toBe(403);
  await context.dispose();
});

test("post-submit complete marks step done and undo reverts it", async ({
  request,
}) => {
  const manifest = getSeedManifest();
  const applicationId = manifest.applications.alphaChild;
  const admin = createAdminClient();

  await ensurePostSubmitAction(applicationId, manifest.forms.default);

  const completeResponse = await request.post(
    `/api/admissions/applications/${applicationId}/post-submit/complete`,
    {
      data: { actionId: TEST_ACTION_ID },
    },
  );

  expect(completeResponse.status()).toBe(200);
  const completeBody = await completeResponse.json();
  expect(completeBody.booking.completedManuallyAt).toBeTruthy();

  const { data: visitRow, error: visitError } = await admin
    .from("admissions_scheduled_visits")
    .select("id, completed_manually_at")
    .eq("application_id", applicationId)
    .eq("post_submit_action_id", TEST_ACTION_ID)
    .maybeSingle();

  expect(visitError).toBeNull();
  expect(visitRow?.completed_manually_at).toBeTruthy();

  const duplicateResponse = await request.post(
    `/api/admissions/applications/${applicationId}/post-submit/complete`,
    {
      data: { actionId: TEST_ACTION_ID },
    },
  );
  expect(duplicateResponse.status()).toBe(409);

  const undoResponse = await request.delete(
    `/api/admissions/applications/${applicationId}/post-submit/complete`,
    {
      data: { actionId: TEST_ACTION_ID },
    },
  );
  expect(undoResponse.status()).toBe(200);

  const { data: afterUndo, error: afterUndoError } = await admin
    .from("admissions_scheduled_visits")
    .select("id")
    .eq("application_id", applicationId)
    .eq("post_submit_action_id", TEST_ACTION_ID)
    .maybeSingle();

  expect(afterUndoError).toBeNull();
  expect(afterUndo).toBeNull();
});
