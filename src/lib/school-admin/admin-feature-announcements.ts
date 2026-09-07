import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminFeatures } from "@/lib/organization-settings/types";

export type AdminFeatureAnnouncementCtaLabel = "Try it now" | "View" | "Open";

export type AdminFeatureAnnouncement = {
  id: string;
  title: string;
  description: string;
  ctaLabel: AdminFeatureAnnouncementCtaLabel;
  feature: keyof AdminFeatures;
  href: (slug: string) => string;
  publishedAt: string;
};

export type ResolvedAdminFeatureAnnouncement = Omit<
  AdminFeatureAnnouncement,
  "href"
> & {
  href: string;
};

const ADMIN_FEATURE_ANNOUNCEMENTS: AdminFeatureAnnouncement[] = [
  {
    id: "school-bulletin",
    title: "School bulletin",
    description:
      "Post updates to families, teachers, or programs with scheduling and attachments.",
    ctaLabel: "Try it now",
    feature: "bulletin",
    href: (slug) => schoolAdminPath(slug, "bulletin"),
    publishedAt: "2026-09-04",
  },
  {
    id: "classroom-management",
    title: "Classroom management",
    description: "Create classrooms and assign students and guides by room.",
    ctaLabel: "Try it now",
    feature: "my_school",
    href: (slug) => schoolAdminPath(slug, "my_school", "classrooms"),
    publishedAt: "2026-09-04",
  },
  {
    id: "program-parent-portals",
    title: "Program parent portals",
    description:
      "Configure per-program portal URLs and choose what each program's families can access.",
    ctaLabel: "View",
    feature: "admissions",
    href: (slug) => schoolAdminPath(slug, "admissions", "programs"),
    publishedAt: "2026-09-03",
  },
  {
    id: "tuition-workspace",
    title: "Tuition workspace",
    description:
      "Redesigned family sidebar, rate catalog, and billing panels in one place.",
    ctaLabel: "Open",
    feature: "my_school",
    href: (slug) => schoolAdminPath(slug, "my_school", "tuition"),
    publishedAt: "2026-09-03",
  },
  {
    id: "admissions-submissions",
    title: "Admissions submissions",
    description:
      "Clearer queue with next-step column and action-needed highlighting.",
    ctaLabel: "View",
    feature: "admissions",
    href: (slug) => schoolAdminPath(slug, "admissions", "submissions"),
    publishedAt: "2026-08-29",
  },
];

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isWithinSinceDays(
  publishedAt: string,
  sinceDays: number,
  now: Date,
): boolean {
  const published = startOfDay(parseIsoDate(publishedAt));
  const cutoff = startOfDay(now);
  cutoff.setDate(cutoff.getDate() - sinceDays);
  return published >= cutoff;
}

export function getAdminFeatureAnnouncements(
  slug: string,
  features: AdminFeatures,
  options?: { limit?: number; sinceDays?: number; now?: Date },
): ResolvedAdminFeatureAnnouncement[] {
  const sinceDays = options?.sinceDays ?? 14;
  const now = options?.now ?? new Date();

  const filtered = ADMIN_FEATURE_ANNOUNCEMENTS.filter(
    (announcement) =>
      features[announcement.feature] &&
      isWithinSinceDays(announcement.publishedAt, sinceDays, now),
  ).sort(
    (left, right) =>
      parseIsoDate(right.publishedAt).getTime() -
      parseIsoDate(left.publishedAt).getTime(),
  );

  const limited =
    options?.limit != null ? filtered.slice(0, options.limit) : filtered;

  return limited.map(({ href, ...announcement }) => ({
    ...announcement,
    href: href(slug),
  }));
}
