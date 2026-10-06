import assert from "node:assert/strict";
import { test } from "node:test";
import { getParentFormDetail } from "./load-parent-forms";

test("getParentFormDetail returns null for non-uuid formId without querying", async () => {
  const admin = {
    from: () => {
      throw new Error("database should not be queried");
    },
  } as never;

  const result = await getParentFormDetail(
    admin,
    "00000000-0000-4000-8000-000000000001",
    "00000000-0000-4000-8000-000000000002",
    "form-1791217817977",
  );

  assert.equal(result, null);
});
