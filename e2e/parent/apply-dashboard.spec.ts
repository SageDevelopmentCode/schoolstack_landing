import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

test("logged-in parent sees apply dashboard", async ({ page }) => {
  await page.goto(`/school/${TEST_ORG_SLUG}/apply`);

  await expect(
    page.getByRole("heading", { name: "Your applications" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "No applications yet" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start application" }),
  ).toBeVisible();
});
