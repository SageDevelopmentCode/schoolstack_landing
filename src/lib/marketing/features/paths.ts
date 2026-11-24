import type { FeatureSlug } from "./types";

export const FEATURES_PATH = "/features";

export function featurePath(slug: FeatureSlug) {
  return `${FEATURES_PATH}/${slug}`;
}
