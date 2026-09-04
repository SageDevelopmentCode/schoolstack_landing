import type { ParentPortalContextOption } from "@/lib/organization-settings/resolve-program-parent-features";
import {
  getFirstParentNavPath,
  getParentPortalHomeHref,
} from "@/lib/organization-settings/parent-nav";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import {
  schoolParentPath,
  type ParentNavPath,
} from "@/lib/organization-settings/parent-routes";
import { resolveProgramOrganizationFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import type { ProgramParentPortalSettings } from "./program-parent-portal";

const MAIN_ONLY_PARENT_FEATURES = new Set([
  "billing",
  "children",
  "notifications",
  "classroom_signups",
  "committees",
]);

export type DetectedParentPortalContext =
  | { mode: "main" }
  | { mode: "program"; portalSlug: string; programId?: string };

export function parseParentPortalFeatureFromPathname(
  pathname: string,
): ParentNavPath | null {
  const programMatch = pathname.match(/\/parent\/p\/[^/]+\/([^/]+)(?:\/([^/]+))?/);
  if (programMatch) {
    return { feature: programMatch[1], subtab: programMatch[2] };
  }

  const mainMatch = pathname.match(/\/parent\/([^/]+)(?:\/([^/]+))?/);
  if (!mainMatch || mainMatch[1] === "p") {
    return null;
  }

  return { feature: mainMatch[1], subtab: mainMatch[2] };
}

export function detectParentPortalContextFromPathname(
  pathname: string,
): DetectedParentPortalContext {
  const programMatch = pathname.match(/\/parent\/p\/([^/]+)/);
  if (programMatch) {
    return { mode: "program", portalSlug: programMatch[1] };
  }
  return { mode: "main" };
}

export function getActiveParentPortalContextId(
  contexts: ParentPortalContextOption[],
  pathname: string,
): ParentPortalContextOption["id"] {
  const detected = detectParentPortalContextFromPathname(pathname);
  if (detected.mode === "program") {
    const match = contexts.find(
      (context) => context.portalSlug === detected.portalSlug,
    );
    return match?.id ?? "main";
  }
  return "main";
}

export function buildParentPortalContextEntryHref(input: {
  slug: string;
  schoolName: string;
  orgFeatures: OrganizationFeatures;
  context: ParentPortalContextOption;
  previewParentBasePath?: string;
  programSettings?: ProgramParentPortalSettings;
}): string {
  const mainBasePath =
    input.previewParentBasePath ?? `/school/${input.slug}/parent`;

  if (input.context.id === "main") {
    return (
      getParentPortalHomeHref(
        input.slug,
        input.orgFeatures.parent,
        input.orgFeatures.feature_nav?.parent,
        mainBasePath,
      ) ?? `${mainBasePath}/portal`
    );
  }

  const programBasePath = `${mainBasePath}/p/${input.context.portalSlug}`;
  const effectiveFeatures =
    input.programSettings != null
      ? resolveProgramOrganizationFeatures(input.orgFeatures, input.programSettings)
      : input.orgFeatures;

  return (
    getParentPortalHomeHref(
      input.slug,
      effectiveFeatures.parent,
      effectiveFeatures.feature_nav?.parent,
      programBasePath,
    ) ?? `${programBasePath}/portal`
  );
}

export function resolveParentPortalContextSwitchHref(input: {
  pathname: string;
  slug: string;
  targetContext: ParentPortalContextOption;
  targetEntryHref: string;
  previewParentBasePath?: string;
}): string {
  const mainBasePath =
    input.previewParentBasePath ?? `/school/${input.slug}/parent`;
  const targetBasePath =
    input.targetContext.id === "main"
      ? mainBasePath
      : `${mainBasePath}/p/${input.targetContext.portalSlug}`;

  const parsed = parseParentPortalFeatureFromPathname(input.pathname);
  if (
    !parsed?.feature ||
    parsed.feature === "portal" ||
    MAIN_ONLY_PARENT_FEATURES.has(parsed.feature)
  ) {
    return input.targetEntryHref;
  }

  const href = parsed.subtab
    ? `${targetBasePath}/${parsed.feature}/${parsed.subtab}`
    : `${targetBasePath}/${parsed.feature}`;

  if (input.targetContext.id === "main") {
    return schoolParentPath(input.slug, parsed.feature, parsed.subtab);
  }

  return href;
}

export function shouldRedirectAwayFromMainParentPortal(
  contexts: ParentPortalContextOption[],
): boolean {
  const hasMain = contexts.some((context) => context.id === "main");
  const hasProgram = contexts.some((context) => context.id.startsWith("program:"));
  return !hasMain && hasProgram;
}

export function resolveDefaultParentPortalEntryHrefFromContexts(
  contexts: ParentPortalContextOption[],
  fallbackHref: string,
): string {
  const firstContext = contexts[0];
  return firstContext?.entryHref ?? fallbackHref;
}

export function buildParentPortalContextOptionsWithEntryHrefs(input: {
  slug: string;
  schoolName: string;
  orgFeatures: OrganizationFeatures;
  contexts: ParentPortalContextOption[];
  programSettingsById?: Map<string, ProgramParentPortalSettings>;
  previewParentBasePath?: string;
}): Array<ParentPortalContextOption & { entryHref: string }> {
  return input.contexts.map((context) => ({
    ...context,
    entryHref: buildParentPortalContextEntryHref({
      slug: input.slug,
      schoolName: input.schoolName,
      orgFeatures: input.orgFeatures,
      context,
      previewParentBasePath: input.previewParentBasePath,
      programSettings:
        context.programId != null
          ? input.programSettingsById?.get(context.programId)
          : undefined,
    }),
  }));
}

export function resolveFirstEnabledParentFeaturePath(input: {
  slug: string;
  orgFeatures: OrganizationFeatures;
  parentBasePath?: string;
}): string | null {
  const basePath = input.parentBasePath ?? `/school/${input.slug}/parent`;
  const first = getFirstParentNavPath(
    input.slug,
    input.orgFeatures.parent,
    input.orgFeatures.feature_nav?.parent,
    basePath,
  );
  if (!first) return null;
  return first.subtab
    ? `${basePath}/${first.feature}/${first.subtab}`
    : `${basePath}/${first.feature}`;
}
