export type WebsiteBlogContentSource = "html" | "repo";

export type WebsiteBlogPostRecord = {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  excerpt: string;
  bodyHtml: string;
  contentSource: WebsiteBlogContentSource;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WebsiteBlogPostInput = {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  excerpt?: string;
  bodyHtml: string;
  published?: boolean;
  publishedAt?: string | null;
};

export type WebsiteBlogPostUpdateInput = Partial<WebsiteBlogPostInput>;

export type WebsiteBlogPostPublic = Pick<
  WebsiteBlogPostRecord,
  | "slug"
  | "title"
  | "seoTitle"
  | "metaDescription"
  | "primaryKeyword"
  | "secondaryKeywords"
  | "excerpt"
  | "bodyHtml"
  | "contentSource"
  | "publishedAt"
>;

export type WebsiteBlogPostListItem = Pick<
  WebsiteBlogPostRecord,
  "id" | "slug" | "title" | "excerpt" | "published" | "publishedAt" | "updatedAt"
>;
