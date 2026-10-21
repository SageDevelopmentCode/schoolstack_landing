import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PARENT_FAMILY_PREVIEW_MESSAGES_BASE,
  buildParentFamilyPreviewMessagesQuery,
} from "@/lib/admin/mobile-preview/parent-portal-preview-api";

describe("buildParentFamilyPreviewMessagesQuery", () => {
  it("includes required mobile preview params", () => {
    const query = buildParentFamilyPreviewMessagesQuery({
      organizationId: "org-1",
      slug: "rooted-meadows",
      familyId: "fam-1",
      schoolName: "Rooted Meadows",
    });

    const params = new URLSearchParams(query);
    assert.equal(params.get("organizationId"), "org-1");
    assert.equal(params.get("slug"), "rooted-meadows");
    assert.equal(params.get("familyId"), "fam-1");
    assert.equal(params.get("schoolName"), "Rooted Meadows");
    assert.equal(params.get("programId"), null);
  });

  it("adds programId when provided", () => {
    const query = buildParentFamilyPreviewMessagesQuery({
      organizationId: "org-1",
      slug: "rooted-meadows",
      familyId: "fam-1",
      schoolName: "Rooted Meadows",
      programId: "prog-1",
    });

    assert.equal(new URLSearchParams(query).get("programId"), "prog-1");
  });

  it("exposes the messages preview base path", () => {
    assert.equal(
      PARENT_FAMILY_PREVIEW_MESSAGES_BASE,
      "/api/admin/mobile-preview/parent/messages",
    );
  });
});
