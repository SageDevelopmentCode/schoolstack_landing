import { test, expect } from "@playwright/test";
import { E2E_PARENT_EMAIL, E2E_TEST_PASSWORD } from "../fixtures/constants";
import { TEST_ORG_SLUG } from "../helpers/constants";

test("login page starts with email, not a school selector", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Sign in to continue" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send verification code" }),
  ).toBeVisible();
  await expect(page.getByText("Choose your school")).toHaveCount(0);
});

test("login deep link preselects school and shows sign-in form", async ({
  page,
}) => {
  await page.goto(`/login?school=${TEST_ORG_SLUG}`);

  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send verification code" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start your application" }),
  ).toBeVisible();
});

test("plain login hides the application link until a school is known", async ({
  page,
}) => {
  await page.goto("/login");

  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start your application" }),
  ).toHaveCount(0);
});

test("email step can switch to password and back", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Use password instead" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Use email code instead" }).click();
  await expect(
    page.getByRole("button", { name: "Send verification code" }),
  ).toBeVisible();
});

test("password sign-in without picking a school detects the school", async ({
  page,
}) => {
  await page.goto("/login?auth=password");

  await page.getByLabel("Email").fill(E2E_PARENT_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(E2E_TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(
    new RegExp(`/school/${TEST_ORG_SLUG}/(apply|parent)`),
    { timeout: 15_000 },
  );
});
