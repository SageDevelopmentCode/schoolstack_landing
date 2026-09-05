import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterBulletinPostsForViewer,
  formatBulletinAudiencesLabel,
  isBulletinPostActive,
  parentMainPortalBulletinScope,
  parentProgramPortalBulletinScope,
  postVisibleToViewer,
  resolveBulletinDisplayStatus,
  teacherBulletinScope,
} from "./bulletin-audience";
import type { BulletinPost } from "./types";

function samplePost(overrides: Partial<BulletinPost> = {}): BulletinPost {
  return {
    id: "post-1",
    organizationId: "org-1",
    title: "Welcome back",
    body: "School starts Monday.",
    status: "published",
    audiences: ["school_wide"],
    programIds: [],
    createdAt: "2026-09-01T12:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
    attachments: [],
    ...overrides,
  };
}

describe("bulletin audience helpers", () => {
  it("detects active posts using publish and expiry windows", () => {
    const now = new Date("2026-09-05T12:00:00.000Z");

    assert.equal(isBulletinPostActive(samplePost(), now), true);
    assert.equal(
      isBulletinPostActive(
        samplePost({ publishedAt: "2026-09-06T12:00:00.000Z" }),
        now,
      ),
      false,
    );
    assert.equal(
      isBulletinPostActive(
        samplePost({ expiresAt: "2026-09-05T11:00:00.000Z" }),
        now,
      ),
      false,
    );
    assert.equal(isBulletinPostActive(samplePost({ status: "draft" }), now), false);
  });

  it("filters parent main portal posts", () => {
    const posts = [
      samplePost({ id: "school-wide", audiences: ["school_wide"] }),
      samplePost({ id: "parents-all", audiences: ["parents"] }),
      samplePost({
        id: "parents-program",
        audiences: ["parents"],
        programIds: ["program-a"],
      }),
      samplePost({ id: "teachers", audiences: ["teachers"] }),
      samplePost({
        id: "program-only",
        audiences: ["program"],
        programIds: ["program-a"],
      }),
    ];

    const visible = filterBulletinPostsForViewer(
      posts,
      parentMainPortalBulletinScope(),
    ).map((post) => post.id);

    assert.deepEqual(visible, ["school-wide", "parents-all"]);
  });

  it("filters parent program portal posts", () => {
    const posts = [
      samplePost({ id: "school-wide", audiences: ["school_wide"] }),
      samplePost({ id: "parents-all", audiences: ["parents"] }),
      samplePost({
        id: "parents-program-a",
        audiences: ["parents"],
        programIds: ["program-a"],
      }),
      samplePost({
        id: "parents-program-b",
        audiences: ["parents"],
        programIds: ["program-b"],
      }),
      samplePost({
        id: "program-a",
        audiences: ["program"],
        programIds: ["program-a"],
      }),
      samplePost({
        id: "multi-program",
        audiences: ["parents", "program"],
        programIds: ["program-a", "program-b"],
      }),
    ];

    const visible = filterBulletinPostsForViewer(
      posts,
      parentProgramPortalBulletinScope("program-a"),
    ).map((post) => post.id);

    assert.deepEqual(visible, [
      "school-wide",
      "parents-program-a",
      "program-a",
      "multi-program",
    ]);
  });

  it("filters teacher posts with multi-audience posts", () => {
    assert.equal(
      postVisibleToViewer(samplePost({ audiences: ["school_wide"] }), teacherBulletinScope()),
      true,
    );
    assert.equal(
      postVisibleToViewer(samplePost({ audiences: ["teachers"] }), teacherBulletinScope()),
      true,
    );
    assert.equal(
      postVisibleToViewer(
        samplePost({ audiences: ["parents", "teachers"] }),
        teacherBulletinScope(),
      ),
      true,
    );
    assert.equal(
      postVisibleToViewer(samplePost({ audiences: ["parents"] }), teacherBulletinScope()),
      false,
    );
  });

  it("formats audience labels for multi-select audiences and programs", () => {
    const programNames = new Map([["program-a", "Kindergarten Co-op"]]);

    assert.match(
      formatBulletinAudiencesLabel(["school_wide", "teachers"], programNames),
      /School-wide · Teachers only/,
    );
    assert.equal(
      formatBulletinAudiencesLabel(["parents"], programNames, ["program-a"]),
      "Kindergarten Co-op families",
    );
    assert.equal(
      formatBulletinAudiencesLabel(["parents", "teachers"], programNames),
      "All families · Teachers only",
    );
  });

  it("resolves display status", () => {
    const now = new Date("2026-09-05T12:00:00.000Z");

    assert.equal(resolveBulletinDisplayStatus(samplePost(), now), "active");
    assert.equal(
      resolveBulletinDisplayStatus(
        samplePost({ publishedAt: "2026-09-06T12:00:00.000Z" }),
        now,
      ),
      "scheduled",
    );
    assert.equal(
      resolveBulletinDisplayStatus(samplePost({ status: "archived" }), now),
      "archived",
    );
  });
});
