import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BULLETIN_VIEWER_SCAN_CAP,
  listActiveBulletinPostsForViewer,
  mapBulletinRowsToPostsWithoutAttachments,
} from "./posts-home";
import { parentMainPortalBulletinScope } from "./bulletin-audience";
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
              data: rows.slice(from, to + 1),
              error: null,
            });
          },
        };
        return builder;
      },
    } as unknown as SupabaseClient;

    const posts = await listActiveBulletinPostsForViewer(
      supabase,
      "org-1",
      parentMainPortalBulletinScope(),
      3,
    );

    assert.equal(posts.length, 3);
    assert.ok(rangeCalls >= 1);
    assert.ok(rangeCalls * 25 <= BULLETIN_VIEWER_SCAN_CAP + 25);
  });
});
