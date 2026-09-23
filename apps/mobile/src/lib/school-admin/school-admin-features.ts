export type FeatureNavChildConfig = {
  key: string;
  enabled?: boolean;
};

export type SchoolAdminOrganizationFeatures = {
  admin?: Record<string, boolean>;
  feature_nav?: {
    admin?: {
      items?: Record<
        string,
        {
          children?: FeatureNavChildConfig[];
        }
      >;
    };
  };
};

const MY_SCHOOL_CHILD_DEFAULTS: FeatureNavChildConfig[] = [
  { key: 'students' },
  { key: 'attendance' },
  { key: 'programs' },
  { key: 'staff' },
  { key: 'classrooms' },
  { key: 'forms_documents' },
  { key: 'tuition' },
  { key: 'friday_branch', enabled: false },
];

function mergeFeatureNavChildren(
  stored?: FeatureNavChildConfig[],
): FeatureNavChildConfig[] {
  const defaults = MY_SCHOOL_CHILD_DEFAULTS;
  if (!stored?.length) {
    return defaults.map((child) => ({ ...child }));
  }

  const defaultByKey = new Map(defaults.map((child) => [child.key, child]));
  const result: FeatureNavChildConfig[] = [];

  for (const child of stored) {
    const fallback = defaultByKey.get(child.key);
    result.push({
      key: child.key,
      enabled: child.enabled ?? fallback?.enabled,
    });
    defaultByKey.delete(child.key);
  }

  for (const child of defaultByKey.values()) {
    result.push({ ...child });
  }

  return result;
}

function isFeatureNavChildEnabled(child: FeatureNavChildConfig): boolean {
  return child.enabled !== false;
}

export function parseSchoolAdminFeatures(
  stored: unknown,
): SchoolAdminOrganizationFeatures {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return {};
  }

  const record = stored as Record<string, unknown>;
  const admin =
    record.admin && typeof record.admin === 'object' && !Array.isArray(record.admin)
      ? (record.admin as Record<string, boolean>)
      : undefined;

  const featureNavRaw = record.feature_nav;
  if (
    !featureNavRaw ||
    typeof featureNavRaw !== 'object' ||
    Array.isArray(featureNavRaw)
  ) {
    return { admin, feature_nav: undefined };
  }

  const adminNavRaw = (featureNavRaw as Record<string, unknown>).admin;
  if (!adminNavRaw || typeof adminNavRaw !== 'object' || Array.isArray(adminNavRaw)) {
    return { admin, feature_nav: undefined };
  }

  const itemsRaw = (adminNavRaw as Record<string, unknown>).items;
  if (!itemsRaw || typeof itemsRaw !== 'object' || Array.isArray(itemsRaw)) {
    return { admin, feature_nav: undefined };
  }

  const items: Record<string, { children?: FeatureNavChildConfig[] }> = {};
  for (const [key, value] of Object.entries(itemsRaw)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const childrenRaw = (value as Record<string, unknown>).children;
    if (!Array.isArray(childrenRaw)) continue;
    items[key] = {
      children: childrenRaw
        .filter(
          (child): child is FeatureNavChildConfig =>
            Boolean(child) &&
            typeof child === 'object' &&
            typeof (child as FeatureNavChildConfig).key === 'string',
        )
        .map((child) => ({
          key: child.key,
          enabled: child.enabled,
        })),
    };
  }

  return {
    admin,
    feature_nav: { admin: { items } },
  };
}

export function isAdminFeatureEnabled(
  features: SchoolAdminOrganizationFeatures | undefined,
  featureKey: string,
): boolean {
  const adminFeatures = features?.admin;
  if (!adminFeatures || typeof adminFeatures !== 'object') {
    return false;
  }

  return Boolean(adminFeatures[featureKey]);
}

export function isAdminNavPathEnabled(
  features: SchoolAdminOrganizationFeatures | undefined,
  featureKey: string,
  subtab?: string,
): boolean {
  if (!isAdminFeatureEnabled(features, featureKey)) {
    return false;
  }

  if (!subtab) {
    return true;
  }

  const storedChildren = features?.feature_nav?.admin?.items?.[featureKey]?.children;
  const children = mergeFeatureNavChildren(storedChildren);
  return children.some((child) => child.key === subtab && isFeatureNavChildEnabled(child));
}

export function isSchoolAdminFridayBranchEnabled(
  features: SchoolAdminOrganizationFeatures | undefined,
): boolean {
  return isAdminNavPathEnabled(features, 'my_school', 'friday_branch');
}
