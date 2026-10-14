import { cache } from "react";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import {
  getApplicationForm,
  getPublishedApplicationFormBySlug,
  isApplyFormVersion,
  isCanonicalApplyEntrySlug,
  listPublishedApplyFormSummaries,
} from "@/lib/admissions/application-forms";
import { ensureApplySystemSchema } from "@/lib/admissions/apply-system-fields";
import { createClient } from "@/utils/supabase/server";

export type ResolvedApplyEntry =
  | ApplicationFormVersion
  | { kind: "picker"; forms: ApplicationFormVersion[] }
  | null;

export function isApplyProgramPicker(
  entry: NonNullable<ResolvedApplyEntry>,
): entry is { kind: "picker"; forms: ApplicationFormVersion[] } {
  return "kind" in entry && entry.kind === "picker";
}

export async function resolvePublishedApplyEntry(
  supabase: SupabaseClient,
  organizationId: string,
  formSlug: string,
): Promise<ResolvedApplyEntry> {
  if (!isCanonicalApplyEntrySlug(formSlug)) {
    return getPublishedApplicationFormBySlug(supabase, organizationId, formSlug);
  }

  const summaries = await listPublishedApplyFormSummaries(
    supabase,
    organizationId,
  );
  if (summaries.length === 0) {
    return null;
  }
  if (summaries.length === 1) {
    const full = await getApplicationForm(supabase, summaries[0].id);
    if (!full) {
      return null;
    }
    if (!isApplyFormVersion(full)) {
      return full;
    }
    return { ...full, schema: ensureApplySystemSchema(full.schema) };
  }

  return { kind: "picker" as const, forms: summaries };
}

const resolvePublishedApplyEntryForRequest = cache(
  async (organizationId: string, formSlug: string) => {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    return resolvePublishedApplyEntry(supabase, organizationId, formSlug);
  },
);

export async function resolvePublishedApplyEntryCached(
  organizationId: string,
  formSlug: string,
): Promise<ResolvedApplyEntry> {
  return resolvePublishedApplyEntryForRequest(organizationId, formSlug);
}
