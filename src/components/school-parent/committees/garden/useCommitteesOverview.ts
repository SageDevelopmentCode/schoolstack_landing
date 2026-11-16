import { useMemo } from "react";
import type { ParentCommitteeBrowseItem, ParentCommitteeListItem } from "@/lib/committees/types";
import { JOIN_STEPS_DONE } from "./committee-garden-shared";

/**
 * Derived, display-only numbers for the Committees list page (rail stats and
 * the "where am I in the joining journey" step). No fetching here: everything
 * comes from lists the page already loaded.
 */
export function useCommitteesOverview({
  myCommittees,
  browseCommittees,
  unreadByCommitteeId,
}: {
  myCommittees: ParentCommitteeListItem[];
  browseCommittees: ParentCommitteeBrowseItem[];
  unreadByCommitteeId: Record<string, number>;
}) {
  return useMemo(() => {
    const unreadTotal = myCommittees.reduce(
      (sum, committee) => sum + (unreadByCommitteeId[committee.id] ?? 0),
      0,
    );
    const openTaskTotal = myCommittees.reduce((sum, committee) => sum + committee.openTaskCount, 0);
    const pendingCount = browseCommittees.filter(
      (committee) => !committee.isMember && committee.requestStatus === "pending",
    ).length;
    const approvedWaiting = browseCommittees.some(
      (committee) => !committee.isMember && committee.requestStatus === "approved",
    );

    const journeyStep =
      pendingCount > 0
        ? 2
        : approvedWaiting
          ? 3
          : myCommittees.length > 0
            ? JOIN_STEPS_DONE
            : 0;

    return { unreadTotal, openTaskTotal, pendingCount, journeyStep };
  }, [browseCommittees, myCommittees, unreadByCommitteeId]);
}
