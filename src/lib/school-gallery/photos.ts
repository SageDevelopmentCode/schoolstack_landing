import type { SupabaseClient } from "@supabase/supabase-js";
import { GalleryError } from "./gallery-errors";
import { mapGalleryPhotoRow } from "./mappers";
import {
  attachSignedUrlsToGalleryPhotos,
  parseGalleryPhotoDate,
  removeGalleryPhotoFiles,
  uploadGalleryPhotoFile,
} from "./storage";
import type {
  GalleryUploadActorType,
  GalleryUploadSurface,
} from "./gallery-activity";
import { logGalleryPhotosUploaded } from "./gallery-activity";
import { attachUploaderNamesToGalleryPhotos } from "./resolve-uploader";
import {
  buildGalleryPageMeta,
  GALLERY_PAGE_SIZE,
} from "./gallery-pagination";
import type { GalleryPhoto, GalleryPhotoRow } from "./types";

export type GalleryPhotosPage = {
  photos: GalleryPhoto[];
  hasMore: boolean;
  nextOffset: number;
};

const PHOTO_SELECT = `
  id,
  organization_id,
  photo_date,
  storage_path,
  file_name,
  mime_type,
  size_bytes,
  upload_batch_id,
  uploaded_by,
  created_at,
  updated_at
`;

export async function listGalleryPhotosForOrg(
  supabase: SupabaseClient,
  organizationId: string,
  withSignedUrls = true,
  withUploaderNames = true,
): Promise<GalleryPhoto[]> {
  const { data, error } = await supabase
    .from("school_gallery_photos")
    .select(PHOTO_SELECT)
    .eq("organization_id", organizationId)
    .order("photo_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    throw new GalleryError(error.message, "load_failed", 500);
  }

  let photos = ((data ?? []) as GalleryPhotoRow[]).map(mapGalleryPhotoRow);
  if (withUploaderNames) {
    photos = await attachUploaderNamesToGalleryPhotos(
      supabase,
      organizationId,
      photos,
    );
  }
  if (!withSignedUrls) return photos;
  return attachSignedUrlsToGalleryPhotos(supabase, photos);
}

