import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseMobilePreviewQuery,
  readOnlyPreviewResponse,
} from "@/lib/admin/mobile-preview/access";

describe("parseMobilePreviewQuery", () => {
  it("parses required preview params", () => {
    const request = new Request(
      "https://example.com/api/admin/mobile-preview/parent/home?organizationId=org-1&slug=rooted-meadows&familyId=fam-1&staffMemberId=staff-1&membershipId=mem-1",
    );

    assert.deepEqual(parseMobilePreviewQuery(request), {
      organizationId: "org-1",
      slug: "rooted-meadows",
      familyId: "fam-1",
      staffMemberId: "staff-1",
      membershipId: "mem-1",
    });
  });

  it("returns empty strings and null ids when params are missing", () => {
    const request = new Request("https://example.com/api/admin/mobile-preview/parent/home");
    assert.deepEqual(parseMobilePreviewQuery(request), {
      organizationId: "",
      slug: "",
      familyId: null,
      staffMemberId: null,
      membershipId: null,
    });
  });
});

describe("readOnlyPreviewResponse", () => {
  it("returns 403 with read_only_preview code", async () => {
    const response = readOnlyPreviewResponse();
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
      error: "Preview mode is read-only.",
      code: "read_only_preview",
    });
  });
});
