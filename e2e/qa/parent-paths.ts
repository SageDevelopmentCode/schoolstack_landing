import { schoolProgramParentPath, schoolParentPath } from "@/lib/organization-settings/parent-routes";
import type { E2eSeedManifest } from "../fixtures/seed";
import { TEST_ORG_SLUG } from "../helpers/constants";

export function parentSchoolFeaturePath(feature: string, query?: string): string {
  const base = schoolParentPath(TEST_ORG_SLUG, feature);
  return query ? `${base}?${query}` : base;
}

export function parentCoopFeaturePath(
  manifest: E2eSeedManifest,
  feature: string,
  query?: string,
): string {
  const base = schoolProgramParentPath(
    TEST_ORG_SLUG,
    manifest.programs.coop.slug,
    feature,
  );
  return query ? `${base}?${query}` : base;
}

export type CommitteeWorkspaceSection =
  | "home"
  | "tasks"
  | "members"
  | "resources"
  | "calendar"
  | "messages";

export function parentCommitteeWorkspacePath(
  manifest: E2eSeedManifest,
  section: CommitteeWorkspaceSection,
): string {
  return `/school/${TEST_ORG_SLUG}/parent/committees?tab=mine&committee=${manifest.committees.parentWorkspace}&section=${section}`;
}
