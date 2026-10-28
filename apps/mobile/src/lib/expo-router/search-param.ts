/** Normalize Expo Router dynamic / query params that may be `string | string[]`. */
export function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}
