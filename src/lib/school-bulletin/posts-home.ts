import type { SupabaseClient } from "@supabase/supabase-js";
import { attachSignedUrlsToBulletinPosts } from "./attachment-storage";
import {
  applyBulletinViewerAudienceFilters,
  filterBulletinPostsForViewer,
  parentMainPortalBulletinScope,
  parentProgramPortalBulletinScope,
  teacherBulletinScope,
  type BulletinViewerScope,
} from "./bulletin-audience";
import {
  mapBulletinAttachmentRow,
  mapBulletinPostRow,
  type BulletinAttachmentRow,
  type BulletinPostRow,
} from "./mappers";
import type { BulletinPost } from "./types";
import { BulletinError } from "./bulletin-errors";

const POST_SELECT = `
  id,
  organization_id,
  title,
  body,
  status,
  audiences,
  program_ids,
  published_at,
  expires_at,
  created_by,
  created_at,
  updated_at
`;

/** Legacy export: home feeds paginate until the limit is met or posts are exhausted. */
export const BULLETIN_VIEWER_SCAN_CAP = 100;
const BULLETIN_PAGE_SIZE = 25;

async function loadAttachmentsByPostIds(
  supabase: SupabaseClient,
  postIds: string[],
): Promise<Map<string, ReturnType<typeof mapBulletinAttachmentRow>[]>> {
  const map = new Map<string, ReturnType<typeof mapBulletinAttachmentRow>[]>();
  if (postIds.length === 0) return map;

  const { data, error } = await supabase
    .from("school_bulletin_attachments")
    .select("*")
    .in("post_id", postIds)
    .order("created_at", { ascending: true });

  if (error) throw new BulletinError(error.message, "load_failed", 500);

  for (const row of (data ?? []) as BulletinAttachmentRow[]) {
    const postId = String(row.post_id);
    const list = map.get(postId) ?? [];
    list.push(mapBulletinAttachmentRow(row));
    map.set(postId, list);
  }

  return map;
}

export function mapBulletinRowsToPostsWithoutAttachments(
  rows: BulletinPostRow[],
): BulletinPost[] {
  return rows.map((row) => mapBulletinPostRow(row, [], []));
}

export async function attachAttachmentsToBulletinPosts(
  supabase: SupabaseClient,
  posts: BulletinPost[],
): Promise<BulletinPost[]> {
  if (posts.length === 0) return [];

  const attachmentsByPostId = await loadAttachmentsByPostIds(
    supabase,
    posts.map((post) => post.id),
  );

  return posts.map((post) => ({
    ...post,
    attachments: attachmentsByPostId.get(post.id) ?? [],
  }));
}

function applyPublishedBulletinTimeFilters<
  T extends {
    or(filter: string): T;
  },
>(query: T, nowIso: string): T {
  return query
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`);
}

async function fetchPublishedBulletinPage(
  supabase: SupabaseClient,
  organizationId: string,
  scope: BulletinViewerScope,
  offset: number,
  pageSize: number,
  now: Date,
): Promise<BulletinPostRow[]> {
  const nowIso = now.toISOString();
  const from = offset;
  const to = offset + pageSize - 1;

  let query = supabase
    .from("school_bulletin_posts")
    .select(POST_SELECT)
    .eq("organization_id", organizationId)
    .eq("status", "published");

  query = applyPublishedBulletinTimeFilters(query, nowIso);
  query = applyBulletinViewerAudienceFilters(query, scope);

  const { data, error } = await query
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new BulletinError(error.message, "load_failed", 500);
  return (data ?? []) as BulletinPostRow[];
}

export async function listActiveBulletinPostsForViewer(
  supabase: SupabaseClient,
  organizationId: string,
  scope: BulletinViewerScope,
  limit = 3,
  options?: { includeSignedUrls?: boolean; signedUrlClient?: SupabaseClient },
): Promise<BulletinPost[]> {
  const now = new Date();
  const accumulated: BulletinPost[] = [];
  let offset = 0;

  while (accumulated.length < limit) {
    const rows = await fetchPublishedBulletinPage(
      supabase,
      organizationId,
      scope,
      offset,
      BULLETIN_PAGE_SIZE,
      now,
    );
    if (rows.length === 0) break;

    offset += rows.length;

    const visible = filterBulletinPostsForViewer(
      mapBulletinRowsToPostsWithoutAttachments(rows),
      scope,
      now,
    );

    for (const post of visible) {
      accumulated.push(post);
      if (accumulated.length >= limit) break;
    }

    if (rows.length < BULLETIN_PAGE_SIZE) break;
  }

  const sliced = accumulated.slice(0, limit);
  const withAttachments = await attachAttachmentsToBulletinPosts(supabase, sliced);

  if (options?.includeSignedUrls && options.signedUrlClient) {
    return attachSignedUrlsToBulletinPosts(options.signedUrlClient, withAttachments);
  }

  return withAttachments;
}

export function resolveBulletinViewerScope(input: {
  viewer: "parent" | "teacher";
  programId?: string;
}): BulletinViewerScope {
  if (input.viewer === "teacher") {
    return teacherBulletinScope();
  }
  if (input.programId) {
    return parentProgramPortalBulletinScope(input.programId);
  }
  return parentMainPortalBulletinScope();
}

export async function loadHomeBulletinPosts(input: {
  supabase: SupabaseClient;
  signedUrlClient: SupabaseClient;
  organizationId: string;
  bulletinEnabled: boolean;
  viewer: "parent" | "teacher";
  programId?: string;
  limit?: number;
}): Promise<BulletinPost[]> {
  if (!input.bulletinEnabled) return [];

  return listActiveBulletinPostsForViewer(
    input.supabase,
    input.organizationId,
    resolveBulletinViewerScope({
      viewer: input.viewer,
      programId: input.programId,
    }),
    input.limit ?? 3,
    {
      includeSignedUrls: true,
      signedUrlClient: input.signedUrlClient,
    },
  );
}
