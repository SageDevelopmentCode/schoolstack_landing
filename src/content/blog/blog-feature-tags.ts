export type BlogFeatureTagId =
  | "school_admin"
  | "newsletter"
  | "teacher_updates"
  | "photos";

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
};

export function resolveBlogFeatureTags(ids: BlogFeatureTagId[]): BlogFeatureTagDefinition[] {
  return ids.map((id) => BLOG_FEATURE_TAG_BY_ID[id]).filter(Boolean);
}
