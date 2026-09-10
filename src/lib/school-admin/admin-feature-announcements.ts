import type { SupabaseClient } from "@supabase/supabase-js";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminFeatures } from "@/lib/organization-settings/types";
import {
  ADMIN_FEATURE_ANNOUNCEMENT_CTA_LABELS,
  ADMIN_FEATURE_ANNOUNCEMENT_FEATURE_KEYS,
  listGlobalAdminFeatureAnnouncements,
  listOrgAdminFeatureAnnouncements,
  type AdminFeatureAnnouncementCtaLabel,
  type AdminFeatureAnnouncementRecord,
} from "@/lib/admin/admin-feature-announcements-storage";

export type { AdminFeatureAnnouncementCtaLabel };
export { ADMIN_FEATURE_ANNOUNCEMENT_CTA_LABELS, ADMIN_FEATURE_ANNOUNCEMENT_FEATURE_KEYS };

export type ResolvedAdminFeatureAnnouncement = {
  id: string;
  title: string;
  description: string;
  ctaLabel: AdminFeatureAnnouncementCtaLabel;
  feature: keyof AdminFeatures;
  href: string;
  publishedAt: string;
};

type StaticAdminFeatureAnnouncement = {
  id: string;
  title: string;
  description: string;
  ctaLabel: AdminFeatureAnnouncementCtaLabel;
  feature: keyof AdminFeatures;
  hrefPath: string;
  publishedAt: string;
};

const STATIC_ADMIN_FEATURE_ANNOUNCEMENTS: StaticAdminFeatureAnnouncement[] = [
  {
    id: "waive-tuition-charges",
    title: "Waive tuition charges",
    description:
      "Remove a charge from a family's schedule when they should not be billed.",
    ctaLabel: "Open",
    feature: "my_school",
    hrefPath: "my_school/tuition",
    publishedAt: "2026-09-10",
  },
  {
    id: "coop-supply-list",
    title: "Co-op supply list",
    description:
      "Set up a shared supply list so families can claim what they'll bring.",
    ctaLabel: "Try it now",
    feature: "admissions",
    hrefPath: "admissions/programs",
    publishedAt: "2026-09-09",
  },
  {
    id: "coop-teaching-schedule",
    title: "Co-op teaching schedule",
    description:
      "Publish teaching weeks and let parents sign up to volunteer.",
    ctaLabel: "Try it now",
    feature: "admissions",
    hrefPath: "admissions/programs",
    publishedAt: "2026-09-09",
  },
  {
    id: "coop-curriculum-guides",
    title: "Multiple curriculum guides",
    description:
      "Upload and organize several curriculum PDFs per co-op program.",
    ctaLabel: "View",
    feature: "admissions",
    hrefPath: "admissions/programs",
    publishedAt: "2026-09-08",
  },
  {
    id: "tuition-payment-history",
    title: "Tuition payment history",
    description:
      "See recent payments across families without opening each account.",
    ctaLabel: "Open",
    feature: "my_school",
    hrefPath: "my_school/tuition",
    publishedAt: "2026-09-07",
  },
  {
    id: "committee-descriptions",
    title: "Committee descriptions",
    description:
      "Add a short description when creating a committee so members know what the group is for.",
    ctaLabel: "Try it now",
    feature: "committees",
    hrefPath: "committees",
    publishedAt: "2026-09-05",
  },
  {
    id: "school-bulletin",
    title: "School bulletin",
    description:
      "Post updates to families, teachers, or programs with scheduling and attachments.",
    ctaLabel: "Try it now",
    feature: "bulletin",
    hrefPath: "bulletin",
    publishedAt: "2026-09-04",
  },
  {
    id: "classroom-management",
    title: "Classroom management",
    description: "Create classrooms and assign students and guides by room.",
    ctaLabel: "Try it now",
    feature: "my_school",
    hrefPath: "my_school/classrooms",
    publishedAt: "2026-09-04",
  },
  {
    id: "program-parent-portals",
    title: "Program parent portals",
    description:
      "Configure per-program portal URLs and choose what each program's families can access.",
    ctaLabel: "View",
    feature: "admissions",
    hrefPath: "admissions/programs",
    publishedAt: "2026-09-03",
  },
  {
    id: "tuition-workspace",
    title: "Tuition workspace",
    description:
      "Redesigned family sidebar, rate catalog, and billing panels in one place.",
    ctaLabel: "Open",
    feature: "my_school",
    hrefPath: "my_school/tuition",
    publishedAt: "2026-09-03",
  },
  {
    id: "admissions-submissions",
    title: "Admissions submissions",
    description:
      "Clearer queue with next-step column and action-needed highlighting.",
    ctaLabel: "View",
    feature: "admissions",
    hrefPath: "admissions/submissions",
    publishedAt: "2026-08-29",
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

export function resolveAdminFeatureAnnouncementHref(
  slug: string,
  hrefPath: string,
): string {
  const normalized = hrefPath.trim().replace(/^\/+/, "");
  const [feature, subtab] = normalized.split("/").filter(Boolean);
  if (!feature) {
    return schoolAdminPath(slug, "dashboard");
  }
  return schoolAdminPath(slug, feature, subtab);
}

export function mergeAnnouncementRows(
  globals: AdminFeatureAnnouncementRecord[],
  orgRows: AdminFeatureAnnouncementRecord[],
): AdminFeatureAnnouncementRecord[] {
  const merged = new Map<string, AdminFeatureAnnouncementRecord>();
  for (const row of globals) {
    merged.set(row.announcementId, row);
  }
  for (const row of orgRows) {
    merged.set(row.announcementId, row);
  }
  return Array.from(merged.values());
}

export function filterAnnouncements(
  announcements: Array<{
    announcementId: string;
    title: string;
    description: string;
    ctaLabel: AdminFeatureAnnouncementCtaLabel;
    featureKey: keyof AdminFeatures;
    hrefPath: string;
    publishedAt: string;
    published: boolean;
  }>,
  slug: string,
  features: AdminFeatures,
  options?: { limit?: number; sinceDays?: number; now?: Date },
): ResolvedAdminFeatureAnnouncement[] {
  const sinceDays = options?.sinceDays ?? 14;
  const now = options?.now ?? new Date();

  const filtered = announcements
    .filter(
      (announcement) =>
        announcement.published &&
        features[announcement.featureKey] &&
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
    href: resolveAdminFeatureAnnouncementHref(slug, announcement.hrefPath),
    publishedAt: announcement.publishedAt,
  }));
}

