import type { AdmissionsOrgSettings } from "./admissions-org-settings";
import {
  getDefaultProgramPortalFeatureToggles,
  type ProgramParentPortalSettings,
} from "./program-parent-portal";
import type { ParentFeatures } from "@/lib/organization-settings/types";

export type ProgramParentPortalOrgConfig = {
  enabled: boolean;
  isolated_program_ids: string[];
};

export const DEFAULT_PROGRAM_PARENT_PORTAL_ORG_CONFIG: ProgramParentPortalOrgConfig =
  {
    enabled: false,
    isolated_program_ids: [],
  };

export function parseProgramParentPortalOrgConfig(
  admissions: AdmissionsOrgSettings | undefined | null,
): ProgramParentPortalOrgConfig {
  const raw = admissions?.program_parent_portal;
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PROGRAM_PARENT_PORTAL_ORG_CONFIG };
  }

  const enabled = Boolean(raw.enabled);
  const isolated_program_ids = Array.isArray(raw.isolated_program_ids)
    ? raw.isolated_program_ids.filter(
        (id): id is string => typeof id === "string" && id.trim().length > 0,
      )
    : [];

  return {
    enabled,
    isolated_program_ids: [...new Set(isolated_program_ids)],
  };
}

export function isProgramParentPortalEnabled(
  config: ProgramParentPortalOrgConfig,
): boolean {
  return config.enabled;
}

export function isProgramIsolationAllowed(
  programId: string,
  config: ProgramParentPortalOrgConfig,
): boolean {
  if (!config.enabled) return false;
  return config.isolated_program_ids.includes(programId);
}

export function buildInitialIsolatedProgramPortalSettings(
  orgParentFeatures: ParentFeatures,
): ProgramParentPortalSettings {
  const features = getDefaultProgramPortalFeatureToggles(orgParentFeatures);
  if (orgParentFeatures.portal) {
    features.portal = true;
  }

  return {
    mode: "isolated",
    features,
  };
}

export type ProgramPortalGovernanceOptions = {
  isolationAllowed: boolean;
};
