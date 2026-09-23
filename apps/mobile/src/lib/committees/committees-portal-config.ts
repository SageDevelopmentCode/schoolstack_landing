import type { Href } from 'expo-router';

import type { ParentCommitteesData } from '@/lib/parent/parent-committees-types';

export type CommitteesPortal = 'parent' | 'teacher';

export type CommitteesContextValue = {
  browseCommittees: ParentCommitteesData['browseCommittees'];
  myCommittees: ParentCommitteesData['myCommittees'];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
  getBrowseCommittee: (
    committeeId: string,
  ) => ParentCommitteesData['browseCommittees'][number] | null;
};

export function getCommitteesExploreRoute(
  slug: string,
  portal: CommitteesPortal,
  committeeId: string,
): Href {
  return `/${portal}/${slug}/more/committees/explore/${committeeId}` as Href;
}

export function getCommitteesWorkspaceRoute(
  slug: string,
  portal: CommitteesPortal,
  committeeId: string,
): Href {
  return `/${portal}/${slug}/more/committees/workspace/${committeeId}` as Href;
}
