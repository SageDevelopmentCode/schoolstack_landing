import { test, expect, type Page } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

async function expectParentLoginRedirect(page: Page) {
  await expect(page).not.toHaveURL(/\/login$/);
  await expect(page).toHaveURL(new RegExp(`/school/${TEST_ORG_SLUG}/`));
  await expect(
    page
      .getByRole("heading", { name: "Your applications" })
      .or(page.getByRole("heading", { name: "Billing" })),
  ).toBeVisible();
}

test("authenticated parent with one school redirects from /login", async ({
  page,
}) => {
  await page.goto("/login");
  await expectParentLoginRedirect(page);
});

test("authenticated parent deep link still redirects from /login", async ({
  page,
}) => {
  await page.goto(`/login?school=${TEST_ORG_SLUG}`);
  await expectParentLoginRedirect(page);
});
