import { test, expect, type Page } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

async function expectParentLoginRedirect(page: Page) {
  await expect(page).not.toHaveURL(/\/login$/);
  await expect(page).toHaveURL(
    new RegExp(`/school/${TEST_ORG_SLUG}/(apply|parent)`),
  );
  await expect(
    page
      .getByRole("heading", { name: "Your applications" })
      .or(page.getByRole("heading", { name: "Family tuition" }))
      .or(page.getByRole("heading", { name: "Follow their day." }))
      .or(
        page.getByRole("heading", {
          name: /^Good (morning|afternoon|evening)/,
        }),
      )
      .or(page.getByTestId("parent-billing-story-header"))
      .or(page.getByTestId("parent-children-story-header")),
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
