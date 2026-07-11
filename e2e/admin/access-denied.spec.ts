import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

test("user without school admin membership sees access denied", async ({
  page,
}) => {
  await page.goto(`/school/${TEST_ORG_SLUG}/admin/admissions/submissions`);

  await expect(
    page.getByRole("heading", { name: "Access denied" }),
  ).toBeVisible();
  await expect(page.getByText(/don't have admin access/i)).toBeVisible();
});
