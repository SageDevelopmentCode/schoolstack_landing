import type { CommitteesApiNamespace } from "@/components/portal-committees/PortalCommitteesPage";

export type CommitteesPortalApiNamespace = CommitteesApiNamespace | "school-admin";

export function committeesApiBaseForPortal(
  namespace: CommitteesPortalApiNamespace,
): string {
  return namespace === "school-admin"
    ? "/api/school-admin/committees"
    : `/api/${namespace}/committees`;
}
