import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import type { E2eSeedManifest } from "../fixtures/seed";

export const NO_FEE_DRAFT_RESPONSES = {
  student_first_name: "NoFee",
  student_last_name: "Draft",
  student_date_of_birth: "2020-07-20",
  student_grade: "k",
} as const;

export const NO_FEE_SUBMIT_DRAFT_RESPONSES = {
  student_first_name: "Submit",
  student_last_name: "Target",
  student_date_of_birth: "2020-07-20",
  student_grade: "k",
} as const;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`E2E api fixture helper aborted: missing ${name}`);
  }
  return value;
}

function createAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      realtime: {
        transport: ws as never,
      },
    },
  );
}

async function ensureDraftFixture(
  applicationId: string,
  responses: Record<string, string>,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("applications")
    .update({
      status: "draft",
      fee_status: "not_required",
      responses,
      acknowledgments: {},
      submitted_at: null,
    })
    .eq("id", applicationId);

  if (error) throw error;
}

export async function ensureNoFeeDraftFixture(manifest: E2eSeedManifest): Promise<void> {
  await ensureDraftFixture(
    manifest.applications.noFeeDraft,
    NO_FEE_DRAFT_RESPONSES,
  );
}

export async function ensureNoFeeSubmitDraftFixture(
  manifest: E2eSeedManifest,
): Promise<void> {
  await ensureDraftFixture(
    manifest.applications.noFeeSubmitDraft,
    NO_FEE_SUBMIT_DRAFT_RESPONSES,
  );
}

export async function prepareBootstrapResumeFixture(
  manifest: E2eSeedManifest,
): Promise<void> {
  await ensureNoFeeSubmitDraftFixture(manifest);
  await ensureNoFeeDraftFixture(manifest);

  const admin = createAdminClient();
  const { error } = await admin
    .from("applications")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", manifest.applications.noFeeDraft);

  if (error) throw error;
}
