import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";
import { getSeedManifest } from "../helpers/seed-manifest";
import { assertCommitteeMobileMenu } from "../qa/helpers/committee-qa";
import {
  assertLoadUnderMs,
  assertMinViewportHeight,
  assertNoHorizontalOverflow,
} from "../qa/helpers/layout-assertions";
import { PORTAL_QA_VIEWPORTS } from "../qa/viewports";

const ARTIFACT_DIR = path.join(process.cwd(), "e2e/.artifacts/responsive");

const SEEDED_COMMITTEE_MESSAGE = "Welcome to the E2E committee channel.";
test.describe("committee messages layout", () => {
  test.setTimeout(process.env.CI ? 60_000 : 45_000);
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  for (const viewport of PORTAL_QA_VIEWPORTS) {
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

      await assertLoadUnderMs(loadStartedAt, 15_000);

      await assertCommitteeMobileMenu(page, viewport);

      await assertMinViewportHeight(panel, viewport);
      await assertNoHorizontalOverflow(page);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `committee-messages-${viewport.name}.png`),
        fullPage: true,
      });
    });
  }
});
