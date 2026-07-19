import { test, expect } from "@playwright/test";
import {
  closeSubmissionDetail,
  gotoSubmissions,
  openSubmissionByStudent,
  SUBMISSIONS_PATH,
} from "../helpers/admin-submissions";
import { getSeedManifest } from "../helpers/seed-manifest";

test("submissions list shows seeded applications", async ({ page }) => {
  await gotoSubmissions(page);

  await expect(page.getByRole("cell", { name: "Alpha Child" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Beta Child" })).toBeVisible();
});

test("admin can open a submission detail panel", async ({ page }) => {
  await gotoSubmissions(page);
  await openSubmissionByStudent(page, "Alpha Child");

  await expect(page.getByRole("tab", { name: "Overview" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("Decision", { exact: true })).toBeVisible();
  await expect(page.getByText("Submitted", { exact: true }).first()).toBeVisible();
});

test("admin can view application answers", async ({ page }) => {
  await gotoSubmissions(page);
  await openSubmissionByStudent(page, "Alpha Child");

  await page.getByRole("button", { name: "View application answers" }).click();

  await expect(
    page.getByRole("heading", { name: "Application answers" }),
  ).toBeVisible();

  const answersModal = page.locator("#application-answers-print");
  await expect(answersModal.getByText("First Name", { exact: true })).toBeVisible();
  await expect(answersModal.getByText("Alpha", { exact: true }).first()).toBeVisible();
});

test("admin can close submission detail panel", async ({ page }) => {
  await gotoSubmissions(page);
  await openSubmissionByStudent(page, "Alpha Child");

  await closeSubmissionDetail(page);

  await expect(page.getByRole("cell", { name: "Alpha Child" })).toBeVisible();
});

test("deep link opens submission detail", async ({ page }) => {
  const manifest = getSeedManifest();

  await page.goto(
    `${SUBMISSIONS_PATH}?application=${manifest.applications.alphaChild}`,
  );

  await expect(
    page.getByRole("tablist", { name: "Application sections" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
});

test("status filter narrows the submissions table", async ({ page }) => {
  await gotoSubmissions(page);

  await page.getByRole("button", { name: /^All\b/ }).click();
  await expect(page.locator("table tbody tr")).toHaveCount(2);

  await page.getByRole("button", { name: /^Submitted/ }).click();

  await expect(page.getByRole("cell", { name: "Alpha Child" })).toBeVisible();
  expect(await page.locator("table tbody tr").count()).toBeGreaterThanOrEqual(1);
});

test("admin can change application status", async ({ page }) => {
  await gotoSubmissions(page);
  await openSubmissionByStudent(page, "Beta Child");

  await page.getByRole("button", { name: "Mark under review" }).click();

  await expect(
    page.getByText("Under review", { exact: true }).first(),
  ).toBeVisible({ timeout: 15_000 });

  await closeSubmissionDetail(page);

  const betaRow = page.getByRole("row", { name: /Beta Child/ });
  await expect(betaRow.getByText("Under review", { exact: true })).toBeVisible();
});

test("admin can download application PDF", async ({ page }) => {
  test.setTimeout(60_000);

  await gotoSubmissions(page);
  await openSubmissionByStudent(page, "Alpha Child");

  const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
  await page.getByRole("button", { name: "Download PDF" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  await expect(page.getByText("Failed to generate PDF")).toHaveCount(0);
});