function staticAnnouncementsAsRecords(): AdminFeatureAnnouncementRecord[] {
  return STATIC_ADMIN_FEATURE_ANNOUNCEMENTS.map((announcement) => ({
    id: announcement.id,
    organizationId: null,
    announcementId: announcement.id,
    title: announcement.title,
    description: announcement.description,
    ctaLabel: announcement.ctaLabel,
    featureKey: announcement.feature,
    hrefPath: announcement.hrefPath,
    publishedAt: announcement.publishedAt,
    published: true,
    sortOrder: 0,
    createdAt: announcement.publishedAt,
    updatedAt: announcement.publishedAt,
  }));
}

export function getAdminFeatureAnnouncements(
  slug: string,
  features: AdminFeatures,
  options?: { limit?: number; sinceDays?: number; now?: Date },
): ResolvedAdminFeatureAnnouncement[] {
  return filterAnnouncements(
    staticAnnouncementsAsRecords(),
    slug,
    features,
    options,
  );
}

export async function fetchAdminFeatureAnnouncements(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  features: AdminFeatures,
  options?: { limit?: number; sinceDays?: number; now?: Date },
): Promise<ResolvedAdminFeatureAnnouncement[]> {
  try {
    const [globals, orgRows] = await Promise.all([
      listGlobalAdminFeatureAnnouncements(supabase),
      listOrgAdminFeatureAnnouncements(supabase, organizationId),
    ]);

    const merged =
      globals.length > 0 || orgRows.length > 0
        ? mergeAnnouncementRows(globals, orgRows)
        : staticAnnouncementsAsRecords();

    return filterAnnouncements(merged, slug, features, options);
  } catch {
    return getAdminFeatureAnnouncements(slug, features, options);
  }
}
