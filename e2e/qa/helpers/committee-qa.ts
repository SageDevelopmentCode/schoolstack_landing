import { expect, type Page } from "@playwright/test";
import type { E2eSeedManifest } from "../../fixtures/seed";
import type { CommitteeWorkspaceSection } from "../parent-paths";
import { parentCommitteeWorkspacePath } from "../parent-paths";
import type { PortalQaViewport } from "../viewports";

const PARENT_SECTION_NAV_TEST_ID = "parent-committee-section-nav";

export async function assertCommitteeMobileMenu(page: Page, viewport: PortalQaViewport): Promise<void> {
  const isMobileNav = viewport.width < 1024;
  if (!isMobileNav) {
    await expect(page.getByTestId(PARENT_SECTION_NAV_TEST_ID)).toBeVisible();
    return;
  }

  await expect(page.getByTestId("committee-mobile-menu-button")).toBeVisible();
  await expect(page.getByTestId(PARENT_SECTION_NAV_TEST_ID)).toBeHidden();
  await page.getByTestId("committee-mobile-menu-button").click();
  const sheet = page.getByTestId("committee-mobile-menu-sheet");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("tab", { name: "Members" })).toBeVisible();
  await sheet.getByRole("button", { name: "Close committee menu" }).click();
  await expect(sheet).toBeHidden();
}

export function committeeSectionUrl(
  manifest: E2eSeedManifest,
  section: CommitteeWorkspaceSection,
  resolvePath: (
    m: E2eSeedManifest,
    s: CommitteeWorkspaceSection,
  ) => string = parentCommitteeWorkspacePath,
): string {
  return resolvePath(manifest, section);
}
