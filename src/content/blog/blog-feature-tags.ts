export type BlogFeatureTagId =
  | "school_admin"
  | "newsletter"
  | "teacher_updates"
  | "photos"
  | "admissions"
  | "tuition"
  | "attendance"
  | "messages"
  | "calendar"
  | "bulletin"
  | "forms"
  | "committees"
  | "classroom_signups"
  | "staff_hours"
  | "website"
  | "mobile_app";

export type BlogFeatureTagDefinition = {
  id: BlogFeatureTagId;
  label: string;
  /** Garden pill tint (needs the .sf-garden scope). Literal strings so Tailwind sees them. */
  className: string;
};

export const BLOG_FEATURE_TAG_BY_ID: Record<BlogFeatureTagId, BlogFeatureTagDefinition> = {
  school_admin: {
    id: "school_admin",
    label: "School Admin",
    className: "bg-[var(--sf-lav)] text-[#5e3a78]",
  },
  newsletter: {
    id: "newsletter",
    label: "Newsletter",
    className: "bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]",
  },
  teacher_updates: {
    id: "teacher_updates",
    label: "Teacher Updates",
    className: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
  },
  photos: {
    id: "photos",
    label: "Photos",
    className: "bg-[var(--sf-sky)] text-[#24507a]",
  },
  admissions: {
    id: "admissions",
    label: "Admissions",
    className: "bg-[var(--sf-butter)] text-[var(--sf-clay-deep)]",
  },
  tuition: {
    id: "tuition",
    label: "Tuition & Billing",
    className: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
  },
  attendance: {
    id: "attendance",
    label: "Attendance",
    className: "bg-[var(--sf-sky)] text-[#24507a]",
  },
  messages: {
    id: "messages",
    label: "Messages",
    className: "bg-[var(--sf-lav)] text-[#5e3a78]",
  },
  calendar: {
    id: "calendar",
    label: "Calendar",
    className: "bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]",
  },
  bulletin: {
    id: "bulletin",
    label: "Bulletin",
    className: "bg-[var(--sf-butter)] text-[var(--sf-clay-deep)]",
  },
  forms: {
    id: "forms",
    label: "Forms & Documents",
    className: "bg-[var(--sf-sky)] text-[#24507a]",
  },
  committees: {
    id: "committees",
    label: "Committees",
    className: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
  },
  classroom_signups: {
    id: "classroom_signups",
    label: "Classroom Signups",
    className: "bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]",
  },
  staff_hours: {
    id: "staff_hours",
    label: "Staff Hours",
    className: "bg-[var(--sf-lav)] text-[#5e3a78]",
  },
  website: {
    id: "website",
    label: "School Website",
    className: "bg-[var(--sf-butter)] text-[var(--sf-clay-deep)]",
  },
  mobile_app: {
    id: "mobile_app",
    label: "Mobile App",
    className: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
  },
};

export function resolveBlogFeatureTags(ids: BlogFeatureTagId[]): BlogFeatureTagDefinition[] {
  return ids.map((id) => BLOG_FEATURE_TAG_BY_ID[id]).filter(Boolean);
}
