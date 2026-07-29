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

const STUDENT_DATE_PLACEHOLDER = "Select date…";
const STEP_ADVANCE_TIMEOUT_MS = process.env.CI ? 15_000 : 10_000;

export async function fillStudentDateOfBirth(page: Page): Promise<void> {
  await page.locator("#student_date_of_birth").click();
  const dateDialog = page.getByRole("dialog", { name: "Choose a date" });
  await expect(dateDialog).toBeVisible({ timeout: 10_000 });
  await dateDialog.getByRole("button", { name: "Today" }).click();
  await expect(dateDialog).toBeHidden({ timeout: 5_000 });
  await expect(page.locator("#student_date_of_birth")).not.toHaveText(
    STUDENT_DATE_PLACEHOLDER,
  );
}

export async function selectGradeLevel(
  page: Page,
  optionLabel = "Kindergarten",
): Promise<void> {
  const gradeTrigger = page.locator("#student_grade");
  await expect(gradeTrigger).toBeVisible();
  await expect(gradeTrigger).toBeEnabled();
  await gradeTrigger.click();

  const isMobile = (page.viewportSize()?.width ?? 1280) < 640;

  if (isMobile) {
    const dialog = page.getByRole("dialog", { name: "Grade level" });
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    const option = dialog.getByRole("option", { name: optionLabel });
    await expect(option).toBeVisible();
    await option.scrollIntoViewIfNeeded();
    await option.click({ timeout: 10_000 });
    await expect(dialog).toBeHidden({ timeout: 5_000 });
    await expect(gradeTrigger).toHaveText(new RegExp(optionLabel, "i"));
    return;
  }

  const listbox = page.getByRole("listbox", { name: "Grade level" });
  await expect(listbox).toBeVisible({ timeout: 10_000 });
  const option = listbox.getByRole("option", { name: optionLabel });
  await expect(option).toBeVisible();
  await option.scrollIntoViewIfNeeded();
  await option.click({ timeout: 10_000 });
  await expect(listbox).toHaveCount(0, { timeout: 5_000 });
  await expect(gradeTrigger).toHaveText(new RegExp(optionLabel, "i"));
}

export async function assertStudentStepReady(
  page: Page,
  gradeLabel = "Kindergarten",
): Promise<void> {
  await expect(page.locator("#student_first_name")).not.toHaveValue("");
  await expect(page.locator("#student_last_name")).not.toHaveValue("");
  await expect(page.locator("#student_date_of_birth")).not.toHaveText(
    STUDENT_DATE_PLACEHOLDER,
  );
  await expect(page.locator("#student_grade")).toHaveText(
    new RegExp(gradeLabel, "i"),
  );
}

function isApplicationsDraftSave(response: {
  url: () => string;
  request: () => { method: () => string };
  status: () => number;
}): boolean {
  const method = response.request().method();
  const status = response.status();
  return (
    response.url().includes("/rest/v1/applications") &&
    method === "PATCH" &&
    (status === 200 || status === 204)
  );
}

export async function advanceFromStudentStep(page: Page): Promise<void> {
  const continueButton = page.getByRole("button", { name: /Save and continue/i });
  await expect(continueButton).toBeVisible();
  await expect(continueButton).toBeEnabled();

  const saveResponse = page.waitForResponse(isApplicationsDraftSave, {
    timeout: STEP_ADVANCE_TIMEOUT_MS,
  });
  await continueButton.click();
  await saveResponse;

  await expect(page.getByText(/Step 1 of/i)).toHaveCount(0, {
    timeout: STEP_ADVANCE_TIMEOUT_MS,
  });
}

export async function openNewApplicationForm(page: Page): Promise<void> {
  await cleanupParentDraftApplications();
  await page.goto(`/school/${TEST_ORG_SLUG}/forms/apply?new=1`, {
    waitUntil: process.env.CI ? "domcontentloaded" : "load",
    timeout: process.env.CI ? 60_000 : 30_000,
  });

  const firstName = page.locator("#student_first_name");
  await expect(firstName).toBeVisible({
    timeout: 15_000,
  });
  await expect(firstName).toHaveValue("");
  await expect(page.getByText(/Step 1 of/i).first()).toBeVisible({
    timeout: 15_000,
  });
}
