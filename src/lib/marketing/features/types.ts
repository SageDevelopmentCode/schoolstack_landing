import type { LucideIcon } from "lucide-react";
import type { FaqItem } from "@/lib/faq";

/** Who uses a feature. "family" = parents and guardians. */
export type FeatureRole = "admin" | "family" | "staff";

/** The rival school platforms every comparison table uses (see rivals.ts). */
export type RivalId = "brightwheel" | "playground" | "transparent-classroom";

/** A pastel paper colour from the Garden palette. Components map it to literal classes. */
export type FeatureTint = "butter" | "mint" | "sky" | "peach" | "lav";

export type FeatureSlug =
  | "admissions"
  | "tuition-billing"
  | "messages"
  | "attendance"
  | "staff-hours"
  | "calendar"
  | "bulletin"
  | "photos"
  | "newsletters"
  | "committees"
  | "staff"
  | "classrooms"
  | "students"
  | "forms-documents"
  | "classroom-signups"
  | "school-website"
  | "mobile-app";

export type Source = {
  /** Publisher and title, e.g. "U.S. Department of Labor, Fact Sheet #21". */
  label: string;
  url: string;
  /** Year published, if known. */
  year?: string;
};

/** A real product screenshot from public/images/features. */
export type FeatureShot = {
  src: string;
  alt: string;
  /** Short caption under the shot. */
  caption: string;
  role: FeatureRole;
  platform: "web" | "mobile";
  width: number;
  height: number;
};

export type Capability = {
  title: string;
  body: string;
  /** Index into the feature's `shots`, shown when this capability is picked. */
  shot?: number;
};

export type UseCase = {
  title: string;
  /** The moment at school. */
  scenario: string;
  /** What MudKitchen changes. */
  outcome: string;
};

export type Evidence = {
  /** The big number, e.g. "72%". Keep it short. */
  stat: string;
  /** One sentence that says what the number means. */
  claim: string;
  source: Source;
};

/** A comparison cell. `value` is shown; `source` backs any claim about another product. */
export type CompareCell = {
  value: string;
  /** "yes" draws a tick, "partial" a half mark, "no" a dash, "unknown" a grey dash. */
  mark?: "yes" | "partial" | "no" | "unknown";
  source?: Source;
};

export type CompareRow = {
  label: string;
  mudkitchen: CompareCell;
  toolStack: CompareCell;
  rivals: Record<RivalId, CompareCell>;
};

export type Feature = {
  slug: FeatureSlug;
  /** Display name, e.g. "Forms & documents". */
  name: string;
  icon: LucideIcon;
  tint: FeatureTint;
  /** One line for cards (≤ 12 words). */
  oneLiner: string;
  roles: FeatureRole[];
  /** What the feature does for each role, one line each (≤ 14 words). Shown on the /features role tabs. */
  roleLines: Partial<Record<FeatureRole, string>>;
  platforms: { web: boolean; mobile: boolean };
  /** Shown in the home page "after the bell" strip. */
  afterBell?: boolean;
  seo: { title: string; description: string };
  hero: { lead: string; accent: string; body: string };
  shots: FeatureShot[];
  /** Index into `shots` for the hero web frame and the optional phone. */
  heroShots: { web?: number; mobile?: number };
  capabilities: Partial<Record<FeatureRole, Capability[]>>;
  useCases: UseCase[];
  evidence: Evidence[];
  /** The tools a microschool patches together instead, e.g. ["Google Forms", "Venmo"]. */
  toolStack: { names: string[]; logos?: string[] };
  comparison: CompareRow[];
  faq: FaqItem[];
  related: FeatureSlug[];
};
