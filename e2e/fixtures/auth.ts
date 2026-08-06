import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import {
  AUTH_STATE_PATHS,
  E2E_BASE_URL,
  E2E_ADMIN_EMAIL,
  E2E_NONADMIN_EMAIL,
  E2E_PARENT_EMAIL,
  E2E_STAFF_EMAIL,
  E2E_TEST_PASSWORD,
  TEST_ORG_SLUG,
} from "./constants";

async function createStorageState(
  email: string,
  password: string,
  outputPath: string,
): Promise<void> {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? E2E_BASE_URL;
  const loginPath = `/school/${TEST_ORG_SLUG}/admin/login`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseURL}${loginPath}`);
  await page.getByRole("button", { name: "Sign in with password" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(
    (url) =>
      url.pathname.includes(`/school/${TEST_ORG_SLUG}/admin`) &&
      !url.pathname.includes("/login"),
    { timeout: 15_000 },
  );

  await page.waitForLoadState("networkidle");

  await context.storageState({ path: outputPath });
  await browser.close();
}

export async function createAuthStorageStates(): Promise<void> {
  await createStorageState(
    E2E_ADMIN_EMAIL,
    E2E_TEST_PASSWORD,
    AUTH_STATE_PATHS.schoolAdmin,
  );
  await createStorageState(
    E2E_PARENT_EMAIL,
    E2E_TEST_PASSWORD,
    AUTH_STATE_PATHS.parent,
  );
  await createStorageState(
    E2E_NONADMIN_EMAIL,
    E2E_TEST_PASSWORD,
    AUTH_STATE_PATHS.nonAdmin,
  );
  await createStaffStorageState();
}

async function createStaffStorageState(): Promise<void> {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? E2E_BASE_URL;
  const loginPath = `/login?school=${TEST_ORG_SLUG}&auth=password`;

  fs.mkdirSync(path.dirname(AUTH_STATE_PATHS.staff), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseURL}${loginPath}`);
  await page.getByLabel("Email").fill(E2E_STAFF_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(E2E_TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(
    (url) =>
      url.pathname.includes(`/school/${TEST_ORG_SLUG}/teacher`) &&
      !url.pathname.includes("/login"),
    { timeout: 15_000 },
  );

  await page.waitForLoadState("networkidle");

  await context.storageState({ path: AUTH_STATE_PATHS.staff });
  await browser.close();
}
