"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { APPLY_FORM_PUBLIC_SLUG } from "@/lib/admissions/application-forms";
import type { ApplicationFormKind } from "@/lib/admissions/application-form-schema";
import { normalizePublicSlug } from "@/lib/admissions/application-form-schema";
import { publishedApplyEntryTag } from "@/lib/admissions/public-apply-cache";
import { userCanAccessSchoolAdmin } from "@/lib/school-admin/access";
import { createClient } from "@/utils/supabase/server";

export async function revalidatePublishedApplyEntryCache(input: {
  organizationId: string;
  publicSlug: string | null;
  previousPublicSlug?: string | null;
  formKind: ApplicationFormKind;
}): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const allowed = await userCanAccessSchoolAdmin(
    supabase,
    user.id,
    input.organizationId,
  );
  if (!allowed) return;

  const tags = new Set<string>();
  const addSlug = (slug: string | null | undefined) => {
    const normalized = slug ? normalizePublicSlug(slug) : "";
    if (!normalized) return;
    tags.add(publishedApplyEntryTag(input.organizationId, normalized));
  };

  addSlug(input.publicSlug);
  addSlug(input.previousPublicSlug);
  if (input.formKind === "apply") {
    addSlug(APPLY_FORM_PUBLIC_SLUG);
  }

  for (const tag of tags) {
    updateTag(tag);
  }
}
