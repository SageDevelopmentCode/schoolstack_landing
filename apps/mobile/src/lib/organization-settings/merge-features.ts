import { DEFAULT_ORGANIZATION_FEATURES } from '@/lib/organization-settings/default-features';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T extends Record<string, unknown>>(
  defaults: T,
  stored: Record<string, unknown> | null | undefined,
): T {
  if (!stored) {
    return structuredClone(defaults);
  }

  const result = structuredClone(defaults) as Record<string, unknown>;

  for (const key of Object.keys(stored)) {
    const storedVal = stored[key];
    const defaultVal = defaults[key];

    if (isPlainObject(storedVal) && isPlainObject(defaultVal)) {
      result[key] = deepMerge(defaultVal as Record<string, unknown>, storedVal);
    } else if (storedVal !== undefined) {
      result[key] = storedVal;
    }
  }

  return result as T;
}

export function mergeOrganizationFeatures(
  stored: unknown,
): Record<string, unknown> {
  const storedRecord = isPlainObject(stored) ? stored : null;
  const merged = deepMerge(
    DEFAULT_ORGANIZATION_FEATURES as unknown as Record<string, unknown>,
    storedRecord,
  );

  if (isPlainObject(storedRecord?.feature_nav)) {
    merged.feature_nav = deepMerge(
      {},
      storedRecord.feature_nav as Record<string, unknown>,
    );
  }

  const storedParent = isPlainObject(storedRecord?.parent)
    ? (storedRecord.parent as Record<string, unknown>)
    : null;
  const admin = isPlainObject(merged.admin) ? (merged.admin as Record<string, unknown>) : null;
  const parent = isPlainObject(merged.parent) ? (merged.parent as Record<string, unknown>) : null;
  if (admin?.committees && storedParent?.committees !== false && parent) {
    merged.parent = { ...parent, committees: true };
  }

  return merged;
}
