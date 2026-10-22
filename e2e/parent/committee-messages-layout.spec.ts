import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";
import { getSeedManifest } from "../helpers/seed-manifest";

const ARTIFACT_DIR = path.join(process.cwd(), "e2e/.artifacts/responsive");

const SEEDED_COMMITTEE_MESSAGE = "Welcome to the E2E committee channel.";
const PARENT_SECTION_NAV_TEST_ID = "parent-committee-section-nav";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812, minHeightRatio: 0.35, minPx: 200 },
  { name: "tablet", width: 768, height: 1024, minHeightRatio: 0.35, minPx: 280 },
  { name: "desktop", width: 1280, height: 800, minHeightRatio: 0.3, minPx: 280 },
] as const;

test.describe("committee messages layout", () => {
  test.setTimeout(process.env.CI ? 60_000 : 45_000);
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  for (const viewport of VIEWPORTS) {
    test(`messages panel fills viewport at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const { committees } = getSeedManifest();
      const committeeUrl = `/school/${TEST_ORG_SLUG}/parent/committees?tab=mine&committee=${committees.parentWorkspace}&section=messages`;
      const loadStartedAt = Date.now();
      await page.goto(committeeUrl);

      const panel = page.getByTestId("committee-messages-panel");
      await expect(panel).toBeVisible({ timeout: 30_000 });
      await expect(panel.getByText(SEEDED_COMMITTEE_MESSAGE)).toBeVisible({
        timeout: 30_000,
      });

      const loadElapsedMs = Date.now() - loadStartedAt;
      expect(loadElapsedMs).toBeLessThan(15_000);

      const isMobileNav = viewport.width < 1024;
      if (isMobileNav) {
        await expect(page.getByTestId("committee-mobile-menu-button")).toBeVisible();
        await expect(page.getByTestId(PARENT_SECTION_NAV_TEST_ID)).toBeHidden();
        await page.getByTestId("committee-mobile-menu-button").click();
        const sheet = page.getByTestId("committee-mobile-menu-sheet");
        await expect(sheet).toBeVisible();
        await expect(sheet.getByRole("tab", { name: "Members" })).toBeVisible();
        await expect(sheet.getByRole("tab", { name: "Tasks" })).toBeVisible();
        await sheet.getByRole("button", { name: "Close committee menu" }).click();
        await expect(sheet).toBeHidden();
      } else {
        await expect(page.getByTestId(PARENT_SECTION_NAV_TEST_ID)).toBeVisible();
      }

      const box = await panel.boundingBox();
      expect(box).not.toBeNull();
      const minHeight = Math.max(
        viewport.minPx,
        viewport.height * viewport.minHeightRatio,
      );
      expect(box!.height).toBeGreaterThanOrEqual(minHeight);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `committee-messages-${viewport.name}.png`),
        fullPage: true,
      });
    });
  }
});
