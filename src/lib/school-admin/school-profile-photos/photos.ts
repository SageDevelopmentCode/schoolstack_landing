import type { SupabaseClient } from "@supabase/supabase-js";
import { MAX_SCHOOL_PROFILE_PHOTOS } from "./constants";
import {
  prepareSchoolProfilePhotoForUpload,
  removeSchoolProfilePhotoFile,
  uploadPreparedSchoolProfilePhotoFile,
  uploadSchoolProfilePhotoFile,
  validateSchoolProfilePhotoFile,
  withSchoolProfilePhotoSignedUrl,
} from "./storage";
import type { SchoolProfilePhoto, SchoolProfilePhotoRow } from "./types";

export class SchoolProfilePhotoError extends Error {
  status: number;
  code: string;

  constructor(message: string, code: string, status = 400) {
    super(message);
    this.name = "SchoolProfilePhotoError";
    this.code = code;
    this.status = status;
  }
}

function mapRow(row: SchoolProfilePhotoRow): SchoolProfilePhoto {
  return {
    id: row.id,
    organizationId: row.organization_id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

const PHOTO_SELECT = `
  id,
  organization_id,
  storage_path,
  file_name,
  mime_type,
  size_bytes,
  sort_order,
  uploaded_by,
  created_at,
  updated_at
`;

export async function countSchoolProfilePhotos(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("organization_school_profile_photos")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) throw error;
  return count ?? 0;
}

const MAX_SCHOOL_PROFILE_PHOTOS_MESSAGE = `You can add up to ${MAX_SCHOOL_PROFILE_PHOTOS} school photos. Remove one to add another.`;

export function isSchoolProfilePhotoMaxPhotosError(error: {
  message?: string;
  code?: string;
}): boolean {
  return (
    error.code === "P0001" ||
    (typeof error.message === "string" &&
      error.message.includes("school_profile_photo_max_photos"))
  );
}

function throwIfSchoolProfilePhotoMaxPhotosError(error: unknown): void {
  if (
    error &&
    typeof error === "object" &&
    isSchoolProfilePhotoMaxPhotosError(error as { message?: string; code?: string })
  ) {
    throw new SchoolProfilePhotoError(
      MAX_SCHOOL_PROFILE_PHOTOS_MESSAGE,
      "max_photos",
    );
  }
}

export function assertCanAddSchoolProfilePhotos(
  currentCount: number,
  adding: number,
): void {
  if (adding <= 0) {
    throw new SchoolProfilePhotoError("No files to upload.", "no_files");
  }
  if (currentCount + adding > MAX_SCHOOL_PROFILE_PHOTOS) {
    throw new SchoolProfilePhotoError(
      MAX_SCHOOL_PROFILE_PHOTOS_MESSAGE,
      "max_photos",
    );
  }
}

export async function getNextSchoolProfilePhotoSortOrder(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("organization_school_profile_photos")
    .select("sort_order")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  const current = typeof data?.sort_order === "number" ? data.sort_order : -1;
  return current + 1;
}

export async function listSchoolProfilePhotos(
  supabase: SupabaseClient,
  organizationId: string,
  withSignedUrls = true,
): Promise<SchoolProfilePhoto[]> {
  const { data, error } = await supabase
    .from("organization_school_profile_photos")
    .select(PHOTO_SELECT)
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const photos = ((data ?? []) as SchoolProfilePhotoRow[]).map(mapRow);
  if (!withSignedUrls) return photos;

  return Promise.all(
    photos.map((photo) => withSchoolProfilePhotoSignedUrl(supabase, photo)),
  );
}

async function rollbackSchoolProfilePhotoBatch(
  supabase: SupabaseClient,
  organizationId: string,
  insertedPhotoIds: string[],
  uploadedStoragePaths: string[],
): Promise<void> {
  if (insertedPhotoIds.length > 0) {
    try {
      await supabase
        .from("organization_school_profile_photos")
        .delete()
        .in("id", insertedPhotoIds)
        .eq("organization_id", organizationId);
    } catch {
      // Best-effort rollback.
    }
  }
  for (const storagePath of uploadedStoragePaths) {
    await removeSchoolProfilePhotoFile(supabase, storagePath).catch(
      () => undefined,
    );
  }
}

export async function createSchoolProfilePhotosBatch(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    files: File[];
    uploadedBy: string | null;
    startSortOrder: number;
  },
): Promise<SchoolProfilePhoto[]> {
  for (const file of input.files) {
    try {
      validateSchoolProfilePhotoFile(file);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid photo file.";
      throw new SchoolProfilePhotoError(message, "invalid_file");
    }
  }

  const preparedFiles: { original: File; prepared: File }[] = [];
  for (const file of input.files) {
    preparedFiles.push({
      original: file,
      prepared: await prepareSchoolProfilePhotoForUpload(file),
    });
  }

  const created: SchoolProfilePhoto[] = [];
  const insertedPhotoIds: string[] = [];
  const uploadedStoragePaths: string[] = [];
  let sortOrder = input.startSortOrder;

  try {
    for (const { original, prepared } of preparedFiles) {
      const photoId = crypto.randomUUID();
      const uploaded = await uploadPreparedSchoolProfilePhotoFile(
        supabase,
        input.organizationId,
        photoId,
        prepared,
      );
      uploadedStoragePaths.push(uploaded.storagePath);

      const { data, error } = await supabase
        .from("organization_school_profile_photos")
        .insert({
          id: photoId,
          organization_id: input.organizationId,
          storage_path: uploaded.storagePath,
          file_name: original.name,
          mime_type: uploaded.mimeType,
          size_bytes: uploaded.sizeBytes,
          sort_order: sortOrder,
          uploaded_by: input.uploadedBy,
        })
        .select(PHOTO_SELECT)
        .single();

      if (error) {
        throwIfSchoolProfilePhotoMaxPhotosError(error);
        throw error;
      }

      insertedPhotoIds.push(photoId);
      sortOrder += 1;

      const photo = mapRow(data as SchoolProfilePhotoRow);
      created.push(await withSchoolProfilePhotoSignedUrl(supabase, photo));
    }
  } catch (err) {
    await rollbackSchoolProfilePhotoBatch(
      supabase,
      input.organizationId,
      insertedPhotoIds,
      uploadedStoragePaths,
    );
    throw err;
  }

  return created;
}

