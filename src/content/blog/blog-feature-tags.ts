export type BlogFeatureTagId =
  | "school_admin"
  | "newsletter"
  | "teacher_updates"
  | "photos";

export type BlogFeatureTagDefinition = {
  id: BlogFeatureTagId;
  label: string;
  className: string;
};

export const BLOG_FEATURE_TAG_BY_ID: Record<BlogFeatureTagId, BlogFeatureTagDefinition> = {
  school_admin: {
    id: "school_admin",
    label: "School Admin",
    className: "bg-[#EDE8F2] text-[#5C4D6E]",
  },
  newsletter: {
    id: "newsletter",
    label: "Newsletter",
    className: "bg-[#F5E8E3] text-[#8B4A3A]",
  },
  teacher_updates: {
    id: "teacher_updates",
    label: "Teacher Updates",
    className: "bg-sage-100 text-accent",
  },
  photos: {
    id: "photos",
    label: "Photos",
    className: "bg-[#E3EDF5] text-[#3D5A73]",
  },
};

export function resolveBlogFeatureTags(ids: BlogFeatureTagId[]): BlogFeatureTagDefinition[] {
  return ids.map((id) => BLOG_FEATURE_TAG_BY_ID[id]).filter(Boolean);
}