export async function listGalleryPhotosPage(
  supabase: SupabaseClient,
  organizationId: string,
  options?: {
    limit?: number;
    offset?: number;
    withSignedUrls?: boolean;
    withUploaderNames?: boolean;
  },
): Promise<GalleryPhotosPage> {
  const limit = options?.limit ?? GALLERY_PAGE_SIZE;
  const offset = options?.offset ?? 0;
  const withSignedUrls = options?.withSignedUrls ?? true;
  const withUploaderNames = options?.withUploaderNames ?? true;
  const fetchLimit = limit + 1;

  const { data, error } = await supabase
    .from("school_gallery_photos")
    .select(PHOTO_SELECT)
    .eq("organization_id", organizationId)
    .order("photo_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + fetchLimit - 1);

  if (error) {
    throw new GalleryError(error.message, "load_failed", 500);
  }

  const rows = (data ?? []) as GalleryPhotoRow[];
  const { hasMore, nextOffset } = buildGalleryPageMeta(
    offset,
    limit,
    rows.length,
  );
  const pageRows = rows.slice(0, limit);

  let photos = pageRows.map(mapGalleryPhotoRow);
  if (withUploaderNames) {
    photos = await attachUploaderNamesToGalleryPhotos(
      supabase,
      organizationId,
      photos,
    );
  }
  if (withSignedUrls) {
    photos = await attachSignedUrlsToGalleryPhotos(supabase, photos);
  }

  return { photos, hasMore, nextOffset };
}

export async function getGalleryPhotoForOrg(
  supabase: SupabaseClient,
  organizationId: string,
  photoId: string,
): Promise<GalleryPhoto | null> {
  const { data, error } = await supabase
    .from("school_gallery_photos")
    .select(PHOTO_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", photoId)
    .maybeSingle();

  if (error) {
    throw new GalleryError(error.message, "load_failed", 500);
  }

  if (!data) return null;
  return mapGalleryPhotoRow(data as GalleryPhotoRow);
}

export type CreateGalleryPhotoBatchInput = {
  organizationId: string;
  photoDate: string;
  files: File[];
  uploadedBy: string;
  actorName: string;
  actorType: GalleryUploadActorType;
  surface: GalleryUploadSurface;
  logActivity?: boolean;
};

export async function createGalleryPhotoBatch(
  supabase: SupabaseClient,
  input: CreateGalleryPhotoBatchInput,
): Promise<GalleryPhoto[]> {
  const photoDate = parseGalleryPhotoDate(input.photoDate);

  if (input.files.length === 0) {
    throw new GalleryError(
      "Choose at least one photo to upload.",
      "invalid_request",
      400,
    );
  }

  if (input.files.length > 25) {
    throw new GalleryError(
      "You can upload up to 25 photos at a time.",
      "invalid_request",
      400,
    );
  }

  const uploadBatchId = crypto.randomUUID();
  const created: GalleryPhoto[] = [];

  for (const file of input.files) {
    const photoId = crypto.randomUUID();
    const uploaded = await uploadGalleryPhotoFile(
      supabase,
      input.organizationId,
      photoId,
      file,
    );

    const { data, error } = await supabase
      .from("school_gallery_photos")
      .insert({
        id: photoId,
        organization_id: input.organizationId,
        photo_date: photoDate,
        storage_path: uploaded.storagePath,
        file_name: file.name,
        mime_type: uploaded.mimeType,
        size_bytes: uploaded.sizeBytes,
        upload_batch_id: uploadBatchId,
        uploaded_by: input.uploadedBy,
      })
      .select(PHOTO_SELECT)
      .single();

    if (error) {
      await removeGalleryPhotoFiles(supabase, [uploaded.storagePath]).catch(
        () => undefined,
      );
      throw new GalleryError(error.message, "insert_failed", 500);
    }

    created.push(mapGalleryPhotoRow(data as GalleryPhotoRow));
  }

  if (input.logActivity !== false && created.length > 0) {
    await logGalleryPhotosUploaded(supabase, {
      organizationId: input.organizationId,
      uploadBatchId,
      photoCount: created.length,
      photoDate,
      actorType: input.actorType,
      actorUserId: input.uploadedBy,
      actorName: input.actorName,
      surface: input.surface,
    });
  }

  const withNames = await attachUploaderNamesToGalleryPhotos(
    supabase,
    input.organizationId,
    created,
  );
  return attachSignedUrlsToGalleryPhotos(supabase, withNames);
}

export async function updateGalleryPhotoDate(
  supabase: SupabaseClient,
  organizationId: string,
  photoId: string,
  photoDate: string,
): Promise<GalleryPhoto> {
  const parsedDate = parseGalleryPhotoDate(photoDate);

  const { data, error } = await supabase
    .from("school_gallery_photos")
    .update({ photo_date: parsedDate })
    .eq("id", photoId)
    .eq("organization_id", organizationId)
    .select(PHOTO_SELECT)
    .maybeSingle();

  if (error) {
    throw new GalleryError(error.message, "update_failed", 500);
  }

  if (!data) {
    throw new GalleryError("Photo not found.", "not_found", 404);
  }

  const photo = mapGalleryPhotoRow(data as GalleryPhotoRow);
  const [withUrl] = await attachSignedUrlsToGalleryPhotos(supabase, [photo]);
  return withUrl;
}

export async function deleteGalleryPhoto(
  supabase: SupabaseClient,
  organizationId: string,
  photoId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("school_gallery_photos")
    .select("storage_path")
    .eq("id", photoId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new GalleryError(error.message, "load_failed", 500);
  }

  if (!data) {
    throw new GalleryError("Photo not found.", "not_found", 404);
  }

  const storagePath = String(data.storage_path);

  const { error: deleteRowError } = await supabase
    .from("school_gallery_photos")
    .delete()
    .eq("id", photoId)
    .eq("organization_id", organizationId);

  if (deleteRowError) {
    throw new GalleryError(deleteRowError.message, "delete_failed", 500);
  }

  await removeGalleryPhotoFiles(supabase, [storagePath]);
}
