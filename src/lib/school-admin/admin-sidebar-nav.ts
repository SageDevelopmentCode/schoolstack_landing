import type {
  AdminNavChildItem,
  AdminNavItem,
} from "@/lib/organization-settings/admin-nav";
import {
  getFirstAdminNavChildPath,
  resolveAdminNavChildHref,
  schoolAdminPath,
} from "@/lib/organization-settings/admin-routes";
import {
  isFreePlanAdminPathOpen,
  isFreePlanNavChildOpen,
} from "@/lib/school-admin/free-plan-upgrade";

/*
 * Pure helpers behind the admin Garden sidebar: active detection, free-plan
 * locks, count badges (Messages, Staff hours), roll-ups for closed groups and
 * the "Find a page" search index. No React, so it is unit tested.
 */

export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export type AdminSidebarCounts = {
  messagesUnread: number;
  staffHoursPending: number;
  /** Applications submitted and waiting for a decision. */
  applicationsToReview: number;
  /** Committee join requests waiting for approve / decline. */
  committeeJoinRequests: number;
};

export type AdminNavCountBadge = {
  count: number;
  /** Screen-reader text, e.g. "6 hour requests waiting". */
  label: string;
};

export function formatNavGroupLabel(label: string): string {
  if (label === "Main") return "Workspace";
  if (label === "Tools") return "Manage";
  return label;
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function isPathAtOrUnder(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isAdminChildPathActive(
  slug: string,
  pathname: string,
  parentFeature: string,
  child: AdminNavChildItem,
): boolean {
  if (child.children?.length) {
    return child.children.some((nested) =>
      isAdminChildPathActive(slug, pathname, parentFeature, nested),
    );
  }
  return isPathAtOrUnder(
    pathname,
    resolveAdminNavChildHref(slug, parentFeature, child),
  );
}

export function firstOpenAdminChildHref(
  slug: string,
  parentFeature: string,
  navChildren: AdminNavChildItem[],
): string | null {
  for (const child of navChildren) {
    if (child.children?.length) {
      const nested = firstOpenAdminChildHref(slug, parentFeature, child.children);
      if (nested) return nested;
      continue;
    }
    if (isFreePlanNavChildOpen(parentFeature, child)) {
      return resolveAdminNavChildHref(slug, parentFeature, child);
    }
  }
  return null;
}

/** Where a top-level row links (first open child on the free plan). */
export function adminNavItemHref(
  slug: string,
  item: AdminNavItem,
  lockedMode: boolean,
): string {
  if (!item.children?.length) return schoolAdminPath(slug, item.key);
  return (
    (lockedMode ? firstOpenAdminChildHref(slug, item.key, item.children) : null) ??
    getFirstAdminNavChildPath(slug, item.key, item.children) ??
    schoolAdminPath(slug, item.key)
  );
}

export function isAdminNavItemLocked(item: AdminNavItem, lockedMode: boolean): boolean {
  if (!lockedMode) return false;
  const hasOpenChild = item.children?.some((child) =>
    isFreePlanNavChildOpen(item.key, child),
  );
  return !isFreePlanAdminPathOpen(item.key) && !hasOpenChild;
}

export function isAdminNavChildLocked(
  parentFeature: string,
  child: AdminNavChildItem,
  lockedMode: boolean,
): boolean {
  return lockedMode && !isFreePlanNavChildOpen(parentFeature, child);
}

export function isMessagesNavChild(child: Pick<AdminNavChildItem, "key" | "routeFeature">): boolean {
  return child.routeFeature === "messages" || child.key === "messages";
}

export function isStaffHoursNavChild(
  parentFeature: string,
  child: Pick<AdminNavChildItem, "key" | "routeFeature">,
): boolean {
  return parentFeature === "my_school" && child.key === "staff_hours" && !child.routeFeature;
}

export function isSubmissionsNavChild(
  parentFeature: string,
  child: Pick<AdminNavChildItem, "key" | "routeFeature">,
): boolean {
  return parentFeature === "admissions" && child.key === "submissions" && !child.routeFeature;
}

export function isCommitteesNavChild(child: Pick<AdminNavChildItem, "key" | "routeFeature">): boolean {
  return child.routeFeature === "committees" || (!child.routeFeature && child.key === "committees");
}

function countBadge(count: number, label: string): AdminNavCountBadge | null {
  return count > 0 ? { count, label } : null;
}

function applicationsBadge(count: number): AdminNavCountBadge | null {
  return countBadge(count, `${plural(count, "application")} to review`);
}

function committeesBadge(count: number): AdminNavCountBadge | null {
  return countBadge(count, `${plural(count, "join request")} waiting`);
}

function messagesBadge(count: number): AdminNavCountBadge | null {
  if (count <= 0) return null;
  return { count, label: `${plural(count, "unread message")}` };
}

function staffHoursBadge(count: number): AdminNavCountBadge | null {
  if (count <= 0) return null;
  return { count, label: `${plural(count, "hour request")} waiting` };
}

/** Count badge for one leaf child row (null when nothing is waiting). */
export function adminNavChildBadge(
  parentFeature: string,
  child: AdminNavChildItem,
  counts: AdminSidebarCounts,
  lockedMode = false,
): AdminNavCountBadge | null {
  if (child.children?.length) return null;
  if (isAdminNavChildLocked(parentFeature, child, lockedMode)) return null;
  if (isMessagesNavChild(child)) return messagesBadge(counts.messagesUnread);
  if (isStaffHoursNavChild(parentFeature, child)) {
    return staffHoursBadge(counts.staffHoursPending);
  }
  if (isSubmissionsNavChild(parentFeature, child)) {
    return applicationsBadge(counts.applicationsToReview);
  }
  if (isCommitteesNavChild(child)) return committeesBadge(counts.committeeJoinRequests);
  return null;
}

/** Count badge for a top-level row without children (Messages at root). */
export function adminNavLeafItemBadge(
  item: AdminNavItem,
  counts: AdminSidebarCounts,
  lockedMode = false,
): AdminNavCountBadge | null {
  if (item.children?.length) return null;
  if (isAdminNavItemLocked(item, lockedMode)) return null;
  if (item.key === "messages") return messagesBadge(counts.messagesUnread);
  if (item.key === "committees") return committeesBadge(counts.committeeJoinRequests);
  return null;
}

/** Everything waiting across the nav (phone menu button). */
export function adminNavTotalBadge(
  navGroups: AdminNavGroup[],
  counts: AdminSidebarCounts,
  lockedMode = false,
): AdminNavCountBadge | null {
  const total = navGroups
    .flatMap((group) => group.items)
    .reduce((sum, item) => sum + (adminNavItemBadge(item, counts, lockedMode)?.count ?? 0), 0);
  return countBadge(total, `${plural(total, "thing")} waiting for you`);
}

function sumChildBadges(
  parentFeature: string,
  navChildren: AdminNavChildItem[],
  counts: AdminSidebarCounts,
  lockedMode: boolean,
): number {
  let total = 0;
  for (const child of navChildren) {
    if (child.children?.length) {
      total += sumChildBadges(parentFeature, child.children, counts, lockedMode);
      continue;
    }
    total += adminNavChildBadge(parentFeature, child, counts, lockedMode)?.count ?? 0;
  }
  return total;
}

/** Sum of every count badge hidden inside a group or nested sub-group. */
export function adminNavRollUpBadge(
  parentFeature: string,
  navChildren: AdminNavChildItem[] | undefined,
  counts: AdminSidebarCounts,
  lockedMode = false,
): AdminNavCountBadge | null {
  if (!navChildren?.length) return null;
  const total = sumChildBadges(parentFeature, navChildren, counts, lockedMode);
  if (total <= 0) return null;
  return { count: total, label: `${total} waiting inside` };
}

/** Badge for any top-level row: its own count, or the roll-up of its children. */
export function adminNavItemBadge(
  item: AdminNavItem,
  counts: AdminSidebarCounts,
  lockedMode = false,
): AdminNavCountBadge | null {
  if (item.children?.length) {
    return adminNavRollUpBadge(item.key, item.children, counts, lockedMode);
  }
  return adminNavLeafItemBadge(item, counts, lockedMode);
}

/* ---------- Find a page ---------- */

export type AdminNavSearchEntry = {
  key: string;
  label: string;
  /** Where it lives, e.g. "My School" or "Workspace". */
  trail: string;
  href: string;
  locked: boolean;
  badge: AdminNavCountBadge | null;
  /** Feature key whose icon/colour the result shows. */
  iconKey: string;
};

export function flattenAdminNavForSearch(
  slug: string,
  navGroups: AdminNavGroup[],
  {
    lockedMode = false,
    includeHome = false,
    counts,
  }: { lockedMode?: boolean; includeHome?: boolean; counts: AdminSidebarCounts },
): AdminNavSearchEntry[] {
  const entries: AdminNavSearchEntry[] = [];
  if (includeHome) {
    entries.push({
      key: "home",
      label: "Home",
      trail: "Workspace",
      href: schoolAdminPath(slug, "home"),
      locked: false,
      badge: null,
      iconKey: "home",
    });
  }

  const visitChildren = (
    item: AdminNavItem,
    navChildren: AdminNavChildItem[],
    trail: string,
  ) => {
    for (const child of navChildren) {
      if (child.children?.length) {
        visitChildren(item, child.children, `${trail} · ${child.name}`);
        continue;
      }
      entries.push({
        key: `${item.key}:${child.key}`,
        label: child.name,
        trail,
        href: resolveAdminNavChildHref(slug, item.key, child),
        locked: isAdminNavChildLocked(item.key, child, lockedMode),
        badge: adminNavChildBadge(item.key, child, counts, lockedMode),
        iconKey: item.key,
      });
    }
  };

  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.children?.length) {
        visitChildren(item, item.children, item.name);
        continue;
      }
      entries.push({
        key: item.key,
        label: item.name,
        trail: formatNavGroupLabel(group.label),
        href: schoolAdminPath(slug, item.key),
        locked: isAdminNavItemLocked(item, lockedMode),
        badge: adminNavLeafItemBadge(item, counts, lockedMode),
        iconKey: item.key,
      });
    }
  }
  return entries;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Entries whose label or trail contain every word of the query. Label
 * matches rank first (starts-with before contains), then trail matches.
 */
export function searchAdminNav(
  entries: AdminNavSearchEntry[],
  query: string,
): AdminNavSearchEntry[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(" ");
  const scored: { entry: AdminNavSearchEntry; score: number; index: number }[] = [];
  entries.forEach((entry, index) => {
    const label = normalize(entry.label);
    const haystack = `${label} ${normalize(entry.trail)}`;
    if (!words.every((word) => haystack.includes(word))) return;
    const score = label.startsWith(q)
      ? 0
      : label.includes(q)
        ? 1
        : words.every((word) => label.includes(word))
          ? 2
          : 3;
    scored.push({ entry, score, index });
  });
  scored.sort((a, b) => a.score - b.score || a.index - b.index);
  return scored.map((row) => row.entry);
}
