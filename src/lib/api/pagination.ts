export type ParsedPagination = {
  limit: number;
  offset: number;
};

type PaginationOptions = {
  defaultLimit: number;
  maxLimit: number;
  /** Upper bound for offset. Defaults to 100_000. */
  maxOffset?: number;
};

function parseNonNegativeInt(raw: string | null | undefined): number | null {
  const trimmed = raw?.trim();
  if (!trimmed || !/^-?\d+$/.test(trimmed)) return null;
  const value = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(value) ? value : null;
}

/**
 * Parse `limit` / `offset` query params. Missing or non-integer values (including
 * `NaN`, `1e3`, `abc`) fall back to defaults; `limit` is clamped to
 * `[1, maxLimit]` and `offset` to `[0, maxOffset]`.
 */
export function parsePagination(
  searchParams: URLSearchParams,
  options: PaginationOptions,
): ParsedPagination {
  const maxOffset = options.maxOffset ?? 100_000;
  const rawLimit = parseNonNegativeInt(searchParams.get("limit"));
  const rawOffset = parseNonNegativeInt(searchParams.get("offset"));

  const limit = Math.min(
    Math.max(rawLimit ?? options.defaultLimit, 1),
    options.maxLimit,
  );
  const offset = Math.min(Math.max(rawOffset ?? 0, 0), maxOffset);

  return { limit, offset };
}
