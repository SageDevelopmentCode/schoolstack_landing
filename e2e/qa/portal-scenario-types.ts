import type { Page } from "@playwright/test";
import type { E2eSeedManifest } from "../fixtures/seed";
import type { PortalQaViewport } from "./viewports";

export type PortalQaAuth = "parent" | "staff" | "school_admin";

export type PortalQaScenario = {
  id: string;
  auth: PortalQaAuth;
  buildPath: (manifest: E2eSeedManifest) => string;
  layoutTestId?: string;
  assertReady?: (page: Page, manifest: E2eSeedManifest) => Promise<void>;
  afterReady?: (page: Page, viewport: PortalQaViewport) => Promise<void>;
  layoutMinHeight?: boolean;
  loadBudgetMs?: number;
};
