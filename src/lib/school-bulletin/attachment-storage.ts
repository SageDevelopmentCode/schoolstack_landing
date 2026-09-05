import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload } from "@/lib/images/compress-image";

export const SCHOOL_BULLETIN_FILES_BUCKET = "school-bulletin-files";

export const MAX_BULLETIN_ATTACHMENTS = 5;
export const MAX_BULLETIN_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const BULLETIN_IMAGE_COMPRESS_OPTIONS = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85,
  skipBelowBytes: 300 * 1024,
} as const;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type BulletinAttachmentMeta = {
  id: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

export function buildBulletinAttachmentStoragePath(
  organizationId: string,
  postId: string,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/bulletin-posts/${postId}/${fileId}_${safeName}`;
}

export function validateBulletinAttachmentFile(file: File): void {
  if (file.size > MAX_BULLETIN_ATTACHMENT_BYTES) {
    throw new Error(`"${file.name}" exceeds the 10 MB limit.`);
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`"${file.name}" is not a supported file type.`);
  }
}

export async function prepareBulletinAttachmentForUpload(file: File): Promise<File> {
  if (file.type === "image/jpeg" || file.type === "image/png") {
    return compressImageForUpload(file, BULLETIN_IMAGE_COMPRESS_OPTIONS);
  }
  return file;
}

export async function uploadBulletinAttachment(
  supabase: SupabaseClient,
  organizationId: string,
  postId: string,
  file: File,
): Promise<BulletinAttachmentMeta> {
  validateBulletinAttachmentFile(file);

  const fileId = crypto.randomUUID();
  const storagePath = buildBulletinAttachmentStoragePath(
    organizationId,
    postId,
    file.name,
    fileId,
  );

  const { error: uploadError } = await supabase.storage
    .from(SCHOOL_BULLETIN_FILES_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  return {
    id: fileId,
    fileName: file.name,
    storagePath,
    mimeType: file.type || null,
    sizeBytes: file.size,
  };
}

export async function insertBulletinAttachments(
  admin: SupabaseClient,
  organizationId: string,
  postId: string,
  attachments: BulletinAttachmentMeta[],
): Promise<void> {
  if (attachments.length === 0) return;

  const rows = attachments.map((attachment) => ({
    post_id: postId,
    organization_id: organizationId,
    file_name: attachment.fileName,
    storage_path: attachment.storagePath,
    mime_type: attachment.mimeType,
    size_bytes: attachment.sizeBytes,
  }));

  const { error } = await admin.from("school_bulletin_attachments").insert(rows);
  if (error) throw new Error(error.message);
}

export async function deleteBulletinAttachmentFiles(
  supabase: SupabaseClient,
  storagePaths: string[],
): Promise<void> {
  if (storagePaths.length === 0) return;
  const { error } = await supabase.storage
    .from(SCHOOL_BULLETIN_FILES_BUCKET)
    .remove(storagePaths);
  if (error) throw error;
}

export async function getBulletinAttachmentSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn = 60 * 60,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(SCHOOL_BULLETIN_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error("Failed to create a download link for this file.");
  }
  return data.signedUrl;
}

export async function attachSignedUrlsToBulletinPosts(
  supabase: SupabaseClient,
  posts: import("./types").BulletinPost[],
): Promise<import("./types").BulletinPost[]> {
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
