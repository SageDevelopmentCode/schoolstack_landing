import type { SupabaseClient } from "@supabase/supabase-js";
import {
  attachSignedUrlsToBulletinPosts,
  deleteBulletinAttachmentFiles,
  getBulletinAttachmentSignedUrl,
  MAX_BULLETIN_ATTACHMENTS,
} from "./attachment-storage";
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
  normalizeBulletinAudiences,
  normalizeBulletinProgramIds,
  type BulletinAttachmentRow,
  type BulletinPostRow,
} from "./mappers";
import type {
  BulletinAudience,
  BulletinPost,
  BulletinPostStatus,
  CreateBulletinPostInput,
  ProgramOption,
  UpdateBulletinPostInput,
} from "./types";

export class BulletinError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "BulletinError";
    this.code = code;
    this.status = status;
  }
}

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

async function validateAudiencesPrograms(
  supabase: SupabaseClient,
  organizationId: string,
  audiences: BulletinAudience[],
  programIds: string[],
): Promise<{ audiences: BulletinAudience[]; programIds: string[] }> {
  const normalizedAudiences = normalizeBulletinAudiences(audiences);
  const normalizedProgramIds = normalizeBulletinProgramIds(programIds);

  if (normalizedAudiences.includes("program") && normalizedProgramIds.length === 0) {
    throw new BulletinError(
      "Choose at least one program for program-targeted bulletins.",
      "invalid_program",
      400,
    );
  }

  const schoolWideTeachersOnly = normalizedAudiences.every(
    (audience) => audience === "school_wide" || audience === "teachers",
  );
  if (schoolWideTeachersOnly && normalizedProgramIds.length > 0) {
    throw new BulletinError(
      "Programs can only be set for parent- or program-targeted bulletins.",
      "invalid_program",
      400,
    );
  }

  if (normalizedProgramIds.length > 0) {
    const { data, error } = await supabase
      .from("programs")
      .select("id")
      .eq("organization_id", organizationId)
      .in("id", normalizedProgramIds);

    if (error) throw new BulletinError(error.message, "load_failed", 500);

    const validIds = new Set((data ?? []).map((row) => String(row.id)));
    if (normalizedProgramIds.some((id) => !validIds.has(id))) {
      throw new BulletinError(
        "One or more selected programs are invalid.",
        "invalid_program",
        400,
      );
    }
  }

  return {
    audiences: normalizedAudiences,
    programIds: normalizedProgramIds,
  };
}

function validatePublishableContent(title: string, body: string, attachmentCount: number): void {
  if (!title.trim()) {
    throw new BulletinError("Title is required.", "invalid_title", 400);
  }
  if (!body.trim() && attachmentCount === 0) {
    throw new BulletinError(
      "Add a message or at least one attachment before publishing.",
      "invalid_content",
      400,
    );
  }
}

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

async function loadProgramNameMap(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Map<string, string>> {
  const programs = await listProgramsForBulletinPicker(supabase, organizationId);
  return new Map(programs.map((program) => [program.id, program.name]));
}

function resolveProgramNames(
  programIds: string[],
  programNameById: ReadonlyMap<string, string>,
): string[] {
  return programIds
    .map((programId) => programNameById.get(programId))
    .filter((name): name is string => Boolean(name));
}

async function mapPostsWithAttachments(
  supabase: SupabaseClient,
  rows: BulletinPostRow[],
  programNameById?: ReadonlyMap<string, string>,
): Promise<BulletinPost[]> {
  const attachmentsByPostId = await loadAttachmentsByPostIds(
    supabase,
    rows.map((row) => String(row.id)),
  );

  return rows.map((row) => {
    const programIds = normalizeBulletinProgramIds(row.program_ids);
    const programNames = programNameById
      ? resolveProgramNames(programIds, programNameById)
      : [];

    return mapBulletinPostRow(
      row,
      attachmentsByPostId.get(String(row.id)) ?? [],
      programNames,
    );
  });
}

export async function listProgramsForBulletinPicker(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ProgramOption[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) throw new BulletinError(error.message, "load_failed", 500);

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
  }));
}

