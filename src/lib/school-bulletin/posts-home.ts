import type { SupabaseClient } from "@supabase/supabase-js";
import { attachSignedUrlsToBulletinPosts } from "./attachment-storage";
import {
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

async function mapPostsWithAttachments(
  supabase: SupabaseClient,
  rows: BulletinPostRow[],
): Promise<BulletinPost[]> {
  const attachmentsByPostId = await loadAttachmentsByPostIds(
    supabase,
    rows.map((row) => String(row.id)),
  );

  return rows.map((row) =>
    mapBulletinPostRow(
      row,
      attachmentsByPostId.get(String(row.id)) ?? [],
      [],
    ),
  );
}

export async function listActiveBulletinPostsForViewer(
  supabase: SupabaseClient,
  organizationId: string,
  scope: BulletinViewerScope,
  limit = 3,
  options?: { includeSignedUrls?: boolean; signedUrlClient?: SupabaseClient },
): Promise<BulletinPost[]> {
  const { data, error } = await supabase
    .from("school_bulletin_posts")
    .select(POST_SELECT)
    .eq("organization_id", organizationId)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new BulletinError(error.message, "load_failed", 500);

  const posts = await mapPostsWithAttachments(
    supabase,
    (data ?? []) as BulletinPostRow[],
  );
  const filtered = filterBulletinPostsForViewer(posts, scope).slice(0, limit);

  if (options?.includeSignedUrls && options.signedUrlClient) {
    return attachSignedUrlsToBulletinPosts(options.signedUrlClient, filtered);
  }

  return filtered;
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
