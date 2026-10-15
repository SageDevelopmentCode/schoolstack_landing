import type { ComponentType } from "react";
import type { BlogFeatureTagId } from "@/content/blog/blog-feature-tags";

export type RepoBlogPostMeta = {
  slug: string;
  featureTags?: BlogFeatureTagId[];
};

export type RepoBlogPostEntry = {
  meta: RepoBlogPostMeta;
  Content: ComponentType;
};
