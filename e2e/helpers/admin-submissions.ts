import { expect, type Page } from "@playwright/test";
import { TEST_ORG_SLUG } from "./constants";

export const SUBMISSIONS_PATH = `/school/${TEST_ORG_SLUG}/admin/admissions/submissions`;

export async function gotoSubmissions(page: Page): Promise<void> {
  await page.goto(SUBMISSIONS_PATH);
  await expect(page).toHaveURL(SUBMISSIONS_PATH);
  await expect(page.locator("table tbody tr").first()).toBeVisible({
    timeout: 15_000,
  });
}

export async function openSubmissionByStudent(
  page: Page,
  studentLabel: string,
): Promise<void> {
  await page.getByRole("row", { name: new RegExp(studentLabel) }).click();
  await expect(
    page.getByRole("tablist", { name: "Application sections" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
}

export async function closeSubmissionDetail(page: Page): Promise<void> {
  await page.getByLabel("Close").first().click();
  await expect(
    page.getByRole("tablist", { name: "Application sections" }),
  ).toHaveCount(0);
}
