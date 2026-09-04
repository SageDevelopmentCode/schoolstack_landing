import type { OrganizationEvent } from "./types";
import type { OrganizationEventAudienceScope } from "./events";

export function formatOrganizationEventAudienceLabel(
  event: OrganizationEvent,
  programNameById: ReadonlyMap<string, string>,
): string {
  if (!event.programId) {
    return "All families (main portal + every program portal)";
  }

  return programNameById.get(event.programId) ?? "Program families only";
}

export function describeParentPortalCalendarScope(isProgramPortal = false): string {
  if (isProgramPortal) {
    return "School-wide events appear here too. Events marked for this program only appear in this portal.";
  }
  return "Shows school-wide events only. Program-only events appear in that program's portal.";
}

export function mainPortalAudienceScope(): OrganizationEventAudienceScope {
  return { mode: "main_portal" };
}

export function programPortalAudienceScope(
  programId: string,
): OrganizationEventAudienceScope {
  return { mode: "program_portal", programId };
}
