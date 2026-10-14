"use server";

import { cookies } from "next/headers";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import {
  getApplicationForm,
  isApplyFormVersion,
} from "@/lib/admissions/application-forms";
import { ensureApplySystemSchema } from "@/lib/admissions/apply-system-fields";
import { createClient } from "@/utils/supabase/server";

export async function loadFullPublishedApplyForm(
  organizationId: string,
  formVersionId: string,
): Promise<ApplicationFormVersion | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const form = await getApplicationForm(supabase, formVersionId);
  if (
    !form ||
    form.organization_id !== organizationId ||
    form.status !== "published"
  ) {
    return null;
  }
  if (!isApplyFormVersion(form)) {
    return form;
  }
  return { ...form, schema: ensureApplySystemSchema(form.schema) };
}
