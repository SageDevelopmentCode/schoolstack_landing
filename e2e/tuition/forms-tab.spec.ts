import { test, expect } from "@playwright/test";
import { AUTH_STATE_PATHS } from "../fixtures/constants";
import { ADMIN_TUITION_PATH } from "../helpers/constants";

test.describe("Tuition forms tab", () => {
  test.use({ storageState: AUTH_STATE_PATHS.schoolAdmin });

  test("shows the Forms sub-tab in tuition", async ({ page }) => {
    await page.goto(ADMIN_TUITION_PATH);
    await expect(page.getByTestId("tuition-tab-forms")).toBeVisible();
    await page.getByTestId("tuition-tab-forms").click();
    await expect(page.getByRole("button", { name: "New agreement" })).toBeVisible();
    await expect(page.getByText("Tuition agreements")).toBeVisible();
  });
});
