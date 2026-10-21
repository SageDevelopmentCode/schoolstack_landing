import {
  MAX_POST_SUBMIT_STEP_FILES,
  POST_SUBMIT_STEP_FILE_MAX_BYTES,
  normalizePostSubmitStepCompletionNotes,
} from "./post-submit-step-documentation";

export type ParsedPostSubmitCompleteRequest = {
  actionId: string;
  notes: string | null;
  attachmentFiles: File[];
};

export async function parsePostSubmitCompleteRequest(
  request: Request,
): Promise<ParsedPostSubmitCompleteRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const actionId = String(formData.get("actionId") ?? "").trim();
    const notesRaw = formData.get("notes");
    let notes: string | null = null;
    if (notesRaw !== null && notesRaw !== undefined) {
      try {
        notes = normalizePostSubmitStepCompletionNotes(String(notesRaw));
      } catch (error) {
        throw new PostSubmitCompleteRequestError(
          error instanceof Error ? error.message : "Invalid notes.",
          "notes_too_long",
        );
      }
    }
    const attachmentFiles = formData
      .getAll("attachments")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    return { actionId, notes, attachmentFiles };
  }

  let body: { actionId?: string; notes?: string };
  try {
    body = (await request.json()) as { actionId?: string; notes?: string };
  } catch {
    throw new PostSubmitCompleteRequestError(
      "Invalid request body.",
      "invalid_request",
    );
  }

  const actionId = body.actionId?.trim() ?? "";
  let notes: string | null = null;
  if (body.notes !== undefined) {
    try {
      notes = normalizePostSubmitStepCompletionNotes(body.notes);
    } catch (error) {
      throw new PostSubmitCompleteRequestError(
        error instanceof Error ? error.message : "Invalid notes.",
        "notes_too_long",
      );
    }
  }

  return { actionId, notes, attachmentFiles: [] };
}

export class PostSubmitCompleteRequestError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "PostSubmitCompleteRequestError";
    this.code = code;
  }
}

export function validatePostSubmitCompleteAttachments(files: File[]): void {
  if (files.length > MAX_POST_SUBMIT_STEP_FILES) {
    throw new PostSubmitCompleteRequestError(
      `You can attach up to ${MAX_POST_SUBMIT_STEP_FILES} files.`,
      "too_many_files",
    );
  }

  for (const file of files) {
    if (file.size > POST_SUBMIT_STEP_FILE_MAX_BYTES) {
      throw new PostSubmitCompleteRequestError(
        `${file.name} exceeds the ${Math.round(POST_SUBMIT_STEP_FILE_MAX_BYTES / (1024 * 1024))} MB limit.`,
        "file_too_large",
      );
    }
  }
}
