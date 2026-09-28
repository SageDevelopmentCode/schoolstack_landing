import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  fetchAllPostgrestRows,
  POSTGREST_DEFAULT_MAX_ROWS,
} from "./fetch-all-rows";

describe("fetchAllPostgrestRows", () => {
  it("merges pages until a short page is returned", async () => {
    const rangeCalls: Array<{ from: number; to: number }> = [];
    let call = 0;

    const rows = await fetchAllPostgrestRows(async (from, to) => {
      rangeCalls.push({ from, to });
      call += 1;

      if (call === 1) {
        return {
          data: Array.from({ length: POSTGREST_DEFAULT_MAX_ROWS }, (_, i) => ({
            id: `a-${i}`,
          })),
          error: null,
        };
      }

      return {
        data: Array.from({ length: 500 }, (_, i) => ({ id: `b-${i}` })),
        error: null,
      };
    });

    assert.equal(rows.length, POSTGREST_DEFAULT_MAX_ROWS + 500);
    assert.deepEqual(rangeCalls, [
      { from: 0, to: POSTGREST_DEFAULT_MAX_ROWS - 1 },
      { from: POSTGREST_DEFAULT_MAX_ROWS, to: 2 * POSTGREST_DEFAULT_MAX_ROWS - 1 },
    ]);
  });

  it("throws when a page returns an error", async () => {
    await assert.rejects(
      () =>
        fetchAllPostgrestRows(async () => ({
          data: null,
          error: { message: "boom" },
        })),
      /boom/,
    );
  });

  it("returns an empty array when the first page is empty", async () => {
    const rows = await fetchAllPostgrestRows(async () => ({
      data: [],
      error: null,
    }));
    assert.deepEqual(rows, []);
  });
});
