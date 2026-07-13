import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applicationOwnershipFilter,
  getFamilyIdsForUser,
} from "./application-auth";

const PROGRESS_KEY = "__progress";

export type ApplicationDraft = {
  id: string;
  responses: Record<string, string>;
  acknowledgments: Record<string, boolean>;
  stepIndex: number;
  status: string;
  feeStatus: string;
};

export type SaveApplicationDraftInput = {
  responses: Record<string, string>;
  acknowledgments: Record<string, boolean>;
  stepIndex: number;
};

export class ApplicationDraftError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ApplicationDraftError";
    this.code = code;
  }
}

function parseRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function parseStringRecord(value: unknown): Record<string, string> {
  const record = parseRecord(value);
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(record)) {
    if (key === PROGRESS_KEY) continue;
    if (typeof entry === "string") {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

function parseBooleanRecord(value: unknown): Record<string, boolean> {
  const record = parseRecord(value);
  const result: Record<string, boolean> = {};
  for (const [key, entry] of Object.entries(record)) {
    result[key] = Boolean(entry);
  }
  return result;
}

function parseStepIndex(responses: unknown): number {
  const record = parseRecord(responses);
  const progress = parseRecord(record[PROGRESS_KEY]);
  const stepIndex = progress.stepIndex;
  if (typeof stepIndex !== "number" || !Number.isFinite(stepIndex) || stepIndex < 0) {
    return 0;
  }
  return Math.floor(stepIndex);
}

function buildResponsesPayload(
  responses: Record<string, string>,
  stepIndex: number,
): Record<string, unknown> {
  return {
    ...responses,
    [PROGRESS_KEY]: { stepIndex },
  };
}

export async function loadApplicationDraft(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<ApplicationDraft> {
  const { data, error } = await supabase
    .from("applications")
    .select("id, status, fee_status, responses, acknowledgments")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw new ApplicationDraftError(error.message, "load_failed");
  }

  if (!data) {
    throw new ApplicationDraftError(
      "Your application could not be found.",
      "not_found",
    );
  }

  if (data.status !== "draft") {
    throw new ApplicationDraftError(
      "This application has already been submitted and can no longer be edited here.",
      "not_draft",
    );
  }

  return {
    id: String(data.id),
    status: String(data.status),
    feeStatus: String(data.fee_status),
    responses: parseStringRecord(data.responses),
    acknowledgments: parseBooleanRecord(data.acknowledgments),
    stepIndex: parseStepIndex(data.responses),
  };
}

export async function saveApplicationDraft(
  supabase: SupabaseClient,
  applicationId: string,
  input: SaveApplicationDraftInput,
): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .update({
      responses: buildResponsesPayload(input.responses, input.stepIndex),
      acknowledgments: input.acknowledgments,
    })
    .eq("id", applicationId)
    .eq("status", "draft");

  if (error) {
    throw new ApplicationDraftError(error.message, "save_failed");
  }
}

export async function familyHasOtherApplications(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  excludeApplicationId: string,
): Promise<boolean> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);

  const { count, error } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .neq("id", excludeApplicationId)
    .or(applicationOwnershipFilter(userId, familyIds));

  if (error) {
    throw new ApplicationDraftError(error.message, "load_failed");
  }

  return (count ?? 0) > 0;
}
