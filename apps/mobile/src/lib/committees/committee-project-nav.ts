import type { Href } from 'expo-router';

import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';

export function parentCommitteeProjectRoute(
  slug: string,
  committeeId: string,
  projectId: string,
): Href {
  return `/parent/${slug}/more/committees/workspace/${encodeURIComponent(committeeId)}/project/${encodeURIComponent(projectId)}` as Href;
}

export function teacherCommitteeProjectRoute(
  slug: string,
  committeeId: string,
  projectId: string,
): Href {
  return `/teacher/${slug}/more/committees/workspace/${encodeURIComponent(committeeId)}/project/${encodeURIComponent(projectId)}` as Href;
}

export function schoolAdminCommitteeProjectRoute(
  slug: string,
  committeeId: string,
  projectId: string,
): Href {
  return `/school-admin/${slug}/more/committees/${encodeURIComponent(committeeId)}/project/${encodeURIComponent(projectId)}` as Href;
}

export function committeeProjectRouteForPortal(
  portalApiNamespace: CommitteePortalApiNamespace,
  slug: string,
  committeeId: string,
  projectId: string,
): Href {
  if (portalApiNamespace === 'school-admin') {
    return schoolAdminCommitteeProjectRoute(slug, committeeId, projectId);
  }
  if (portalApiNamespace === 'teacher-portal') {
    return teacherCommitteeProjectRoute(slug, committeeId, projectId);
  }
  return parentCommitteeProjectRoute(slug, committeeId, projectId);
}

export function parentCommitteeWorkspaceWithProjectDeepLink(
  slug: string,
  committeeId: string,
  projectId: string,
): Href {
  return `/parent/${slug}/more/committees/workspace/${encodeURIComponent(committeeId)}?section=projects&project=${encodeURIComponent(projectId)}` as Href;
}
