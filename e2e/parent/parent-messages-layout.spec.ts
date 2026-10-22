import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";

const ARTIFACT_DIR = path.join(process.cwd(), "e2e/.artifacts/responsive");

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812, minHeightRatio: 0.35, minPx: 200 },
  { name: "tablet", width: 768, height: 1024, minHeightRatio: 0.35, minPx: 280 },
  { name: "desktop", width: 1280, height: 800, minHeightRatio: 0.3, minPx: 280 },
] as const;

test.describe("parent messages inbox layout", () => {
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  for (const viewport of VIEWPORTS) {
    test(`inbox layout fills viewport at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await page.goto(`/school/${TEST_ORG_SLUG}/parent/messages`);

      await expect(page.getByTestId("parent-messages-inbox-header")).toBeVisible({
        timeout: 30_000,
      });

      const layout = page.getByTestId("parent-messages-inbox-layout");
      await expect(layout).toBeVisible({ timeout: 30_000 });

      const box = await layout.boundingBox();
      expect(box).not.toBeNull();
      const minHeight = Math.max(
        viewport.minPx,
        viewport.height * viewport.minHeightRatio,
      );
      expect(box!.height).toBeGreaterThanOrEqual(minHeight);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `parent-messages-${viewport.name}.png`),
        fullPage: true,
      });
    });
  }
});
