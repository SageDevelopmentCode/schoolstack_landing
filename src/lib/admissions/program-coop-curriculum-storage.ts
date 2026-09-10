import type { SupabaseClient } from "@supabase/supabase-js";
import { logProgramCoopCurriculumUpdated } from "./program-coop-activity";

export const PROGRAM_COOP_CURRICULUM_BUCKET = "program-coop-curriculum-files";

export const PROGRAM_COOP_CURRICULUM_MAX_BYTES = 100 * 1024 * 1024;
export const PROGRAM_COOP_CURRICULUM_MAX_FILES = 5;
export const PROGRAM_COOP_CURRICULUM_SIGNED_URL_TTL_SECONDS = 60 * 60;
export const PROGRAM_COOP_CURRICULUM_PDF_ACCEPT = ".pdf,application/pdf";

export type ProgramCoopCurriculumUploadContext = {
  organizationId: string;
  programId: string;
};

export type ProgramCoopCurriculumRecord = {
  id: string;
  programId: string;
  organizationId: string;
  storagePath: string;
  fileName: string;
  fileSizeBytes: number | null;
  uploadedBy: string | null;
  sortOrder: number;
  displayName: string | null;
  updatedAt: string;
};

type ProgramCoopCurriculumRow = {
  id: string;
  program_id: string;
  organization_id: string;
  storage_path: string;
  file_name: string;
  file_size_bytes: number | null;
  uploaded_by: string | null;
  sort_order: number;
  display_name: string | null;
  updated_at: string;
};

const PROGRAM_COOP_CURRICULUM_SELECT =
  "id, program_id, organization_id, storage_path, file_name, file_size_bytes, uploaded_by, sort_order, display_name, updated_at";

function mapProgramCoopCurriculumRow(
  row: ProgramCoopCurriculumRow,
): ProgramCoopCurriculumRecord {
  return {
    id: row.id,
    programId: row.program_id,
    organizationId: row.organization_id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes,
    uploadedBy: row.uploaded_by,
    sortOrder: row.sort_order,
    displayName: row.display_name,
    updatedAt: row.updated_at,
  };
}

export function getProgramCoopCurriculumTabLabel(
  record: Pick<ProgramCoopCurriculumRecord, "displayName" | "fileName">,
): string {
  const displayName = record.displayName?.trim();
  if (displayName) return displayName;
  return record.fileName;
}

