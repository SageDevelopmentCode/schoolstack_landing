import type { SupabaseClient } from "@supabase/supabase-js";
import { loadTeacherClassroomOptions } from "@/lib/classroom-signups/load-teacher-classrooms";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import {
  listFormResponsesByFormIds,
  listTeacherParentForms,
} from "./load-teacher-forms";
import type { TeacherFormSignatureRow, TeacherParentForm } from "./types";

export type TeacherFormsDocumentsPageData = {
  forms: TeacherParentForm[];
  responsesByFormId: Record<string, TeacherFormSignatureRow[]>;
  classroomOptions: TeacherClassroomOption[];
};

export async function loadTeacherFormsDocumentsPageData(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<TeacherFormsDocumentsPageData> {
  const forms = await listTeacherParentForms(admin, organizationId, staffMemberId);

  const [responsesByFormId, classroomOptions] = await Promise.all([
    listFormResponsesByFormIds(admin, organizationId, forms),
    loadTeacherClassroomOptions(admin, organizationId, staffMemberId),
  ]);

  return {
    forms,
    responsesByFormId,
    classroomOptions,
  };
}