export async function listBulletinPostsForAdmin(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<BulletinPost[]> {
  const { data, error } = await supabase
    .from("school_bulletin_posts")
    .select(POST_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw new BulletinError(error.message, "load_failed", 500);

  const programNameById = await loadProgramNameMap(supabase, organizationId);
  const posts = await mapPostsWithAttachments(
    supabase,
    (data ?? []) as BulletinPostRow[],
    programNameById,
  );

  return Promise.all(
    posts.map(async (post) => ({
      ...post,
      attachments: await Promise.all(
        post.attachments.map(async (attachment) => ({
          ...attachment,
          downloadUrl: await getBulletinAttachmentSignedUrl(
            supabase,
            attachment.storagePath,
          ).catch(() => undefined),
        })),
      ),
    })),
  );
}

export async function getBulletinPostForAdmin(
  supabase: SupabaseClient,
  organizationId: string,
  postId: string,
): Promise<BulletinPost | null> {
  const { data, error } = await supabase
    .from("school_bulletin_posts")
    .select(POST_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", postId)
    .maybeSingle();

  if (error) throw new BulletinError(error.message, "load_failed", 500);
  if (!data) return null;

  const programNameById = await loadProgramNameMap(supabase, organizationId);
  const [post] = await mapPostsWithAttachments(
    supabase,
    [data as BulletinPostRow],
    programNameById,
  );
  return {
    ...post,
    attachments: await Promise.all(
      post.attachments.map(async (attachment) => ({
        ...attachment,
        downloadUrl: await getBulletinAttachmentSignedUrl(
          supabase,
          attachment.storagePath,
        ).catch(() => undefined),
      })),
    ),
  };
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

export async function createBulletinPost(
  supabase: SupabaseClient,
  input: CreateBulletinPostInput,
): Promise<BulletinPost> {
  const { audiences, programIds } = await validateAudiencesPrograms(
    supabase,
    input.organizationId,
    input.audiences,
    input.programIds ?? [],
  );

  const status: BulletinPostStatus = input.status ?? "draft";
  if (status === "published") {
    validatePublishableContent(input.title, input.body ?? "", 0);
  }

  const { data, error } = await supabase
    .from("school_bulletin_posts")
    .insert({
      organization_id: input.organizationId,
      title: input.title.trim(),
      body: input.body?.trim() ?? "",
      status,
      audiences,
      program_ids: programIds,
      published_at:
        status === "published"
          ? input.publishedAt ?? new Date().toISOString()
          : input.publishedAt ?? null,
      expires_at: input.expiresAt ?? null,
      created_by: input.createdBy ?? null,
    })
    .select(POST_SELECT)
    .single();

  if (error) throw new BulletinError(error.message, "create_failed", 500);

  const programNameById = await loadProgramNameMap(supabase, input.organizationId);
  const [post] = await mapPostsWithAttachments(
    supabase,
    [data as BulletinPostRow],
    programNameById,
  );
  return post;
}

export async function updateBulletinPost(
  supabase: SupabaseClient,
  input: UpdateBulletinPostInput,
): Promise<BulletinPost> {
  const existing = await getBulletinPostForAdmin(
    supabase,
    input.organizationId,
    input.postId,
  );
  if (!existing) {
    throw new BulletinError("Bulletin post not found.", "not_found", 404);
  }

  const { audiences, programIds } = await validateAudiencesPrograms(
    supabase,
    input.organizationId,
    input.audiences ?? existing.audiences,
    input.programIds ?? existing.programIds,
  );

  const nextStatus = input.status ?? existing.status;
  const nextTitle = input.title?.trim() ?? existing.title;
  const nextBody = input.body !== undefined ? input.body.trim() : existing.body;

  if (nextStatus === "published") {
    validatePublishableContent(nextTitle, nextBody, existing.attachments.length);
  }

  const patch: Record<string, unknown> = {
    title: nextTitle,
    body: nextBody,
    status: nextStatus,
    audiences,
    program_ids: programIds,
  };

  if (input.publishedAt !== undefined) {
    patch.published_at = input.publishedAt;
  } else if (nextStatus === "published" && existing.status !== "published") {
    patch.published_at = new Date().toISOString();
  }

  if (input.expiresAt !== undefined) {
    patch.expires_at = input.expiresAt;
  }

  const { data, error } = await supabase
    .from("school_bulletin_posts")
    .update(patch)
    .eq("organization_id", input.organizationId)
    .eq("id", input.postId)
    .select(POST_SELECT)
    .single();

  if (error) throw new BulletinError(error.message, "update_failed", 500);

  const programNameById = await loadProgramNameMap(supabase, input.organizationId);
  const [post] = await mapPostsWithAttachments(
    supabase,
    [data as BulletinPostRow],
    programNameById,
  );
  return post;
}

export async function deleteBulletinPost(
  supabase: SupabaseClient,
  organizationId: string,
  postId: string,
): Promise<void> {
  const existing = await getBulletinPostForAdmin(supabase, organizationId, postId);
  if (!existing) {
    throw new BulletinError("Bulletin post not found.", "not_found", 404);
  }

  if (existing.attachments.length > 0) {
    await deleteBulletinAttachmentFiles(
      supabase,
      existing.attachments.map((attachment) => attachment.storagePath),
    );
  }

  const { error } = await supabase
    .from("school_bulletin_posts")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", postId);

  if (error) throw new BulletinError(error.message, "delete_failed", 500);
}

export async function deleteBulletinAttachment(
  supabase: SupabaseClient,
  organizationId: string,
  postId: string,
  attachmentId: string,
): Promise<BulletinPost> {
  const { data, error } = await supabase
    .from("school_bulletin_attachments")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("post_id", postId)
    .eq("id", attachmentId)
    .maybeSingle();

  if (error) throw new BulletinError(error.message, "load_failed", 500);
  if (!data) {
    throw new BulletinError("Attachment not found.", "not_found", 404);
  }

  await deleteBulletinAttachmentFiles(supabase, [String(data.storage_path)]);

  const { error: deleteError } = await supabase
    .from("school_bulletin_attachments")
    .delete()
    .eq("id", attachmentId);

  if (deleteError) throw new BulletinError(deleteError.message, "delete_failed", 500);

  const post = await getBulletinPostForAdmin(supabase, organizationId, postId);
  if (!post) {
    throw new BulletinError("Bulletin post not found.", "not_found", 404);
  }
  return post;
}

export async function assertAttachmentCapacity(
  supabase: SupabaseClient,
  organizationId: string,
  postId: string,
  incomingCount: number,
): Promise<void> {
  const post = await getBulletinPostForAdmin(supabase, organizationId, postId);
  if (!post) {
    throw new BulletinError("Bulletin post not found.", "not_found", 404);
  }

  if (post.attachments.length + incomingCount > MAX_BULLETIN_ATTACHMENTS) {
    throw new BulletinError(
      `Each bulletin supports up to ${MAX_BULLETIN_ATTACHMENTS} attachments.`,
      "too_many_attachments",
      400,
    );
  }
}
