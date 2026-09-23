import type { SupabaseClient } from "@supabase/supabase-js";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import { loadParentFormsDocumentsPageBundle } from "./load-parent-forms";
import { resolveParentFormAttentionHref } from "./parent-form-attention-href";

export type ParentFormAttentionItem = {
  formId: string;
  formTitle: string;
  studentNames: string[];
  dueDate: string | null;
  formsHref: string;
};

export async function loadParentFormAttentionItems(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  schoolSlug: string,
  previewBasePath?: string,
): Promise<ParentFormAttentionItem[]> {
  const bundle = await loadParentFormsDocumentsPageBundle(
    admin,
    organizationId,
    familyId,
  );

  const formsBase = previewBasePath
    ? `${previewBasePath}/parent/forms_documents`
    : schoolParentPath(schoolSlug, "forms_documents");
  const billingBase = previewBasePath
    ? `${previewBasePath}/parent/billing`
    : schoolParentPath(schoolSlug, "billing");

  return bundle.items
    .filter((item) => item.listStatus === "needs_action")
    .map((item) => ({
      formId: item.form.id,
      formTitle: item.form.title,
      studentNames: item.response.studentNames,
      dueDate: item.form.dueDate,
      formsHref: resolveParentFormAttentionHref(item, {
        formsBase,
        billingBase,
      }),
    }));
}
