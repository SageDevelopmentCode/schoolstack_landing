import type { SupabaseClient } from "@supabase/supabase-js";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import type { TeacherFormSignatureRow } from "@/lib/school-teacher/forms-documents/types";
import { loadAdminClassroomOptions } from "./load-admin-classroom-options";
import {
  listOrgFormResponsesByFormIds,
  listOrgParentForms,
} from "./load-admin-forms";
import type { AdminParentForm } from "./types";

export type AdminFormsDocumentsPageData = {
  forms: AdminParentForm[];
  responsesByFormId: Record<string, TeacherFormSignatureRow[]>;
  classroomOptions: TeacherClassroomOption[];
};

export async function loadAdminFormsDocumentsPageData(
  admin: SupabaseClient,
  organizationId: string,
): Promise<AdminFormsDocumentsPageData> {
  const forms = await listOrgParentForms(admin, organizationId);

  const [responsesByFormId, classroomOptions] = await Promise.all([
    listOrgFormResponsesByFormIds(admin, organizationId, forms),
    loadAdminClassroomOptions(admin, organizationId),
  ]);

  return {
    forms,
    responsesByFormId,
    classroomOptions,
  };
}
