import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { AUTH_STATE_PATHS } from "../fixtures/constants";
import { getSeedManifest } from "../helpers/seed-manifest";
import {
  assertLoadUnderMs,
  assertMinViewportHeight,
  assertNoHorizontalOverflow,
} from "./helpers/layout-assertions";
import {
  type PortalQaAuth,
  type PortalQaScenario,
  resolvePortalQaScenarios,
} from "./portal-scenarios";
import { PORTAL_QA_VIEWPORTS } from "./viewports";

const ARTIFACT_DIR = path.join(process.cwd(), "e2e/.artifacts/portal-qa");

const AUTH_BY_ROLE: Record<PortalQaAuth, string> = {
  parent: AUTH_STATE_PATHS.parent,
  staff: AUTH_STATE_PATHS.staff,
  school_admin: AUTH_STATE_PATHS.schoolAdmin,
};

function scenariosByAuth(scenarios: PortalQaScenario[]): Map<PortalQaAuth, PortalQaScenario[]> {
  const map = new Map<PortalQaAuth, PortalQaScenario[]>();
  for (const scenario of scenarios) {
    const list = map.get(scenario.auth) ?? [];
    list.push(scenario);
    map.set(scenario.auth, list);
  }
  return map;
}

const selectedScenarios = resolvePortalQaScenarios(process.env.PORTAL_QA_SCENARIOS);
const grouped = scenariosByAuth(selectedScenarios);

test.describe("portal QA capture", () => {
  test.setTimeout(process.env.CI ? 120_000 : 90_000);

  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  for (const [auth, scenarios] of grouped) {
    test.describe(`${auth} scenarios`, () => {
      test.use({ storageState: AUTH_BY_ROLE[auth] });

      for (const scenario of scenarios) {
        for (const viewport of PORTAL_QA_VIEWPORTS) {
          test(`${scenario.id} @ ${viewport.name}`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });

            const manifest = getSeedManifest();
            const url = scenario.buildPath(manifest);
            const loadStartedAt = Date.now();
            await page.goto(url);

            if (scenario.assertReady) {
              await scenario.assertReady(page, manifest);
            } else if (scenario.layoutTestId) {
              await expect(page.getByTestId(scenario.layoutTestId)).toBeVisible({
                timeout: 30_000,
              });
            }

            if (scenario.loadBudgetMs) {
              await assertLoadUnderMs(loadStartedAt, scenario.loadBudgetMs);
            }

            if (scenario.afterReady) {
              await scenario.afterReady(page, viewport);
            }

            if (scenario.layoutMinHeight && scenario.layoutTestId) {
              await assertMinViewportHeight(
                page.getByTestId(scenario.layoutTestId),
                viewport,
              );
            }

            await assertNoHorizontalOverflow(page);

            await page.screenshot({
              path: path.join(ARTIFACT_DIR, `${scenario.id}-${viewport.name}.png`),
              fullPage: true,
            });
          });
        }
      }
    });
  }
});
