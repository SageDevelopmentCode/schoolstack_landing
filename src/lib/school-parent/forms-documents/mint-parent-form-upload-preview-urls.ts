import type { SupabaseClient } from "@supabase/supabase-js";
import { getParentFormUploadStoragePath } from "@/lib/school-parent/forms-documents/mutations";
import { createTeacherFormSignedUrl } from "@/lib/school-teacher/forms-documents/teacher-form-file-storage";
import type { ParentFormListItem } from "./types";

export async function mintParentFormUploadPreviewUrls(
  admin: SupabaseClient,
  organizationId: string,
  items: ParentFormListItem[],
): Promise<Record<string, string>> {
  const uploadPdfItems = items.filter(
    (item) =>
      item.form.formType === "upload" && item.form.uploadFormat === "pdf",
  );

  const entries = await Promise.all(
    uploadPdfItems.map(async (item) => {
      try {
        const { storagePath } = await getParentFormUploadStoragePath(
          admin,
          organizationId,
          item.form.id,
        );
        const signedUrl = await createTeacherFormSignedUrl(admin, storagePath);
        return [item.form.id, signedUrl] as const;
      } catch {
        return null;
      }
    }),
  );

  return Object.fromEntries(
    entries.filter((entry): entry is readonly [string, string] => entry != null),
  );
}
