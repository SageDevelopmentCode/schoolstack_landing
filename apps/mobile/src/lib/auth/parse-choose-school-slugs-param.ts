export function parseChooseSchoolSlugsParam(
  slugsParam: string | string[] | undefined,
): string[] | null {
  const raw = Array.isArray(slugsParam) ? slugsParam[0] : slugsParam;
  if (!raw?.trim()) {
    return null;
  }

  const slugs = raw
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);

  return slugs.length > 0 ? slugs : null;
}
