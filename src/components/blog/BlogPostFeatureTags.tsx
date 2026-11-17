import {
  resolveBlogFeatureTags,
  type BlogFeatureTagId,
} from "@/content/blog/blog-feature-tags";

type BlogPostFeatureTagsProps = {
  tags: BlogFeatureTagId[];
  className?: string;
};

/** Feature tags as Garden pills. */
export default function BlogPostFeatureTags({ tags, className = "" }: BlogPostFeatureTagsProps) {
  const resolved = resolveBlogFeatureTags(tags);
  if (resolved.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Topics">
      {resolved.map((tag) => (
        <li key={tag.id} className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${tag.className}`}>
          {tag.label}
        </li>
      ))}
    </ul>
  );
}
