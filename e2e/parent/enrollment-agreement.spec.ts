import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";
import {
  cleanupIncompleteAgreementState,
  seedIncompleteAgreementState,
} from "../helpers/enrollment-agreement-fixtures";

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await cleanupIncompleteAgreementState();
});

test.afterAll(async () => {
  await cleanupIncompleteAgreementState();
});

test("incomplete agreement banner shows on parent portal", async ({ page }) => {
  await seedIncompleteAgreementState(TEST_ORG_SLUG);

  await page.goto(`/school/${TEST_ORG_SLUG}/parent/portal`);

  await expect(
    page.getByRole("heading", { name: /need your attention/ }),
  ).toBeVisible();

  await expect(
    page.getByText("Sign Alpha's enrollment agreement"),
  ).toBeVisible();

  await expect(
    page.getByText(
      "Your enrollment agreement still needs your signature. Please finish signing to complete enrollment.",
    ),
  ).toBeVisible();

  const agreementLink = page.getByRole("link", {
    name: /Sign Alpha's enrollment agreement/,
  });
  await expect(agreementLink).toBeVisible();
  await expect(agreementLink).toHaveAttribute(
    "href",
    /\/enrollment\?item=.*&section=std-1/,
  );
});

test("complete agreement routes to first unsigned section", async ({ page }) => {
  const state = await seedIncompleteAgreementState(TEST_ORG_SLUG);

  await page.goto(state.enrollmentHref);

  await expect(page.getByText("Section 3 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Complete agreement" }).click();
  await expect(page.getByText("Section 1 of 3")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tuition Summary" })).toBeVisible();
});
