import type { BlogFeatureTagId } from "@/content/blog/blog-feature-tags";
import type { RepoBlogPostEntry } from "@/content/blog/types";
import SimplifyMicroschoolNewslettersPost, {
  repoBlogMeta as simplifyMicroschoolNewslettersMeta,
} from "@/content/blog/posts/simplify-microschool-newsletters";

const REPO_BLOG_POSTS: Record<string, RepoBlogPostEntry> = {
  [simplifyMicroschoolNewslettersMeta.slug]: {
    meta: simplifyMicroschoolNewslettersMeta,
    Content: SimplifyMicroschoolNewslettersPost,
  },
};

export function getRepoBlogPost(slug: string): RepoBlogPostEntry | null {
  return REPO_BLOG_POSTS[slug] ?? null;
}

export function getRepoBlogFeatureTags(slug: string): BlogFeatureTagId[] {
  return getRepoBlogPost(slug)?.meta.featureTags ?? [];
}

export function listRepoBlogSlugs(): string[] {
  return Object.keys(REPO_BLOG_POSTS);
}

export function repoBlogPostSourcePath(slug: string): string {
  return `src/content/blog/posts/${slug}.tsx`;
}
