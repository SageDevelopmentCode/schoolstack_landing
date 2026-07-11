import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

test("unauthenticated apply dashboard shows sign-in", async ({ page }) => {
  await page.goto(`/school/${TEST_ORG_SLUG}/apply`);

  await expect(
    page.getByRole("heading", { name: "Sign in to your applications" }),
  ).toBeVisible();
  await expect(page.getByText(/one-time code/i)).toBeVisible();
});
