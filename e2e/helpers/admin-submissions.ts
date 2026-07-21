import { expect, type Page } from "@playwright/test";
import { TEST_ORG_SLUG } from "./constants";

export const SUBMISSIONS_PATH = `/school/${TEST_ORG_SLUG}/admin/admissions/submissions`;

export async function gotoSubmissions(page: Page): Promise<void> {
  await page.goto(SUBMISSIONS_PATH);
  await expect(page).toHaveURL(SUBMISSIONS_PATH);
  await expect(page.getByRole("cell", { name: "Alpha Child" })).toBeVisible({
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
  const tablist = page.getByRole("tablist", { name: "Application sections" });
  await tablist
    .locator(
      'xpath=ancestor::motion.div[contains(@class,"flex-col")][contains(@class,"overflow-hidden")] | ancestor::div[contains(@class,"flex-col")][contains(@class,"overflow-hidden")]',
    )
    .getByLabel("Close")
    .click();
  await expect(tablist).toBeHidden({ timeout: 10_000 });
}
