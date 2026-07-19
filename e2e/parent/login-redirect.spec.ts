import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

test("authenticated parent with one school redirects from /login", async ({
  page,
}) => {
  await page.goto("/login");

  await expect(page).toHaveURL(new RegExp(`/school/${TEST_ORG_SLUG}/apply`));
  await expect(
    page.getByRole("heading", { name: "Your applications" }),
  ).toBeVisible();
});

test("authenticated parent deep link still redirects from /login", async ({
  page,
}) => {
  await page.goto(`/login?school=${TEST_ORG_SLUG}`);

  await expect(page).toHaveURL(new RegExp(`/school/${TEST_ORG_SLUG}/apply`));
});
