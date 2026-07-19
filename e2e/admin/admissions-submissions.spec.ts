import { test, expect } from "@playwright/test";
import { gotoSubmissions } from "../helpers/admin-submissions";

test("logged-in school admin can view admissions submissions", async ({
  page,
}) => {
  await gotoSubmissions(page);

  await expect(page.getByText("Status", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("cell", { name: "Alpha Child" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Beta Child" })).toBeVisible();
});
