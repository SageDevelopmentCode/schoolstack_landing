import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";
import {
  assertMinViewportHeight,
  assertNoHorizontalOverflow,
} from "../qa/helpers/layout-assertions";
import { PORTAL_QA_VIEWPORTS } from "../qa/viewports";

const ARTIFACT_DIR = path.join(process.cwd(), "e2e/.artifacts/responsive");

test.describe("parent messages inbox layout", () => {
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  for (const viewport of PORTAL_QA_VIEWPORTS) {
    test(`inbox layout fills viewport at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await page.goto(`/school/${TEST_ORG_SLUG}/parent/messages`);

      await expect(page.getByTestId("parent-messages-inbox-header")).toBeVisible({
        timeout: 30_000,
      });

      const layout = page.getByTestId("parent-messages-inbox-layout");
      await expect(layout).toBeVisible({ timeout: 30_000 });

      await assertMinViewportHeight(layout, viewport);
      await assertNoHorizontalOverflow(page);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `parent-messages-${viewport.name}.png`),
        fullPage: true,
      });
    });
  }
});
