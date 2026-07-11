import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

test("logged-in school admin can view admissions submissions", async ({
  page,
}) => {
  await page.goto(`/school/${TEST_ORG_SLUG}/admin/admissions/submissions`);

  await expect(page).toHaveURL(
    `/school/${TEST_ORG_SLUG}/admin/admissions/submissions`,
  );
  await expect(page.getByText("Status", { exact: true }).first()).toBeVisible();
});
