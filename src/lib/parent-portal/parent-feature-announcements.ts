import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listGlobalParentFeatureAnnouncements,
  listOrgParentFeatureAnnouncements,
  type ParentFeatureAnnouncementCtaLabel,
  type ParentFeatureAnnouncementFeatureKey,
  type ParentFeatureAnnouncementPortalScope,
  type ParentFeatureAnnouncementRecord,
  PARENT_FEATURE_ANNOUNCEMENT_CTA_LABELS,
  PARENT_FEATURE_ANNOUNCEMENT_FEATURE_KEYS,
  PARENT_FEATURE_ANNOUNCEMENT_PORTAL_SCOPES,
} from "@/lib/admin/parent-feature-announcements-storage";
import { resolveParentActionHref } from "@/lib/parent-portal/parent-documentation";
import type {
  OrganizationFeatures,
  ParentFeatures,
} from "@/lib/organization-settings/types";

export type {
  ParentFeatureAnnouncementCtaLabel,
  ParentFeatureAnnouncementFeatureKey,
  ParentFeatureAnnouncementPortalScope,
};
export {
  PARENT_FEATURE_ANNOUNCEMENT_CTA_LABELS,
  PARENT_FEATURE_ANNOUNCEMENT_FEATURE_KEYS,
  PARENT_FEATURE_ANNOUNCEMENT_PORTAL_SCOPES,
};

export type ParentFeatureAnnouncementContext = {
  slug: string;
  features: OrganizationFeatures;
  coopModeEnabled: boolean;
  bulletinEnabled: boolean;
  programSlug?: string;
  parentNavBasePath?: string;
  previewBasePath?: string;
};

export type ResolvedParentFeatureAnnouncement = {
  id: string;
  title: string;
  description: string;
  ctaLabel: ParentFeatureAnnouncementCtaLabel;
  feature: ParentFeatureAnnouncementFeatureKey;
  href: string;
  publishedAt: string;
};

type StaticParentFeatureAnnouncement = {
  id: string;
  title: string;
  description: string;
  ctaLabel: ParentFeatureAnnouncementCtaLabel;
  feature: ParentFeatureAnnouncementFeatureKey;
  hrefPath: string;
  portalScope: ParentFeatureAnnouncementPortalScope;
  publishedAt: string;
};

