import { test, expect } from "@playwright/test";
import { E2E_ADMIN_EMAIL, E2E_TEST_PASSWORD } from "../fixtures/constants";
import { TEST_ORG_SLUG } from "../helpers/constants";

test.use({ storageState: { cookies: [], origins: [] } });

test("school admin sign-in returns to the ?next= deep link", async ({
  page,
}) => {
  const nextPath = `/school/${TEST_ORG_SLUG}/admin/admissions/submissions`;

  await page.goto(
    `/school/${TEST_ORG_SLUG}/admin/login?next=${encodeURIComponent(nextPath)}`,
  );
  await page.getByRole("button", { name: "Sign in with password" }).click();
  await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(E2E_TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL((url) => url.pathname === nextPath, {
    timeout: 15_000,
  });
  await expect(page).toHaveURL(new RegExp(`${nextPath}$`));
});
