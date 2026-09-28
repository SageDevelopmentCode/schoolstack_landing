/** Matches PostgREST default `max_rows` in supabase/config.toml and hosted projects. */
export const POSTGREST_DEFAULT_MAX_ROWS = 1000;

export type PostgrestPageResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

/**
 * Fetches every row from a PostgREST query by paging with `.range(from, to)`.
 * The caller must apply a stable `.order(...)` inside `fetchPage`.
 */
export async function fetchAllPostgrestRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PostgrestPageResult<T>>,
): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;

  while (true) {
    const from = offset;
    const to = offset + POSTGREST_DEFAULT_MAX_ROWS - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) {
      throw new Error(error.message);
    }

    const page = data ?? [];
    all.push(...page);

    if (page.length < POSTGREST_DEFAULT_MAX_ROWS) {
      break;
    }

    offset += POSTGREST_DEFAULT_MAX_ROWS;
  }

  return all;
}

export function chunkArray<T>(items: readonly T[], chunkSize: number): T[][] {
  if (chunkSize < 1) {
    throw new Error("chunkSize must be >= 1");
  }
  if (items.length === 0) {
    return [];
  }

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize) as T[]);
  }
  return chunks;
}
