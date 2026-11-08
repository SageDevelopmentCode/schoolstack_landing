import type { SupabaseClient } from "@supabase/supabase-js";
import type { EnrolledProgramPortalSummary } from "@/lib/admissions/program-parent-portal-access";
import {
  isProgramParentPortalIsolated,
  parseProgramParentPortalSettings,
} from "@/lib/admissions/program-parent-portal";
import type { PortalAccountLinkContext } from "@/lib/auth/portal-account-link-context";

/**
 * Everything the parent portal needs to know about the signed-in user for one school, loaded with
 * one `parent_portal_access` RPC (20261150) instead of 4-6 sequential queries.
 *
 * `guardianIds` are the user's OWN guardian rows (messaging is per login). `familyIds` and
 * `studentIds` span every linked login, ordered so `familyIds[0]` is stable between requests.
 */
export type ParentPortalAccess = {
  link: PortalAccountLinkContext;
  guardianIds: string[];
  familyIds: string[];
  studentIds: string[];
  enrolledPrograms: EnrolledProgramPortalSummary[];
  /** Any enrolled child in any program (includes isolated program portals). */
  hasEnrolledAccess: boolean;
};

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Maps the RPC's jsonb payload to the typed shape. Exported for tests. */
export function parseParentPortalAccess(
  raw: unknown,
  fallbackUserId: string,
): ParentPortalAccess {
  const root = isRecord(raw) ? raw : {};
  const link = isRecord(root.link) ? root.link : {};
  const memberUserIds = stringArray(link.member_user_ids);
  const primaryUserId =
    typeof link.primary_user_id === "string" ? link.primary_user_id : fallbackUserId;

  const enrolledPrograms: EnrolledProgramPortalSummary[] = [];
  if (Array.isArray(root.enrolled_programs)) {
    for (const row of root.enrolled_programs) {
      if (!isRecord(row)) continue;
      enrolledPrograms.push({
        id: String(row.id),
        name: String(row.name),
        portal_slug: String(row.portal_slug),
        parent_portal_settings: parseProgramParentPortalSettings(row.parent_portal_settings),
      });
    }
  }
  // Same ordering the previous query helper used.
  enrolledPrograms.sort((a, b) => a.name.localeCompare(b.name));

  return {
    link: {
      groupId: typeof link.group_id === "string" ? link.group_id : null,
      primaryUserId,
      memberUserIds: memberUserIds.length > 0 ? memberUserIds : [fallbackUserId],
      isPrimaryLogin:
        typeof link.is_primary_login === "boolean"
          ? link.is_primary_login
          : primaryUserId === fallbackUserId,
    },
    guardianIds: stringArray(root.guardian_ids),
    familyIds: stringArray(root.family_ids),
    studentIds: stringArray(root.student_ids),
    enrolledPrograms,
    hasEnrolledAccess: root.has_enrolled_access === true,
  };
}

/**
 * One RPC for the signed-in user (identified by the client's session; the function ignores any
 * other user). Throws on RPC failure so callers report it like any other server error.
 */
export async function fetchParentPortalAccess(
  supabase: SupabaseClient,
  organizationId: string,
  fallbackUserId = "",
): Promise<ParentPortalAccess> {
  const { data, error } = await supabase.rpc("parent_portal_access", {
    p_organization_id: organizationId,
  });
  if (error) throw error;
  return parseParentPortalAccess(data, fallbackUserId);
}

/** Enrolled in the given program (any program portal, isolated or not). */
export function parentPortalAccessHasProgram(
  access: ParentPortalAccess,
  programId: string,
): boolean {
  return access.enrolledPrograms.some((program) => program.id === programId);
}

/** Enrolled in at least one program that is shown in the main (non-isolated) portal. */
export function parentPortalAccessHasMainPortal(access: ParentPortalAccess): boolean {
  return access.enrolledPrograms.some(
    (program) => !isProgramParentPortalIsolated(program.parent_portal_settings),
  );
}

/**
 * Same rule as `userHasAccessForOptionalProgramScope`: a program id needs enrollment in that
 * program, no program id needs a main-portal enrollment.
 */
export function parentPortalAccessAllowsOptionalProgramScope(
  access: ParentPortalAccess,
  programId?: string | null,
): boolean {
  const trimmed = programId?.trim();
  if (trimmed) return parentPortalAccessHasProgram(access, trimmed);
  return parentPortalAccessHasMainPortal(access);
}

/** Same rule as `userHasAccessForNotificationContext`, evaluated on the access snapshot. */
export function parentPortalAccessAllowsNotificationContext(
  access: ParentPortalAccess,
  context: { mode: string; programId?: string },
): boolean {
  if (context.mode === "program" && context.programId) {
    return parentPortalAccessHasProgram(access, context.programId);
  }
  return parentPortalAccessHasMainPortal(access);
}
