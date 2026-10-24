import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_PREVIEW_EMBED_PARAM,
  ADMIN_PREVIEW_EMBED_ROUTE_MESSAGE,
  buildPreviewEmbedHref,
  buildPreviewOuterHref,
  isAdminPreviewEmbeddablePath,
  isAdminPreviewEmbedRouteMessage,
  isAdminPreviewEmbedSearchParam,
  stripPreviewEmbedFromSearchParams,
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

describe("stripPreviewEmbedFromSearchParams", () => {
  it("removes previewEmbed and preserves other keys", () => {
    const params = new URLSearchParams(
      `focus=app-1&${ADMIN_PREVIEW_EMBED_PARAM}=1&tab=mine`,
    );
    const stripped = stripPreviewEmbedFromSearchParams(params);
    assert.equal(stripped.toString(), "focus=app-1&tab=mine");
  });
});

describe("buildPreviewOuterHref", () => {
  it("builds outer href without previewEmbed", () => {
    const embedHref = withPreviewEmbedSearchParams(
      "/admin/preview/slug/family/fam-1/parent/billing",
      new URLSearchParams("tab=mine"),
    );
    assert.equal(
      buildPreviewOuterHref(
        "/admin/preview/slug/family/fam-1/parent/billing",
        new URLSearchParams(embedHref.split("?")[1] ?? ""),
      ),
      "/admin/preview/slug/family/fam-1/parent/billing?tab=mine",
    );
  });

  it("accepts search string from postMessage", () => {
    assert.equal(
      buildPreviewOuterHref("/admin/preview/s/a/family/f1", "focus=1"),
      "/admin/preview/s/a/family/f1?focus=1",
    );
  });

  it("strips previewEmbed from search string from postMessage", () => {
    assert.equal(
      buildPreviewOuterHref(
        "/admin/preview/s/a/family/f1",
        `focus=1&${ADMIN_PREVIEW_EMBED_PARAM}=1`,
      ),
      "/admin/preview/s/a/family/f1?focus=1",
    );
  });
});

describe("isAdminPreviewEmbedRouteMessage", () => {
  it("validates embed route messages", () => {
    assert.equal(
      isAdminPreviewEmbedRouteMessage({
        type: ADMIN_PREVIEW_EMBED_ROUTE_MESSAGE,
        pathname: "/admin/preview/x/family/f1/parent/home",
        search: "",
      }),
      true,
    );
    assert.equal(isAdminPreviewEmbedRouteMessage({ type: "other" }), false);
    assert.equal(isAdminPreviewEmbedRouteMessage(null), false);
  });
});
