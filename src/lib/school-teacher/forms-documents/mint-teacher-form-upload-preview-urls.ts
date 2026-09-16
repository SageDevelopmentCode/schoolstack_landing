import type { SupabaseClient } from "@supabase/supabase-js";
import { createTeacherFormSignedUrl } from "@/lib/school-teacher/forms-documents/teacher-form-file-storage";
import type {
  TeacherFormConfig,
  TeacherParentForm,
} from "@/lib/school-teacher/forms-documents/types";

export async function mintTeacherFormUploadPreviewUrls(
  admin: SupabaseClient,
  organizationId: string,
  forms: TeacherParentForm[],
): Promise<Record<string, string>> {
  const uploadPdfForms = forms.filter(
    (form) =>
      form.formType === "upload" &&
      form.uploadFormat === "pdf" &&
      form.status !== "draft",
  );

  const entries = await Promise.all(
    uploadPdfForms.map(async (form) => {
      try {
        const { data: row, error } = await admin
          .from("teacher_parent_forms")
          .select("config")
          .eq("organization_id", organizationId)
          .eq("id", form.id)
          .maybeSingle();

        if (error) throw error;

        const config = (row?.config ?? {}) as TeacherFormConfig;
        const storagePath = config.upload?.storagePath;
        if (!storagePath) return null;

        const signedUrl = await createTeacherFormSignedUrl(admin, storagePath);
        return [form.id, signedUrl] as const;
      } catch {
        return null;
      }
    }),
  );

  return Object.fromEntries(
    entries.filter((entry): entry is readonly [string, string] => entry != null),
  );
}
