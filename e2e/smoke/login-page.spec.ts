import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

test("login page loads with school selector", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Sign in to your school" }),
  ).toBeVisible();
  await expect(
    page.getByText("Choose your school to continue to your portal."),
  ).toBeVisible();
});

test("login deep link preselects school and shows sign-in form", async ({
  page,
}) => {
  await page.goto(`/login?school=${TEST_ORG_SLUG}`);

  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send verification code" }),
  ).toBeVisible();
});
