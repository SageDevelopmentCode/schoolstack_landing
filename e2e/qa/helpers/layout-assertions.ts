import { expect, type Locator, type Page } from "@playwright/test";
import type { PortalQaViewport } from "../viewports";

export async function assertMinViewportHeight(
  locator: Locator,
  viewport: PortalQaViewport,
): Promise<void> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const minHeight = Math.max(viewport.minPx, viewport.height * viewport.minHeightRatio);
  expect(box!.height).toBeGreaterThanOrEqual(minHeight);
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });
  expect(overflow).toBe(false);
}

export async function assertLoadUnderMs(startedAt: number, budgetMs: number): Promise<void> {
  expect(Date.now() - startedAt).toBeLessThan(budgetMs);
}
