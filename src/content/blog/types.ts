import type { ComponentType } from "react";

export type RepoBlogPostMeta = {
  slug: string;
};

export type RepoBlogPostEntry = {
  meta: RepoBlogPostMeta;
  Content: ComponentType;
};
