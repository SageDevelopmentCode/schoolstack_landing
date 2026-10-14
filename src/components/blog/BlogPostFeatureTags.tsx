import {
  resolveBlogFeatureTags,
  type BlogFeatureTagId,
} from "@/content/blog/blog-feature-tags";

type BlogPostFeatureTagsProps = {
  tags: BlogFeatureTagId[];
  className?: string;
};

export default function BlogPostFeatureTags({ tags, className = "" }: BlogPostFeatureTagsProps) {
  const resolved = resolveBlogFeatureTags(tags);
  if (resolved.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {resolved.map((tag) => (
        <span
          key={tag.id}
          className={`inline-flex items-center rounded-pill px-2.5 py-1 text-[11px] font-semibold font-secondary ${tag.className}`}
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}
