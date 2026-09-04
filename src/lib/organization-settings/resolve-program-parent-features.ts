import {
  DEFAULT_PROGRAM_PARENT_PORTAL_SETTINGS,
  type ProgramParentPortalSettings,
} from "@/lib/admissions/program-parent-portal";
import { DEFAULT_FEATURES } from "./catalog";
import type {
  OrganizationFeatures,
  ParentFeatures,
  PortalFeatureNav,
} from "./types";

export type ParentPortalContextOption = {
  id: "main" | `program:${string}`;
  label: string;
  portalSlug?: string;
  programId?: string;
  entryHref?: string;
};

function toParentFeatureRecord(
  parentFeatures: ParentFeatures,
): Record<string, boolean> {
  return parentFeatures as unknown as Record<string, boolean>;
}

function allParentFeatureKeys(orgFeatures: OrganizationFeatures): string[] {
  const orgParent = orgFeatures.parent ?? DEFAULT_FEATURES.parent;
  const keys = new Set<string>(Object.keys(DEFAULT_FEATURES.parent));
  for (const key of Object.keys(orgParent)) {
    keys.add(key);
  }
  for (const key of Object.keys(orgFeatures)) {
    if (typeof orgFeatures[key] === "boolean") continue;
    if (key === "feature_nav" || key === "parent_onboarding" || key === "apply_auth_entry") {
      continue;
    }
  }
  return [...keys];
}

export function resolveProgramParentFeatures(
  orgFeatures: OrganizationFeatures,
  programSettings: ProgramParentPortalSettings = DEFAULT_PROGRAM_PARENT_PORTAL_SETTINGS,
): ParentFeatures {
  const orgParent = orgFeatures.parent ?? DEFAULT_FEATURES.parent;
  if (programSettings.mode !== "isolated") {
    return { ...orgParent };
  }

  const programParent = programSettings.features ?? {};
  const result = { ...orgParent } as Record<string, boolean>;

  for (const key of allParentFeatureKeys(orgFeatures)) {
    const orgEnabled = Boolean((orgParent as Record<string, boolean>)[key]);
    const programRequested = Boolean((programParent as Record<string, boolean>)[key]);
    result[key] = orgEnabled && programRequested;
  }

  result.portal = Boolean(orgParent.portal) && Boolean(programParent.portal ?? true);

  return result as ParentFeatures;
}

export function resolveProgramOrganizationFeatures(
  orgFeatures: OrganizationFeatures,
  programSettings: ProgramParentPortalSettings,
): OrganizationFeatures {
  const parent = resolveProgramParentFeatures(orgFeatures, programSettings);
  const programNav = programSettings.feature_nav?.parent;
  const orgNav = orgFeatures.feature_nav?.parent;

  const mergedNav: PortalFeatureNav | undefined =
    programNav || orgNav
      ? {
          groups: programNav?.groups ?? orgNav?.groups,
          order: programNav?.order ?? orgNav?.order,
          items: {
            ...(orgNav?.items ?? {}),
            ...(programNav?.items ?? {}),
          },
          children: {
            ...(orgNav?.children ?? {}),
            ...(programNav?.children ?? {}),
          },
        }
      : undefined;

  return {
    ...orgFeatures,
    parent,
    feature_nav: mergedNav
      ? {
          ...orgFeatures.feature_nav,
          parent: mergedNav,
        }
      : orgFeatures.feature_nav,
  };
}

export function needsParentPortalContextSwitcher(
  contexts: ParentPortalContextOption[],
): boolean {
  return contexts.length > 1;
}

export function buildMainParentPortalContext(
  schoolName: string,
): ParentPortalContextOption {
  return {
    id: "main",
    label: schoolName,
  };
}

export function buildProgramParentPortalContext(input: {
  programId: string;
  portalSlug: string;
  label: string;
}): ParentPortalContextOption {
  return {
    id: `program:${input.programId}`,
    label: input.label,
    portalSlug: input.portalSlug,
    programId: input.programId,
  };
}

export function getEnabledParentFeatureKeys(
  parentFeatures: ParentFeatures,
): string[] {
  return Object.entries(toParentFeatureRecord(parentFeatures))
    .filter(([key, enabled]) => enabled && key !== "portal")
    .map(([key]) => key);
}

export function programParentPortalHasEnabledFeatures(
  orgFeatures: OrganizationFeatures,
  programSettings: ProgramParentPortalSettings,
): boolean {
  const resolved = resolveProgramParentFeatures(orgFeatures, programSettings);
  if (!resolved.portal) return false;
  return getEnabledParentFeatureKeys(resolved).length > 0;
}
