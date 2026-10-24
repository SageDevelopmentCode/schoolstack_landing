import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import type { E2eSeedManifest } from "../fixtures/seed";
import { TEST_ORG_SLUG } from "../helpers/constants";
import type { CommitteeWorkspaceSection } from "./parent-paths";

export function teacherSchoolFeaturePath(feature: string, query?: string): string {
  const base = schoolTeacherPath(TEST_ORG_SLUG, feature);
  return query ? `${base}?${query}` : base;
}

export function teacherCommitteeWorkspacePath(
  manifest: E2eSeedManifest,
  section: CommitteeWorkspaceSection,
): string {
  return `/school/${TEST_ORG_SLUG}/teacher/committees?tab=mine&committee=${manifest.committees.parentWorkspace}&section=${section}`;
}

export function teacherCommitteesListPath(): string {
  return `/school/${TEST_ORG_SLUG}/teacher/committees?tab=mine`;
}
