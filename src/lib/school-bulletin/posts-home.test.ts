import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listActiveBulletinPostsForViewer,
  mapBulletinRowsToPostsWithoutAttachments,
} from "./posts-home";
import {
  parentMainPortalBulletinScope,
  postVisibleToViewer,
  type BulletinViewerScope,
} from "./bulletin-audience";
import type { BulletinPostRow } from "./mappers";

function buildRow(overrides: Partial<BulletinPostRow> & { id: string }): BulletinPostRow {
  return {
    id: overrides.id,
    organization_id: overrides.organization_id ?? "org-1",
    title: overrides.title ?? "Title",
    body: overrides.body ?? "Body",
    status: overrides.status ?? "published",
    audiences: overrides.audiences ?? ["parents"],
    program_ids: overrides.program_ids ?? [],
    published_at: overrides.published_at ?? "2026-01-01T12:00:00.000Z",
    expires_at: overrides.expires_at ?? null,
    created_by: overrides.created_by ?? "user-1",
    created_at: overrides.created_at ?? "2026-01-01T12:00:00.000Z",
    updated_at: overrides.updated_at ?? "2026-01-01T12:00:00.000Z",
  };
}

function filterRowsForViewerScope(
  rows: BulletinPostRow[],
  scope: BulletinViewerScope,
): BulletinPostRow[] {
  return rows.filter((row) =>
    postVisibleToViewer(
      {
        audiences: row.audiences ?? [],
        programIds: row.program_ids ?? [],
      },
      scope,
    ),
  );
}

function createMockSupabaseForBulletinPosts(
  rows: BulletinPostRow[],
  scope: BulletinViewerScope,
): { supabase: SupabaseClient; getRangeCalls: () => number } {
  const audienceFiltered = filterRowsForViewerScope(rows, scope);
  let rangeCalls = 0;

  const supabase = {
    from(table: string) {
      if (table === "school_bulletin_attachments") {
        return {
          select() {
            return this;
          },
          in() {
            return this;
          },
          order() {
            return Promise.resolve({ data: [], error: null });
          },
        };
      }

      assert.equal(table, "school_bulletin_posts");
      const builder = {
        select() {
          return builder;
        },
        eq() {
          return builder;
        },
        or() {
          return builder;
        },
        order() {
          return builder;
        },
        range(from: number, to: number) {
          rangeCalls += 1;
          return Promise.resolve({
            data: audienceFiltered.slice(from, to + 1),
            error: null,
          });
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient;

  return {
    supabase,
    getRangeCalls: () => rangeCalls,
  };
}

describe("posts-home", () => {
  it("mapBulletinRowsToPostsWithoutAttachments maps rows without attachments", () => {
    const posts = mapBulletinRowsToPostsWithoutAttachments([
      buildRow({ id: "post-1", title: "Hello" }),
    ]);

    assert.equal(posts.length, 1);
    assert.equal(posts[0]?.title, "Hello");
    assert.deepEqual(posts[0]?.attachments, []);
  });

  it("listActiveBulletinPostsForViewer stops after filling the viewer limit", async () => {
    const rows: BulletinPostRow[] = Array.from({ length: 30 }, (_, index) =>
      buildRow({
        id: `post-${index}`,
        title: `Post ${index}`,
        published_at: new Date(Date.UTC(2026, 0, 30 - index)).toISOString(),
      }),
    );

    const scope = parentMainPortalBulletinScope();
    const { supabase, getRangeCalls } = createMockSupabaseForBulletinPosts(rows, scope);

    const posts = await listActiveBulletinPostsForViewer(supabase, "org-1", scope, 3);

    assert.equal(posts.length, 3);
    assert.equal(getRangeCalls(), 1);
  });

  it("listActiveBulletinPostsForViewer finds older parent-visible posts after many teacher-only rows", async () => {
    const teacherRows: BulletinPostRow[] = Array.from({ length: 100 }, (_, index) =>
      buildRow({
        id: `teacher-${index}`,
        audiences: ["teachers"],
        title: `Teacher ${index}`,
        published_at: new Date(Date.UTC(2026, 0, 100 - index)).toISOString(),
      }),
    );
    const parentRows: BulletinPostRow[] = Array.from({ length: 3 }, (_, index) =>
      buildRow({
        id: `school-wide-${index}`,
        audiences: ["school_wide"],
        title: `School wide ${index}`,
        published_at: new Date(Date.UTC(2025, 11, 3 - index)).toISOString(),
      }),
    );
    const rows = [...teacherRows, ...parentRows];
    const scope = parentMainPortalBulletinScope();
    const { supabase, getRangeCalls } = createMockSupabaseForBulletinPosts(rows, scope);

    const posts = await listActiveBulletinPostsForViewer(supabase, "org-1", scope, 3);

    assert.equal(posts.length, 3);
    assert.deepEqual(
      posts.map((post) => post.id),
      ["school-wide-0", "school-wide-1", "school-wide-2"],
    );
    assert.equal(getRangeCalls(), 1);
  });
});
