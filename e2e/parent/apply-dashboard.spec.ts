import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

test("logged-in parent sees only their own applications", async ({ page }) => {
  await page.goto(`/school/${TEST_ORG_SLUG}/apply`);

  await expect(
    page.getByRole("heading", { name: "Your applications" }),
  ).toBeVisible();
  await expect(page.getByText("Alpha Child")).toBeVisible();
  await expect(page.getByText("Beta Child")).toHaveCount(0);
});
