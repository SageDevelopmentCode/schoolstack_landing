import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

test("unauthenticated school admin route redirects to login", async ({
  page,
}) => {
  await page.goto(`/school/${TEST_ORG_SLUG}/admin/admissions/submissions`);

  await expect(page).toHaveURL(
    new RegExp(`/school/${TEST_ORG_SLUG}/admin/login`),
  );
  await expect(
    page.getByRole("heading", { name: "School admin sign in" }),
  ).toBeVisible();
});
