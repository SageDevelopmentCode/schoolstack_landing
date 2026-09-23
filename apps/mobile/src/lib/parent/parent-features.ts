export type ParentPortalFeatures = {
  parent?: Record<string, boolean>;
  parent_home?: Record<string, boolean>;
};

export function isParentFeatureEnabled(
  features: ParentPortalFeatures | undefined,
  featureKey: string,
): boolean {
  const parentFeatures = features?.parent;
  if (!parentFeatures || typeof parentFeatures !== 'object') {
    return false;
  }

  return Boolean(parentFeatures[featureKey]);
}

export function isParentHomeFridayBranchEnabled(
  features: ParentPortalFeatures | undefined,
): boolean {
  return (
    Boolean(features?.parent_home?.friday_branch) &&
    Boolean(features?.parent?.friday_branch)
  );
}
