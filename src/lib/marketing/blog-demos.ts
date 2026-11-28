import type { FeatureSlug } from "@/lib/marketing/features/types";

/**
 * What can be shown inside a blog post: live product demos (`<BlogDemo id>`), real feature screenshots
 * (`<BlogShot src>`) and free-tool callouts (`<BlogToolCallout tool>`). Pure metadata, safe to import
 * anywhere; the components live in src/components/blog/demos/.
 */

export type BlogDemoView = "admin" | "parent" | "teacher" | "website";

export type BlogDemoMeta = {
  label: string;
  view: BlogDemoView;
  /** Takes clicks (tabs, threads, forms) rather than a still render. */
  interactive: boolean;
  feature: { slug: FeatureSlug; name: string };
};

export const BLOG_DEMOS = {
  website: { label: "School website", view: "website", interactive: true, feature: { slug: "school-website", name: "the school website" } },
  "website-apply": { label: "School website, apply form", view: "website", interactive: true, feature: { slug: "school-website", name: "the school website" } },
  "admin-dashboard": { label: "Admin dashboard", view: "admin", interactive: true, feature: { slug: "admissions", name: "the admin dashboard" } },
  "admissions-pipeline": { label: "Admissions pipeline", view: "admin", interactive: true, feature: { slug: "admissions", name: "admissions" } },
  "marketing-automations": { label: "Enrollment follow-ups", view: "admin", interactive: true, feature: { slug: "admissions", name: "admissions" } },
  "newsletter-editor": { label: "Newsletter editor", view: "admin", interactive: true, feature: { slug: "newsletters", name: "newsletters" } },
  "newsletter-teacher-updates": { label: "Newsletter, teacher updates", view: "admin", interactive: true, feature: { slug: "newsletters", name: "newsletters" } },
  "newsletter-gallery": { label: "Newsletter, photo gallery", view: "admin", interactive: true, feature: { slug: "newsletters", name: "newsletters" } },
  "parent-home": { label: "Parent home", view: "parent", interactive: false, feature: { slug: "mobile-app", name: "the family app" } },
  "parent-billing": { label: "Parent billing", view: "parent", interactive: false, feature: { slug: "tuition-billing", name: "tuition & billing" } },
  "parent-messages": { label: "Parent messages", view: "parent", interactive: true, feature: { slug: "messages", name: "messages" } },
  "parent-feed": { label: "Parent school feed", view: "parent", interactive: true, feature: { slug: "photos", name: "photos" } },
  "parent-forms": { label: "Parent forms & signatures", view: "parent", interactive: true, feature: { slug: "forms-documents", name: "forms & documents" } },
  "parent-calendar": { label: "Parent calendar", view: "parent", interactive: false, feature: { slug: "calendar", name: "the calendar" } },
  "enrollment-checklist": { label: "Enrollment checklist", view: "parent", interactive: false, feature: { slug: "admissions", name: "admissions" } },
  "parent-apply-submitted": { label: "Application submitted", view: "parent", interactive: false, feature: { slug: "admissions", name: "admissions" } },
  "attendance-roll-call": { label: "Attendance roll call", view: "teacher", interactive: false, feature: { slug: "attendance", name: "attendance" } },
  "staff-hours": { label: "Staff time clock", view: "teacher", interactive: true, feature: { slug: "staff-hours", name: "the time clock" } },
  "teacher-forms": { label: "Teacher forms", view: "teacher", interactive: true, feature: { slug: "forms-documents", name: "forms & documents" } },
} as const satisfies Record<string, BlogDemoMeta>;

export type BlogDemoId = keyof typeof BLOG_DEMOS;
export const BLOG_DEMO_IDS = Object.keys(BLOG_DEMOS) as BlogDemoId[];

export function isBlogDemoId(value: string): value is BlogDemoId {
  return Object.prototype.hasOwnProperty.call(BLOG_DEMOS, value);
}

/**
 * A feature screenshot from public/images/features, written without the folder or extension,
 * e.g. "classroom-signups/web-parent-signups". Must be one of FEATURE_SHOTS (checked by blog-topics.test.ts).
 */
export type BlogShotSrc = `${FeatureSlug}/${"web" | "mobile"}-${string}`;

export function blogShotUrl(src: BlogShotSrc) {
  return `/images/features/${src}.webp`;
}

export type BlogToolId = "tuition-planner" | "how-many-students" | "microschool-ops-check";

export const BLOG_TOOLS: Record<BlogToolId, { href: string; name: string; pitch: string; button: string }> = {
  "tuition-planner": {
    href: "/tuition-planner",
    name: "Tuition revenue planner",
    pitch: "See how a tuition or enrollment change moves your yearly revenue before you commit to it.",
    button: "Plan your tuition",
  },
  "how-many-students": {
    href: "/how-many-students",
    name: "Can your school pay you?",
    pitch: "Find the enrollment you need to cover your costs and pay yourself.",
    button: "Run the numbers",
  },
  "microschool-ops-check": {
    href: "/microschool-ops-check",
    name: "Microschool Ops Check",
    pitch: "A personal operations report for your school in about three minutes.",
    button: "Take the Ops Check",
  },
};