const STATIC_PARENT_FEATURE_ANNOUNCEMENTS: StaticParentFeatureAnnouncement[] = [
  {
    id: "activity-notifications",
    title: "See what's new at a glance",
    description:
      "Your notification center highlights new messages, bulletin posts, and co-op updates so nothing important gets missed.",
    ctaLabel: "Try it now",
    feature: "portal",
    hrefPath: "documentation",
    portalScope: "any",
    publishedAt: "2026-09-10",
  },
  {
    id: "how-to-guides",
    title: "Step-by-step how-to guides",
    description:
      "Searchable help articles walk you through billing, messages, curriculum, and more.",
    ctaLabel: "View",
    feature: "portal",
    hrefPath: "documentation",
    portalScope: "any",
    publishedAt: "2026-09-10",
  },
  {
    id: "coop-supply-list",
    title: "Claim items on the supply list",
    description:
      "Sign up to bring specific supplies for co-op days and see what still needs to be covered.",
    ctaLabel: "Try it now",
    feature: "supply_list",
    hrefPath: "supply_list",
    portalScope: "coop",
    publishedAt: "2026-09-09",
  },
  {
    id: "coop-teaching-schedule",
    title: "Sign up to teach a co-op week",
    description:
      "View the teaching schedule and volunteer to lead or help on a co-op day.",
    ctaLabel: "Try it now",
    feature: "teaching_schedule",
    hrefPath: "teaching_schedule",
    portalScope: "coop",
    publishedAt: "2026-09-09",
  },
  {
    id: "school-bulletin-home",
    title: "School updates on your home page",
    description:
      "Recent school bulletin posts now appear right on your home page.",
    ctaLabel: "View",
    feature: "bulletin",
    hrefPath: "portal",
    portalScope: "any",
    publishedAt: "2026-09-04",
  },
  {
    id: "bulletin-attachments",
    title: "Open bulletin attachments in the portal",
    description:
      "Preview images and files from school updates without leaving the parent portal.",
    ctaLabel: "Try it now",
    feature: "bulletin",
    hrefPath: "portal",
    portalScope: "any",
    publishedAt: "2026-09-05",
  },
  {
    id: "coop-family-directory",
    title: "Message families in your co-op",
    description:
      "See other families in your program and start a conversation from the directory.",
    ctaLabel: "Try it now",
    feature: "messages",
    hrefPath: "messages",
    portalScope: "coop",
    publishedAt: "2026-09-04",
  },
  {
    id: "curriculum-pdf-viewer",
    title: "Read curriculum guides in the browser",
    description:
      "Open your program curriculum PDF inside the portal with a clickable table of contents.",
    ctaLabel: "View",
    feature: "curriculum",
    hrefPath: "curriculum",
    portalScope: "coop",
    publishedAt: "2026-09-07",
  },
  {
    id: "curriculum-discussion",
    title: "Discuss curriculum while you read",
    description:
      "Comment in a sidebar alongside the curriculum document.",
    ctaLabel: "Try it now",
    feature: "curriculum",
    hrefPath: "curriculum",
    portalScope: "coop",
    publishedAt: "2026-09-08",
  },
  {
    id: "curriculum-multiple-guides",
    title: "Browse multiple curriculum guides",
    description:
      "Switch between several curriculum documents when your program shares more than one guide.",
    ctaLabel: "View",
    feature: "curriculum",
    hrefPath: "curriculum",
    portalScope: "coop",
    publishedAt: "2026-09-08",
  },
  {
    id: "portal-switcher",
    title: "Switch between school and co-op portals",
    description:
      "Move between your main school portal and your co-op program portal without getting lost.",
    ctaLabel: "Open",
    feature: "portal",
    hrefPath: "portal",
    portalScope: "coop",
    publishedAt: "2026-09-08",
  },
  {
    id: "program-parent-portal",
    title: "Your program's own parent portal",
    description:
      "Co-op families now have a dedicated portal with features chosen for your program.",
    ctaLabel: "View",
    feature: "portal",
    hrefPath: "portal",
    portalScope: "coop",
    publishedAt: "2026-09-03",
  },
  {
    id: "parent-committees",
    title: "Join a parent committee",
    description:
      "Browse committees, request to join, and share PDFs and images in committee conversations.",
    ctaLabel: "Try it now",
    feature: "committees",
    hrefPath: "committees",
    portalScope: "coop",
    publishedAt: "2026-09-21",
  },
  {
    id: "classroom-signups-respond",
    title: "Respond to classroom sign-ups",
    description:
      "See volunteer requests from teachers and respond from your home page.",
    ctaLabel: "Try it now",
    feature: "classroom_signups",
    hrefPath: "classroom_signups",
    portalScope: "any",
    publishedAt: "2026-09-14",
  },
  {
    id: "parent-forms-documents",
    title: "Forms and documents",
    description: "View, fill, and sign forms that need your attention.",
    ctaLabel: "Open",
    feature: "forms_documents",
    hrefPath: "forms_documents",
    portalScope: "any",
    publishedAt: "2026-09-15",
  },
  {
    id: "friday-branch-enrollment",
    title: "Friday Branch classes",
    description:
      "Browse open classes, see spots left, enroll or join the waitlist, and view class price and flyers before you sign up.",
    ctaLabel: "Try it now",
    feature: "friday_branch",
    hrefPath: "friday_branch",
    portalScope: "coop",
    publishedAt: "2026-09-22",
  },
  {
    id: "message-push-notifications",
    title: "Message alerts on your phone",
    description:
      "Get alerted on your phone when a new message arrives in the MudKitchen mobile app.",
    ctaLabel: "Try it now",
    feature: "messages",
    hrefPath: "messages",
    portalScope: "any",
    publishedAt: "2026-09-20",
  },
  {
    id: "parent-attendance-history",
    title: "Your child's attendance history",
    description: "See past attendance records for each of your children.",
    ctaLabel: "View",
    feature: "attendance",
    hrefPath: "attendance",
    portalScope: "any",
    publishedAt: "2026-09-21",
  },
];

export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isWithinSinceDays(
  publishedAt: string,
  sinceDays: number,
  now: Date,
): boolean {
  const published = startOfDay(parseIsoDate(publishedAt));
  const cutoff = startOfDay(now);
  cutoff.setDate(cutoff.getDate() - sinceDays);
  return published >= cutoff;
}

function isPortalScopeEnabled(
  portalScope: ParentFeatureAnnouncementPortalScope,
  coopModeEnabled: boolean,
): boolean {
  if (portalScope === "any") return true;
  if (portalScope === "coop") return coopModeEnabled;
  if (portalScope === "main") return !coopModeEnabled;
  return true;
}

function isParentFeatureKeyEnabled(
  featureKey: ParentFeatureAnnouncementFeatureKey,
  features: ParentFeatures,
  bulletinEnabled: boolean,
): boolean {
  if (featureKey === "bulletin") {
    return bulletinEnabled;
  }
  return Boolean(features[featureKey as keyof ParentFeatures]);
}

