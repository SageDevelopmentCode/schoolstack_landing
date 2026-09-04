export type MessageThreadAudienceScope =
  | { mode: "all" }
  | { mode: "main_portal" }
  | { mode: "program_portal"; programId: string };

export function mainPortalMessageAudienceScope(): MessageThreadAudienceScope {
  return { mode: "main_portal" };
}

export function programPortalMessageAudienceScope(
  programId: string,
): MessageThreadAudienceScope {
  return { mode: "program_portal", programId };
}

export function applyMessageThreadAudienceScope<
  T extends {
    is(column: string, value: null): T;
    or(filter: string): T;
  },
>(query: T, scope?: MessageThreadAudienceScope): T {
  if (!scope || scope.mode === "all") {
    return query;
  }
  if (scope.mode === "main_portal") {
    return query.is("program_id", null);
  }
  return query.or(`program_id.is.null,program_id.eq.${scope.programId}`);
}

export function resolveThreadProgramIdForContact(input: {
  contactKind: "guardian" | "staff_member" | "school_office";
  portalProgramId?: string | null;
}): string | null {
  if (input.contactKind === "school_office") {
    return null;
  }
  return input.portalProgramId?.trim() || null;
}

export function threadMatchesPortalContext(input: {
  threadProgramId?: string | null;
  contactKind: "guardian" | "staff_member" | "school_office";
  portalProgramId?: string | null;
}): boolean {
  const threadProgramId = input.threadProgramId ?? null;
  const portalProgramId = input.portalProgramId?.trim() || null;

  if (!portalProgramId) {
    return threadProgramId === null;
  }
  if (input.contactKind === "school_office") {
    return threadProgramId === null;
  }
  return threadProgramId === portalProgramId;
}

export function describeParentPortalMessagesScope(isProgramPortal = false): string {
  if (isProgramPortal) {
    return "School office and school-wide threads appear here too. Co-op-only threads stay in this portal.";
  }
  return "Shows school-wide threads only. Program-only threads appear in that program's portal.";
}
