import { defaultSchoolTemplate, loadSchoolTemplate } from "./newsletter-template";
import type { NewsletterWorkspaceState } from "./newsletter-types";

const WORKSPACE_STORAGE_PREFIX = "mudkitchen-newsletter-workspace-";
const IMPORT_PROMPT_KEY_PREFIX = "mudkitchen-newsletter-import-prompted-";

export function createEmptyNewsletterWorkspace(
  schoolName: string,
  primaryColor: string,
  template = defaultSchoolTemplate(),
): NewsletterWorkspaceState {
  return {
    school: {
      name: schoolName,
      signature: "With warmth,\nYour school team",
      primary: primaryColor,
    },
    template,
    editions: [],
    activeEditionId: "",
  };
}

export function createInitialNewsletterWorkspace(
  organizationId: string,
  schoolName: string,
  primaryColor: string,
): NewsletterWorkspaceState {
  const stored = loadSchoolTemplate(organizationId);
  return createEmptyNewsletterWorkspace(schoolName, primaryColor, stored ?? undefined);
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

export function loadBrowserNewsletterWorkspaceForImport(
  organizationId: string,
): NewsletterWorkspaceState | null {
  return loadNewsletterWorkspace(organizationId);
}

export function markNewsletterImportPrompted(organizationId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${IMPORT_PROMPT_KEY_PREFIX}${organizationId}`, "1");
  } catch {
    // ignore
  }
}

export function wasNewsletterImportPrompted(organizationId: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return (
      window.sessionStorage.getItem(`${IMPORT_PROMPT_KEY_PREFIX}${organizationId}`) === "1"
    );
  } catch {
    return true;
  }
}

export function clearBrowserNewsletterWorkspace(organizationId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(`${WORKSPACE_STORAGE_PREFIX}${organizationId}`);
  } catch {
    // ignore
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
