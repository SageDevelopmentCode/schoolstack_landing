import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveSignupAttentionFamilyId } from "./resolve-family-id";

const OWN_FAMILY_ID = "family-own";
const FOREIGN_FAMILY_ID = "family-foreign";

describe("resolveSignupAttentionFamilyId", () => {
  it("allows the user's own familyId", () => {
    const result = resolveSignupAttentionFamilyId([OWN_FAMILY_ID], OWN_FAMILY_ID);

    assert.deepEqual(result, { familyId: OWN_FAMILY_ID });
  });

  it("rejects a foreign familyId", () => {
    const result = resolveSignupAttentionFamilyId([OWN_FAMILY_ID], FOREIGN_FAMILY_ID);

    assert.deepEqual(result, { error: "forbidden" });
  });

  it("uses the first allowed family when familyId is omitted", () => {
    const result = resolveSignupAttentionFamilyId(
      [OWN_FAMILY_ID, "family-second"],
      "",
    );

    assert.deepEqual(result, { familyId: OWN_FAMILY_ID });
  });

  it("returns an empty family id when the user has no family membership", () => {
    const result = resolveSignupAttentionFamilyId([], "");

    assert.deepEqual(result, { familyId: "" });
  });
});
