import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveBootstrapNames } from "./resolve-bootstrap-names";

describe("resolveBootstrapNames", () => {
  it("prefers request body names over metadata", () => {
    const result = resolveBootstrapNames({
      bodyFirstName: "Jane",
      bodyLastName: "Doe",
      userMetadata: { first_name: "Meta", last_name: "User" },
    });

    assert.deepEqual(result, { firstName: "Jane", lastName: "Doe" });
  });

  it("falls back to auth metadata when body names are missing", () => {
    const result = resolveBootstrapNames({
      userMetadata: { first_name: "Julius", last_name: "Cecilia" },
    });

    assert.deepEqual(result, { firstName: "Julius", lastName: "Cecilia" });
  });

  it("merges partial body names with metadata", () => {
    const result = resolveBootstrapNames({
      bodyFirstName: "Jane",
      userMetadata: { last_name: "Doe" },
    });

    assert.deepEqual(result, { firstName: "Jane", lastName: "Doe" });
  });

  it("returns empty object when no names are available", () => {
    const result = resolveBootstrapNames({
      userMetadata: {},
    });

    assert.deepEqual(result, {});
  });
});
