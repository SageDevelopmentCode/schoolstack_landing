import { expect, type Locator, type Page } from "@playwright/test";
import { TEST_ORG_SLUG } from "./constants";

export const SUBMISSIONS_PATH = `/school/${TEST_ORG_SLUG}/admin/admissions/submissions`;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function statusFilterButton(page: Page, label: string): Locator {
  return page.getByRole("button", {
    name: new RegExp(`^${escapeRegExp(label)} · \\d+`),
  });
}

async function statusColumnIndex(page: Page): Promise<number> {
  const index = await page
    .getByRole("columnheader", { name: "Status", exact: true })
    .evaluate((header) => {
      const row = header.closest("tr");
      if (!row) return -1;
      return Array.from(row.children).indexOf(header);
    });

  if (index < 0) {
    throw new Error("Could not locate Status column in submissions table.");
  }

  return index;
}

export async function expectSubmissionStatusInTable(
  page: Page,
  studentLabel: string,
  statusLabel: string,
): Promise<void> {
  const row = page.getByRole("row", { name: new RegExp(studentLabel) });
  const statusCell = row.locator("td").nth(await statusColumnIndex(page));
  await expect(statusCell).toContainText(statusLabel);
}

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
