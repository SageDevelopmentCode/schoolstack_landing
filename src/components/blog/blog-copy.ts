/** /blog copy. Words unchanged from the previous Blog index. */
export const BLOG_COPY = {
  eyebrow: "Blog",
  headlineLead: "Insights for",
  headlineAccent: "microschool founders.",
  bodyBefore: "Stories and practical ideas for launching, growing, and running a small school — or ",
  bodyLink: "book a demo",
  bodyAfter: " to talk with us.",
  readArticle: "Read article",
  empty: {
    title: "No posts yet",
    body: "Check back soon for new writing from the MudKitchen team.",
    link: "See the product on the homepage",
    linkHref: "/#product",
  },
  /** Article footer. */
  backToBlog: "Blog",
  allPosts: "All posts",
  bookDemo: "Book a Demo",
} as const;

export function formatPostDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
