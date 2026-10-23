import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_PREVIEW_EMBED_PARAM,
  buildPreviewEmbedHref,
  isAdminPreviewEmbeddablePath,
  isAdminPreviewEmbedSearchParam,
  withPreviewEmbedSearchParams,
} from "@/lib/admin/preview-device-viewport";

describe("isAdminPreviewEmbeddablePath", () => {
  it("matches family, teacher, and school admin preview routes", () => {
    assert.equal(
      isAdminPreviewEmbeddablePath(
        "/admin/preview/rooted-meadows/family/fam-1/parent/billing",
      ),
      true,
    );
    assert.equal(
      isAdminPreviewEmbeddablePath(
        "/admin/preview/rooted-meadows/teacher/staff-1/messages",
      ),
      true,
    );
    assert.equal(
      isAdminPreviewEmbeddablePath("/admin/preview/rooted-meadows/admin"),
      true,
    );
    assert.equal(
      isAdminPreviewEmbeddablePath("/admin/preview/rooted-meadows/admin/admissions"),
      true,
    );
  });

  it("does not match non-preview admin routes", () => {
    assert.equal(isAdminPreviewEmbeddablePath("/admin/organizations"), false);
    assert.equal(
      isAdminPreviewEmbeddablePath("/admin/preview/rooted-meadows"),
      false,
    );
  });
});

describe("withPreviewEmbedSearchParams", () => {
  it("sets previewEmbed and preserves other query keys", () => {
    const params = new URLSearchParams("focus=app-1&tab=mine");
    assert.equal(
      withPreviewEmbedSearchParams(
        "/admin/preview/slug/family/fam-1",
        params,
      ),
      `/admin/preview/slug/family/fam-1?focus=app-1&tab=mine&${ADMIN_PREVIEW_EMBED_PARAM}=1`,
    );
  });

  it("buildPreviewEmbedHref delegates to withPreviewEmbedSearchParams", () => {
    assert.equal(
      buildPreviewEmbedHref("/admin/preview/s/a/family/f1", new URLSearchParams()),
      `/admin/preview/s/a/family/f1?${ADMIN_PREVIEW_EMBED_PARAM}=1`,
    );
  });
});

describe("isAdminPreviewEmbedSearchParam", () => {
  it("accepts 1 and true", () => {
    assert.equal(isAdminPreviewEmbedSearchParam("1"), true);
    assert.equal(isAdminPreviewEmbedSearchParam("true"), true);
    assert.equal(isAdminPreviewEmbedSearchParam("0"), false);
    assert.equal(isAdminPreviewEmbedSearchParam(null), false);
  });
});