export function resolveParentFeatureAnnouncementHref(
  context: ParentFeatureAnnouncementContext,
  hrefPath: string,
): string {
  const normalized = hrefPath.trim().replace(/^\/+/, "");
  const [feature, subtab] = normalized.split("/").filter(Boolean);
  if (!feature) {
    return resolveParentActionHref(context, { feature: "portal" });
  }
  return resolveParentActionHref(context, {
    feature,
    subtab: subtab || undefined,
  });
}

export function mergeAnnouncementRows(
  globals: ParentFeatureAnnouncementRecord[],
  orgRows: ParentFeatureAnnouncementRecord[],
): ParentFeatureAnnouncementRecord[] {
  const merged = new Map<string, ParentFeatureAnnouncementRecord>();
  for (const row of globals) {
    merged.set(row.announcementId, row);
  }
  for (const row of orgRows) {
    merged.set(row.announcementId, row);
  }
  return Array.from(merged.values());
}

export function filterParentAnnouncements(
  announcements: Array<{
    announcementId: string;
    title: string;
    description: string;
    ctaLabel: ParentFeatureAnnouncementCtaLabel;
    featureKey: ParentFeatureAnnouncementFeatureKey;
    hrefPath: string;
    portalScope: ParentFeatureAnnouncementPortalScope;
    publishedAt: string;
    published: boolean;
  }>,
  context: ParentFeatureAnnouncementContext,
  options?: { limit?: number; sinceDays?: number; now?: Date },
): ResolvedParentFeatureAnnouncement[] {
  const sinceDays = options?.sinceDays ?? 14;
  const now = options?.now ?? new Date();
  const parentFeatures = context.features.parent;

  const filtered = announcements
    .filter(
      (announcement) =>
        announcement.published &&
        isPortalScopeEnabled(announcement.portalScope, context.coopModeEnabled) &&
        isParentFeatureKeyEnabled(
          announcement.featureKey,
          parentFeatures,
          context.bulletinEnabled,
        ) &&
        isWithinSinceDays(announcement.publishedAt, sinceDays, now),
    )
    .sort(
      (left, right) =>
        parseIsoDate(right.publishedAt).getTime() -
        parseIsoDate(left.publishedAt).getTime(),
    );

  const limited =
    options?.limit != null ? filtered.slice(0, options.limit) : filtered;

  return limited.map((announcement) => ({
    id: announcement.announcementId,
    title: announcement.title,
    description: announcement.description,
    ctaLabel: announcement.ctaLabel,
    feature: announcement.featureKey,
    href: resolveParentFeatureAnnouncementHref(context, announcement.hrefPath),
    publishedAt: announcement.publishedAt,
  }));
}

function staticAnnouncementsAsRecords(): ParentFeatureAnnouncementRecord[] {
  return STATIC_PARENT_FEATURE_ANNOUNCEMENTS.map((announcement) => ({
    id: announcement.id,
    organizationId: null,
    announcementId: announcement.id,
    title: announcement.title,
    description: announcement.description,
    ctaLabel: announcement.ctaLabel,
    featureKey: announcement.feature,
    hrefPath: announcement.hrefPath,
    portalScope: announcement.portalScope,
    publishedAt: announcement.publishedAt,
    published: true,
    sortOrder: 0,
    createdAt: announcement.publishedAt,
    updatedAt: announcement.publishedAt,
  }));
}

export function getParentFeatureAnnouncements(
  context: ParentFeatureAnnouncementContext,
  options?: { limit?: number; sinceDays?: number; now?: Date },
): ResolvedParentFeatureAnnouncement[] {
  return filterParentAnnouncements(
    staticAnnouncementsAsRecords(),
    context,
    options,
  );
}

export async function fetchParentFeatureAnnouncements(
  supabase: SupabaseClient,
  organizationId: string,
  context: ParentFeatureAnnouncementContext,
  options?: { limit?: number; sinceDays?: number; now?: Date },
): Promise<ResolvedParentFeatureAnnouncement[]> {
  try {
    const [globals, orgRows] = await Promise.all([
      listGlobalParentFeatureAnnouncements(supabase),
      listOrgParentFeatureAnnouncements(supabase, organizationId),
    ]);

    const merged =
      globals.length > 0 || orgRows.length > 0
        ? mergeAnnouncementRows(globals, orgRows)
        : staticAnnouncementsAsRecords();

    return filterParentAnnouncements(merged, context, options);
  } catch {
    return getParentFeatureAnnouncements(context, options);
  }
}