export async function createSchoolProfilePhoto(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    file: File;
    uploadedBy: string | null;
    sortOrder?: number;
  },
): Promise<SchoolProfilePhoto> {
  const photoId = crypto.randomUUID();
  const sortOrder =
    input.sortOrder ??
    (await getNextSchoolProfilePhotoSortOrder(supabase, input.organizationId));

  const uploaded = await uploadSchoolProfilePhotoFile(
    supabase,
    input.organizationId,
    photoId,
    input.file,
  );

  const { data, error } = await supabase
    .from("organization_school_profile_photos")
    .insert({
      id: photoId,
      organization_id: input.organizationId,
      storage_path: uploaded.storagePath,
      file_name: input.file.name,
      mime_type: uploaded.mimeType,
      size_bytes: uploaded.sizeBytes,
      sort_order: sortOrder,
      uploaded_by: input.uploadedBy,
    })
    .select(PHOTO_SELECT)
    .single();

  if (error) {
    await removeSchoolProfilePhotoFile(supabase, uploaded.storagePath).catch(
      () => undefined,
    );
    throwIfSchoolProfilePhotoMaxPhotosError(error);
    throw error;
  }

  const photo = mapRow(data as SchoolProfilePhotoRow);
  return withSchoolProfilePhotoSignedUrl(supabase, photo);
}

export async function deleteSchoolProfilePhoto(
  supabase: SupabaseClient,
  organizationId: string,
  photoId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("organization_school_profile_photos")
    .select("storage_path")
    .eq("id", photoId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.storage_path) {
    throw new SchoolProfilePhotoError("Photo not found.", "not_found", 404);
  }

  const storagePath = String(data.storage_path);

  await removeSchoolProfilePhotoFile(supabase, storagePath);

  const { error: deleteRowError } = await supabase
    .from("organization_school_profile_photos")
    .delete()
    .eq("id", photoId)
    .eq("organization_id", organizationId);

  if (deleteRowError) throw deleteRowError;
}