export function buildProgramCoopCurriculumStoragePath(
  organizationId: string,
  programId: string,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/programs/${programId}/${fileId}_${safeName}`;
}

export function validateProgramCoopCurriculumFile(file: File): string | null {
  if (file.size > PROGRAM_COOP_CURRICULUM_MAX_BYTES) {
    return "File must be 100 MB or smaller.";
  }

  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return null;
  }

  return "Please upload a PDF file.";
}

function errorMessageFromUnknown(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "";
}

export function formatProgramCoopCurriculumUploadError(
  err: unknown,
  fallback = "Failed to upload curriculum.",
): string {
  const message = errorMessageFromUnknown(err);

  if (
    /maximum allowed size|entitytoolarge|payload too large|\b413\b/i.test(message)
  ) {
    return "This file exceeds your Supabase Storage limit. In Supabase Dashboard → Storage → Settings, set Global file size limit to at least 100 MB (Pro plan required). Or use a smaller PDF.";
  }

  return message || fallback;
}

export async function uploadProgramCoopCurriculumFile(
  supabase: SupabaseClient,
  ctx: ProgramCoopCurriculumUploadContext,
  file: File,
): Promise<{ storagePath: string; fileName: string; fileSizeBytes: number }> {
  const validationError = validateProgramCoopCurriculumFile(file);
  if (validationError) throw new Error(validationError);

  const fileId = crypto.randomUUID();
  const storagePath = buildProgramCoopCurriculumStoragePath(
    ctx.organizationId,
    ctx.programId,
    file.name,
    fileId,
  );

  const { error: uploadError } = await supabase.storage
    .from(PROGRAM_COOP_CURRICULUM_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  return {
    storagePath,
    fileName: file.name,
    fileSizeBytes: file.size,
  };
}

export async function deleteProgramCoopCurriculumFile(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(PROGRAM_COOP_CURRICULUM_BUCKET)
    .remove([storagePath]);

  if (error) throw error;
}

export async function createProgramCoopCurriculumSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(PROGRAM_COOP_CURRICULUM_BUCKET)
    .createSignedUrl(storagePath, PROGRAM_COOP_CURRICULUM_SIGNED_URL_TTL_SECONDS);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Failed to create download link.");
  return data.signedUrl;
}

export async function listProgramCoopCurriculum(
  supabase: SupabaseClient,
  programId: string,
): Promise<ProgramCoopCurriculumRecord[]> {
  const { data, error } = await supabase
    .from("program_coop_curriculum")
    .select(PROGRAM_COOP_CURRICULUM_SELECT)
    .eq("program_id", programId)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ProgramCoopCurriculumRow[]).map(mapProgramCoopCurriculumRow);
}

export async function getProgramCoopCurriculumById(
  supabase: SupabaseClient,
  curriculumId: string,
): Promise<ProgramCoopCurriculumRecord | null> {
  const { data, error } = await supabase
    .from("program_coop_curriculum")
    .select(PROGRAM_COOP_CURRICULUM_SELECT)
    .eq("id", curriculumId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapProgramCoopCurriculumRow(data as ProgramCoopCurriculumRow);
}

async function nextProgramCoopCurriculumSortOrder(
  supabase: SupabaseClient,
  programId: string,
): Promise<number> {
  const existing = await listProgramCoopCurriculum(supabase, programId);
  if (existing.length === 0) return 0;
  return Math.max(...existing.map((record) => record.sortOrder)) + 1;
}

export async function insertProgramCoopCurriculumRecord(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    programId: string;
    storagePath: string;
    fileName: string;
    fileSizeBytes: number;
    uploadedBy?: string | null;
    displayName?: string | null;
  },
): Promise<ProgramCoopCurriculumRecord> {
  const existing = await listProgramCoopCurriculum(supabase, input.programId);
  if (existing.length >= PROGRAM_COOP_CURRICULUM_MAX_FILES) {
    throw new Error(`You can upload up to ${PROGRAM_COOP_CURRICULUM_MAX_FILES} curriculum guides.`);
  }

  const sortOrder = await nextProgramCoopCurriculumSortOrder(supabase, input.programId);

  const { data, error } = await supabase
    .from("program_coop_curriculum")
    .insert({
      program_id: input.programId,
      organization_id: input.organizationId,
      storage_path: input.storagePath,
      file_name: input.fileName,
      file_size_bytes: input.fileSizeBytes,
      uploaded_by: input.uploadedBy ?? null,
      sort_order: sortOrder,
      display_name: input.displayName?.trim() || null,
    })
    .select(PROGRAM_COOP_CURRICULUM_SELECT)
    .single();

  if (error) throw error;
  const record = mapProgramCoopCurriculumRow(data as ProgramCoopCurriculumRow);

  void logProgramCoopCurriculumUpdated(supabase, {
    organizationId: input.organizationId,
    programId: input.programId,
    curriculumId: record.id,
    fileName: getProgramCoopCurriculumTabLabel(record),
    actorUserId: input.uploadedBy ?? null,
  });

  return record;
}

export async function updateProgramCoopCurriculumDisplayName(
  supabase: SupabaseClient,
  curriculumId: string,
  displayName: string | null,
): Promise<ProgramCoopCurriculumRecord> {
  const trimmed = displayName?.trim() ?? "";

  const { data, error } = await supabase
    .from("program_coop_curriculum")
    .update({ display_name: trimmed || null })
    .eq("id", curriculumId)
    .select(PROGRAM_COOP_CURRICULUM_SELECT)
    .single();

  if (error) throw error;
  const record = mapProgramCoopCurriculumRow(data as ProgramCoopCurriculumRow);

  void logProgramCoopCurriculumUpdated(supabase, {
    organizationId: record.organizationId,
    programId: record.programId,
    curriculumId: record.id,
    fileName: getProgramCoopCurriculumTabLabel(record),
  });

  return record;
}

export async function removeProgramCoopCurriculumById(
  supabase: SupabaseClient,
  curriculumId: string,
): Promise<void> {
  const existing = await getProgramCoopCurriculumById(supabase, curriculumId);
  if (!existing) return;

  const { error } = await supabase
    .from("program_coop_curriculum")
    .delete()
    .eq("id", curriculumId);

  if (error) throw error;

  try {
    await deleteProgramCoopCurriculumFile(supabase, existing.storagePath);
  } catch {
    // Row is already removed; storage cleanup is best-effort.
  }
}

/** @deprecated Use listProgramCoopCurriculum or getProgramCoopCurriculumById */
export async function getProgramCoopCurriculum(
  supabase: SupabaseClient,
  programId: string,
): Promise<ProgramCoopCurriculumRecord | null> {
  const records = await listProgramCoopCurriculum(supabase, programId);
  return records[0] ?? null;
}

/** @deprecated Use insertProgramCoopCurriculumRecord */
export async function upsertProgramCoopCurriculumRecord(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    programId: string;
    storagePath: string;
    fileName: string;
    fileSizeBytes: number;
    uploadedBy?: string | null;
  },
): Promise<ProgramCoopCurriculumRecord> {
  const existing = await listProgramCoopCurriculum(supabase, input.programId);
  if (existing.length >= PROGRAM_COOP_CURRICULUM_MAX_FILES) {
    throw new Error(`You can upload up to ${PROGRAM_COOP_CURRICULUM_MAX_FILES} curriculum guides.`);
  }
  return insertProgramCoopCurriculumRecord(supabase, input);
}

/** @deprecated Use removeProgramCoopCurriculumById */
export async function removeProgramCoopCurriculum(
  supabase: SupabaseClient,
  programId: string,
): Promise<void> {
  const existing = await listProgramCoopCurriculum(supabase, programId);
  for (const record of existing) {
    await removeProgramCoopCurriculumById(supabase, record.id);
  }
}
