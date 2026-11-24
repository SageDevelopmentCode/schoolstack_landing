import type { Feature, FeatureRole, FeatureShot, FeatureSlug } from "./types";
import { FEATURE_SHOTS } from "./shots";
import { admissions } from "./admissions";
import { attendance } from "./attendance";
import { bulletin } from "./bulletin";
import { calendar } from "./calendar";
import { classroomSignups } from "./classroom-signups";
import { classrooms } from "./classrooms";
import { committees } from "./committees";
import { formsDocuments } from "./forms-documents";
import { messages } from "./messages";
import { mobileApp } from "./mobile-app";
import { newsletters } from "./newsletters";
import { photos } from "./photos";
import { schoolWebsite } from "./school-website";
import { staff } from "./staff";
import { staffHours } from "./staff-hours";
import { students } from "./students";
import { tuitionBilling } from "./tuition-billing";

const CONTENT: Feature[] = [
  admissions,
  tuitionBilling,
  schoolWebsite,
  students,
  staff,
  classrooms,
  attendance,
  staffHours,
  messages,
  calendar,
  bulletin,
  newsletters,
  photos,
  committees,
  formsDocuments,
  classroomSignups,
  mobileApp,
];

/**
 * Attach the captured screenshots (shots.ts) to features whose content file has none, ordered by the
 * feature's role order with web before mobile, so the first web shot is the role-1 hero.
 */
/** Hero web screen where the first one by role order isn't the best overview. */
const HERO_WEB: Partial<Record<FeatureSlug, string>> = {
  admissions: "web-admin-submissions",
  "tuition-billing": "web-admin-tuition",
  newsletters: "web-admin-newsletter-editor",
  students: "web-admin-students",
  staff: "web-admin-staff",
  "forms-documents": "web-admin-forms",
};

function withShots(feature: Feature): Feature {
  if (feature.shots.length) return feature;
  const rank = (s: FeatureShot) => {
    const r = feature.roles.indexOf(s.role);
    return (r < 0 ? 9 : r) * 2 + (s.platform === "web" ? 0 : 1);
  };
  const shots = [...(FEATURE_SHOTS[feature.slug] ?? [])].sort((a, b) => rank(a) - rank(b));
  const find = (test: (s: FeatureShot) => boolean) => {
    const i = shots.findIndex(test);
    return i < 0 ? undefined : i;
  };
  const heroWeb = HERO_WEB[feature.slug];
  // The phone beside the hero shows the family view when there is one: that's who uses the app most.
  const heroShots = {
    web: (heroWeb ? find((s) => s.src.endsWith(`/${heroWeb}.webp`)) : undefined) ?? find((s) => s.platform === "web"),
    mobile: find((s) => s.platform === "mobile" && s.role === "family") ?? find((s) => s.platform === "mobile"),
  };
  return { ...feature, shots, heroShots };
}

/** Every feature with a page, in the order the /features grid shows them. */
export const FEATURES: Feature[] = CONTENT.map(withShots);

export const FEATURE_SLUGS: FeatureSlug[] = FEATURES.map((f) => f.slug);

export function getFeature(slug: string): Feature | undefined {
  return FEATURES.find((f) => f.slug === slug);
}

export function featuresByRole(role: FeatureRole): Feature[] {
  return FEATURES.filter((f) => f.roles.includes(role));
}

/** The home page "after the bell" strip, in the order the user listed them. */
const AFTER_BELL_ORDER: FeatureSlug[] = [
  "calendar",
  "bulletin",
  "photos",
  "newsletters",
  "committees",
  "staff",
  "classrooms",
  "forms-documents",
];

export const AFTER_BELL_FEATURES: Feature[] = AFTER_BELL_ORDER.map((slug) => getFeature(slug)).filter(
  (f): f is Feature => Boolean(f),
);
