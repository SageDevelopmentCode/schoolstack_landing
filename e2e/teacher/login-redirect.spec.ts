import { test, expect } from "@playwright/test";
import { AUTH_STATE_PATHS } from "../fixtures/constants";
import { TEST_ORG_SLUG } from "../helpers/constants";

test.describe("staff login routing", () => {
  test.use({ storageState: AUTH_STATE_PATHS.staff });

  test("authenticated staff visiting /apply redirects to teacher dashboard", async ({
    page,
  }) => {
    await page.goto(`/school/${TEST_ORG_SLUG}/apply`);

    await expect(page).toHaveURL(
      new RegExp(`/school/${TEST_ORG_SLUG}/teacher/dashboard`),
    );
    await expect(
      page.getByRole("heading", { name: /Welcome back/i }),
    ).toBeVisible();
  });

  test("authenticated staff visiting /login redirects to teacher dashboard", async ({
    page,
  }) => {
    await page.goto(`/login?school=${TEST_ORG_SLUG}`);

    await expect(page).toHaveURL(
      new RegExp(`/school/${TEST_ORG_SLUG}/teacher/dashboard`),
    );
    await expect(
      page.getByRole("heading", { name: /Welcome back/i }),
    ).toBeVisible();
  });
});
