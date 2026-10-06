export type ParentPortalFeatures = {
  parent?: Record<string, boolean>;
  parent_home?: Record<string, boolean>;
};

export type ParentFridayBranchSettingsPayload = {
  parent_portal_paused: boolean;
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
  fridayBranchSettings?: ParentFridayBranchSettingsPayload | null,
): boolean {
  if (fridayBranchSettings?.parent_portal_paused) {
    return false;
  }
  return (
    Boolean(features?.parent_home?.friday_branch) &&
    Boolean(features?.parent?.friday_branch)
  );
}

export function isParentNavFridayBranchEnabled(
  features: ParentPortalFeatures | undefined,
  fridayBranchSettings?: ParentFridayBranchSettingsPayload | null,
): boolean {
  return (
    isParentFeatureEnabled(features, 'friday_branch') &&
    !fridayBranchSettings?.parent_portal_paused
  );
}
