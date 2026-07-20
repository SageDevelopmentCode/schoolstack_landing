import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { E2E_PARENT_EMAIL } from "../fixtures/constants";
import { TEST_ORG_SLUG } from "./constants";
import { getSeedManifest } from "./seed-manifest";

const APPLY_FORM_LOCK_PATH = path.join(process.cwd(), "e2e/.apply-form.lock");
const APPLY_FORM_LOCK_STALE_MS = 120_000;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`E2E apply helper aborted: missing ${name}`);
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

async function findUserIdByEmail(email: string): Promise<string> {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.trim().toLowerCase() === normalized,
    );
    if (match) return match.id;

    if (data.users.length < 200) break;
    page += 1;
  }

  throw new Error(`E2E apply helper aborted: user not found for ${email}`);
}

async function acquireApplyFormLock(): Promise<() => void> {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    try {
      if (fs.existsSync(APPLY_FORM_LOCK_PATH)) {
        const stat = fs.statSync(APPLY_FORM_LOCK_PATH);
        if (Date.now() - stat.mtimeMs > APPLY_FORM_LOCK_STALE_MS) {
          fs.unlinkSync(APPLY_FORM_LOCK_PATH);
        }
      }

      fs.writeFileSync(APPLY_FORM_LOCK_PATH, `${process.pid}:${Date.now()}`, {
        flag: "wx",
      });

      return () => {
        try {
          fs.unlinkSync(APPLY_FORM_LOCK_PATH);
        } catch {
          // Another worker may have already released the lock.
        }
      };
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  throw new Error("Timed out waiting for apply form test lock.");
}

let releaseApplyFormLock: (() => void) | null = null;

export async function beginApplyFormTest(): Promise<void> {
  if (releaseApplyFormLock) return;
  releaseApplyFormLock = await acquireApplyFormLock();
}

export async function endApplyFormTest(): Promise<void> {
  releaseApplyFormLock?.();
  releaseApplyFormLock = null;
}

export async function cleanupParentDraftApplications(): Promise<void> {
  const admin = createAdminClient();
  const parentUserId = await findUserIdByEmail(E2E_PARENT_EMAIL);

  const { data: organization, error: orgError } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", TEST_ORG_SLUG)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!organization?.id) {
    throw new Error(`E2E apply helper aborted: organization "${TEST_ORG_SLUG}" not found.`);
  }

  const manifest = getSeedManifest();
  const preservedDraftIds = [
    manifest.applications.feePendingDraft,
    manifest.applications.noFeeDraft,
    manifest.applications.noFeeSubmitDraft,
  ];

  const { error: deleteError } = await admin
    .from("applications")
    .delete()
    .eq("organization_id", organization.id)
    .eq("created_by_user_id", parentUserId)
    .eq("status", "draft")
    .not("id", "in", `(${preservedDraftIds.join(",")})`);

  if (deleteError) throw deleteError;
}

export async function fillStudentDateOfBirth(page: Page): Promise<void> {
  await page.locator("#student_date_of_birth").click();
  const dateDialog = page.getByRole("dialog", { name: "Choose a date" });
  await expect(dateDialog).toBeVisible({ timeout: 10_000 });
  await dateDialog.getByRole("button", { name: "Today" }).click();
}

export async function openNewApplicationForm(page: Page): Promise<void> {
  await cleanupParentDraftApplications();
  await page.goto(`/school/${TEST_ORG_SLUG}/forms/apply?new=1`);

  await expect(page.locator("#student_first_name")).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/Step 1 of/i).first()).toBeVisible({
    timeout: 15_000,
  });
}
