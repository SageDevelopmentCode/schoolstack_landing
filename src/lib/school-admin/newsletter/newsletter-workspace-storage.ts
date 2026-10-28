import { loadSchoolTemplate } from "./newsletter-template";
import { createSampleEdition } from "./newsletter-sample";
import type { NewsletterWorkspaceState } from "./newsletter-types";

const WORKSPACE_STORAGE_PREFIX = "mudkitchen-newsletter-workspace-";

export function createInitialNewsletterWorkspace(
  organizationId: string,
  schoolName: string,
  primaryColor: string,
): NewsletterWorkspaceState {
  const stored = loadSchoolTemplate(organizationId);
  return createSampleEdition(schoolName, primaryColor, stored ?? undefined);
}

export function loadNewsletterWorkspace(
  organizationId: string,
): NewsletterWorkspaceState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(
      `${WORKSPACE_STORAGE_PREFIX}${organizationId}`,
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NewsletterWorkspaceState;
    if (!parsed?.editions?.length || !parsed.activeEditionId || !parsed.template) {
      return null;
    }
    for (const edition of parsed.editions) {
      if (edition.layout !== "storybook") {
        edition.layout = "storybook";
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveNewsletterWorkspace(
  organizationId: string,
  workspace: NewsletterWorkspaceState,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      `${WORKSPACE_STORAGE_PREFIX}${organizationId}`,
      JSON.stringify(workspace),
    );
  } catch {
    // ignore quota
  }
}

export function hydrateNewsletterWorkspace(
  organizationId: string,
  schoolName: string,
  primaryColor: string,
): NewsletterWorkspaceState {
  return (
    loadNewsletterWorkspace(organizationId) ??
    createInitialNewsletterWorkspace(organizationId, schoolName, primaryColor)
  );
}
