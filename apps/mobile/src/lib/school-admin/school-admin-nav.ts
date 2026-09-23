function normalizeAdminHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      return `${url.pathname}${url.search}`;
    } catch {
      return trimmed;
    }
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function parseQuery(pathWithQuery: string): URLSearchParams {
  const queryIndex = pathWithQuery.indexOf('?');
  if (queryIndex === -1) return new URLSearchParams();
  return new URLSearchParams(pathWithQuery.slice(queryIndex + 1));
}

function pathWithoutQuery(pathWithQuery: string): string {
  const queryIndex = pathWithQuery.indexOf('?');
  return queryIndex === -1 ? pathWithQuery : pathWithQuery.slice(0, queryIndex);
}

export function resolveSchoolAdminNativeRoute(slug: string, href: string): string | null {
  const path = normalizeAdminHref(href);
  if (!path) return null;

  const pathname = pathWithoutQuery(path);
  const query = parseQuery(path);

  const submissionsBase = `/school/${slug}/admin/admissions/submissions`;
  if (pathname === submissionsBase) {
    const applicationId = query.get('applicationId') ?? query.get('application');
    if (applicationId) {
      return `/school-admin/${slug}/admissions/submissions/${applicationId}`;
    }
    return `/school-admin/${slug}/admissions/submissions`;
  }

  const submissionDetailMatch = pathname.match(
    new RegExp(`^/school/${slug}/admin/admissions/submissions/([^/]+)$`),
  );
  if (submissionDetailMatch?.[1]) {
    return `/school-admin/${slug}/admissions/submissions/${submissionDetailMatch[1]}`;
  }

  const messagesBase = `/school/${slug}/admin/messages`;
  if (pathname === messagesBase) {
    const threadId = query.get('thread');
    if (threadId) {
      return schoolAdminMessageThreadRoute(slug, threadId);
    }
    return schoolAdminMessagesRoute(slug);
  }

  const messageThreadMatch = pathname.match(
    new RegExp(`^/school/${slug}/admin/messages/([^/]+)$`),
  );
  if (messageThreadMatch?.[1]) {
    return `/school-admin/${slug}/messages/${messageThreadMatch[1]}`;
  }

  const scheduleBase = `/school/${slug}/admin/schedule`;
  if (pathname === scheduleBase || pathname.startsWith(`${scheduleBase}/`)) {
    return `/school-admin/${slug}/more/schedule`;
  }

  const bulletinBase = `/school/${slug}/admin/bulletin`;
  if (pathname === bulletinBase || pathname.startsWith(`${bulletinBase}/`)) {
    return `/school-admin/${slug}/more/bulletin`;
  }

  const studentsPaths = [
    `/school/${slug}/admin/students`,
    `/school/${slug}/admin/my_school/students`,
  ];
  if (studentsPaths.includes(pathname)) {
    return `/school-admin/${slug}/students`;
  }

  const studentDetailMatch = pathname.match(
    new RegExp(`^/school/${slug}/admin/(?:my_school/)?students/([^/]+)$`),
  );
  if (studentDetailMatch?.[1]) {
    return `/school-admin/${slug}/students/${studentDetailMatch[1]}`;
  }

  const attendancePaths = [
    `/school/${slug}/admin/my_school/attendance`,
    `/school/${slug}/admin/attendance`,
  ];
  if (attendancePaths.includes(pathname)) {
    return `/school-admin/${slug}/more/attendance`;
  }

  const classroomsPaths = [
    `/school/${slug}/admin/classrooms`,
    `/school/${slug}/admin/my_school/classrooms`,
  ];
  if (classroomsPaths.includes(pathname)) {
    return `/school-admin/${slug}/more/classrooms`;
  }

  const classroomDetailMatch = pathname.match(
    new RegExp(`^/school/${slug}/admin/(?:my_school/)?classrooms/([^/]+)$`),
  );
  if (classroomDetailMatch?.[1]) {
    return `/school-admin/${slug}/more/classrooms/${classroomDetailMatch[1]}`;
  }

  const committeesBase = `/school/${slug}/admin/committees`;
  if (pathname === committeesBase || pathname.startsWith(`${committeesBase}/`)) {
    const committeeId = query.get('committee');
    const section = query.get('section');
    if (committeeId) {
      const sectionQuery = section ? `?section=${encodeURIComponent(section)}` : '';
      return `/school-admin/${slug}/more/committees/${committeeId}${sectionQuery}`;
    }
    return `/school-admin/${slug}/more/committees`;
  }

  return null;
}

export function schoolAdminCommitteesRoute(slug: string): string {
  return `/school-admin/${slug}/more/committees`;
}

export function schoolAdminCommitteeWorkspaceRoute(
  slug: string,
  committeeId: string,
  section?: string,
): string {
  const base = `/school-admin/${slug}/more/committees/${encodeURIComponent(committeeId)}`;
  if (!section) return base;
  return `${base}?section=${encodeURIComponent(section)}`;
}

export function schoolAdminSubmissionsRoute(slug: string): string {
  return `/school-admin/${slug}/admissions/submissions`;
}

export function schoolAdminMessagesRoute(slug: string): string {
  return `/school-admin/${slug}/messages`;
}

export function schoolAdminMessageThreadRoute(slug: string, threadId: string): string {
  return `/school-admin/${slug}/messages/${encodeURIComponent(threadId)}`;
}
