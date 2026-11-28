import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * In-memory stand-in for the PostgREST query builder, for loader tests.
 *
 * - Rows come back whole (the column list is ignored), so put embedded
 *   relations straight on the row (`{ ..., programs: { id, name } }`).
 * - Filters: eq, neq, in, is, not(col, "eq"|"is", v), contains, gte, lte, gt, lt.
 *   Dotted columns (`teacher_parent_forms.status`) read an embedded relation.
 *   `or()` is accepted and ignored.
 * - Every query is logged with its table and wave. A wave is one round trip:
 *   queries started before the previous wave resolved share a wave, so
 *   `waveCount` is the number of sequential round trips on the critical path.
 */

type Row = Record<string, unknown>;

export type FakeQueryLogEntry = {
  table: string;
  wave: number;
  filters: string[];
};

type Filter = { label: string; test: (row: Row) => boolean };

function readColumn(row: Row, column: string): unknown {
  if (!column.includes(".")) return row[column];
  const [relation, field] = column.split(".", 2) as [string, string];
  const value = row[relation];
  if (Array.isArray(value)) return value[0]?.[field as keyof (typeof value)[0]];
  if (value && typeof value === "object") return (value as Row)[field];
  return undefined;
}

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function createFakeSupabase(tables: Record<string, Row[]>) {
  const log: FakeQueryLogEntry[] = [];
  let wave = 0;
  let pending: Array<() => void> = [];
  let flushScheduled = false;

  function schedule(run: () => void) {
    pending.push(run);
    if (flushScheduled) return;
    flushScheduled = true;
    setTimeout(() => {
      flushScheduled = false;
      wave += 1;
      const batch = pending;
      pending = [];
      for (const job of batch) job();
    }, 0);
  }

  function from(table: string) {
    const filters: Filter[] = [];
    const orders: Array<{ column: string; ascending: boolean }> = [];
    let limitCount: number | null = null;
    let rangeBounds: [number, number] | null = null;

    function run(): Row[] {
      let rows = (tables[table] ?? []).filter((row) =>
        filters.every((filter) => filter.test(row)),
      );
      if (orders.length > 0) {
        rows = [...rows].sort((a, b) => {
          for (const order of orders) {
            const result = compare(readColumn(a, order.column), readColumn(b, order.column));
            if (result !== 0) return order.ascending ? result : -result;
          }
          return 0;
        });
      }
      if (rangeBounds) rows = rows.slice(rangeBounds[0], rangeBounds[1] + 1);
      if (limitCount !== null) rows = rows.slice(0, limitCount);
      return rows.map((row) => ({ ...row }));
    }

    function execute<T>(shape: (rows: Row[]) => T): Promise<{ data: T; error: null }> {
      return new Promise((resolve) => {
        schedule(() => {
          log.push({ table, wave, filters: filters.map((filter) => filter.label) });
          resolve({ data: shape(run()), error: null });
        });
      });
    }

    const builder = {
      select: () => builder,
      or: () => builder,
      eq(column: string, value: unknown) {
        filters.push({
          label: `${column}=${String(value)}`,
          test: (row) => readColumn(row, column) === value,
        });
        return builder;
      },
      neq(column: string, value: unknown) {
        filters.push({
          label: `${column}!=${String(value)}`,
          test: (row) => readColumn(row, column) !== value,
        });
        return builder;
      },
      in(column: string, values: unknown[]) {
        filters.push({
          label: `${column} in (${values.length})`,
          test: (row) => values.includes(readColumn(row, column)),
        });
        return builder;
      },
      is(column: string, value: unknown) {
        filters.push({
          label: `${column} is ${String(value)}`,
          test: (row) => (readColumn(row, column) ?? null) === value,
        });
        return builder;
      },
      not(column: string, operator: string, value: unknown) {
        filters.push({
          label: `${column} not ${operator} ${String(value)}`,
          test: (row) =>
            operator === "is"
              ? (readColumn(row, column) ?? null) !== value
              : readColumn(row, column) !== value,
        });
        return builder;
      },
      contains(column: string, value: Record<string, unknown>) {
        filters.push({
          label: `${column} contains`,
          test: (row) => {
            const cell = readColumn(row, column) as Row | undefined;
            return Boolean(cell) && Object.entries(value).every(([k, v]) => cell![k] === v);
          },
        });
        return builder;
      },
      gte(column: string, value: unknown) {
        filters.push({ label: `${column}>=`, test: (row) => compare(readColumn(row, column), value) >= 0 });
        return builder;
      },
      lte(column: string, value: unknown) {
        filters.push({ label: `${column}<=`, test: (row) => compare(readColumn(row, column), value) <= 0 });
        return builder;
      },
      gt(column: string, value: unknown) {
        filters.push({ label: `${column}>`, test: (row) => compare(readColumn(row, column), value) > 0 });
        return builder;
      },
      lt(column: string, value: unknown) {
        filters.push({ label: `${column}<`, test: (row) => compare(readColumn(row, column), value) < 0 });
        return builder;
      },
      order(column: string, options?: { ascending?: boolean }) {
        orders.push({ column, ascending: options?.ascending !== false });
        return builder;
      },
      limit(count: number) {
        limitCount = count;
        return builder;
      },
      range(start: number, end: number) {
        rangeBounds = [start, end];
        return builder;
      },
      maybeSingle: () => execute((rows) => rows[0] ?? null),
      single: () => execute((rows) => rows[0] ?? null),
      then<R1, R2>(
        onFulfilled?: (value: { data: Row[]; error: null }) => R1 | PromiseLike<R1>,
        onRejected?: (reason: unknown) => R2 | PromiseLike<R2>,
      ) {
        return execute((rows) => rows).then(onFulfilled, onRejected);
      },
    };

    return builder;
  }

  const client = { from } as unknown as SupabaseClient;

  return {
    client,
    log,
    get waveCount() {
      return wave;
    },
    countByTable(): Record<string, number> {
      const counts: Record<string, number> = {};
      for (const entry of log) counts[entry.table] = (counts[entry.table] ?? 0) + 1;
      return counts;
    },
  };
}
