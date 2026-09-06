import type { SupabaseClient } from "@supabase/supabase-js";

export const PROGRAM_COOP_CURRICULUM_BUCKET = "program-coop-curriculum-files";

export const PROGRAM_COOP_CURRICULUM_MAX_BYTES = 100 * 1024 * 1024;
export const PROGRAM_COOP_CURRICULUM_SIGNED_URL_TTL_SECONDS = 60 * 60;
export const PROGRAM_COOP_CURRICULUM_PDF_ACCEPT = ".pdf,application/pdf";

export type ProgramCoopCurriculumUploadContext = {
  organizationId: string;
  programId: string;
};

export type ProgramCoopCurriculumRecord = {
  programId: string;
  organizationId: string;
  storagePath: string;
  fileName: string;
  fileSizeBytes: number | null;
  uploadedBy: string | null;
  updatedAt: string;
};

type ProgramCoopCurriculumRow = {
  program_id: string;
  organization_id: string;
  storage_path: string;
  file_name: string;
  file_size_bytes: number | null;
  uploaded_by: string | null;
  updated_at: string;
};

function mapProgramCoopCurriculumRow(
  row: ProgramCoopCurriculumRow,
): ProgramCoopCurriculumRecord {
  return {
    programId: row.program_id,
    organizationId: row.organization_id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes,
    uploadedBy: row.uploaded_by,
    updatedAt: row.updated_at,
  };
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

export async function getProgramCoopCurriculum(
  supabase: SupabaseClient,
  programId: string,
): Promise<ProgramCoopCurriculumRecord | null> {
  const { data, error } = await supabase
    .from("program_coop_curriculum")
    .select(
      "program_id, organization_id, storage_path, file_name, file_size_bytes, uploaded_by, updated_at",
    )
    .eq("program_id", programId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapProgramCoopCurriculumRow(data as ProgramCoopCurriculumRow);
}

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
  const existing = await getProgramCoopCurriculum(supabase, input.programId);

  if (existing && existing.storagePath !== input.storagePath) {
    try {
      await deleteProgramCoopCurriculumFile(supabase, existing.storagePath);
    } catch {
      // Best-effort cleanup when replacing an upload.
    }
  }

  const { data, error } = await supabase
    .from("program_coop_curriculum")
    .upsert(
      {
        program_id: input.programId,
        organization_id: input.organizationId,
        storage_path: input.storagePath,
        file_name: input.fileName,
        file_size_bytes: input.fileSizeBytes,
        uploaded_by: input.uploadedBy ?? null,
      },
      { onConflict: "program_id" },
    )
    .select(
      "program_id, organization_id, storage_path, file_name, file_size_bytes, uploaded_by, updated_at",
    )
    .single();

  if (error) throw error;
  return mapProgramCoopCurriculumRow(data as ProgramCoopCurriculumRow);
}

export async function removeProgramCoopCurriculum(
  supabase: SupabaseClient,
  programId: string,
): Promise<void> {
  const existing = await getProgramCoopCurriculum(supabase, programId);
  if (!existing) return;

  const { error } = await supabase
    .from("program_coop_curriculum")
    .delete()
    .eq("program_id", programId);

  if (error) throw error;

  try {
    await deleteProgramCoopCurriculumFile(supabase, existing.storagePath);
  } catch {
    // Row is already removed; storage cleanup is best-effort.
  }
}
