import type { SupabaseClient } from "@supabase/supabase-js";
import { listOrgEnrolledStudents } from "@/lib/school-admin/enrolled-students";
import { loadStudentPhotoMediaConsents } from "@/lib/students/load-student-photo-media-consents";
import {
  photoMediaConsentLabel,
  type PhotoMediaConsent,
} from "@/lib/students/photo-media-consent";

export type OrgPhotoMediaConsentRosterRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  familyName: string | null;
  programLabel: string;
  consent: PhotoMediaConsent | null;
  consentLabel: string;
  updatedAt: string | null;
};

export async function loadOrgPhotoMediaConsentRoster(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrgPhotoMediaConsentRosterRow[]> {
  const enrolled = await listOrgEnrolledStudents(supabase, organizationId);
  const studentIds = enrolled.map((student) => student.id);
  const consentRows = await loadStudentPhotoMediaConsents(
    supabase,
    organizationId,
    studentIds,
  );
  const consentByStudentId = new Map(
    consentRows.map((row) => [row.studentId, row]),
  );

  const rows: OrgPhotoMediaConsentRosterRow[] = enrolled.map((student) => {
    const consentRow = consentByStudentId.get(student.id);
    const consent = consentRow?.consent ?? null;
    return {
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      familyName: student.familyName,
      programLabel:
        student.programNames.length > 0 ? student.programNames.join(" · ") : "—",
      consent,
      consentLabel: photoMediaConsentLabel(consent),
      updatedAt: consentRow?.updatedAt ?? null,
    };
  });

  rows.sort((a, b) => {
    const familyCompare = (a.familyName ?? "").localeCompare(b.familyName ?? "", undefined, {
      sensitivity: "base",
    });
    if (familyCompare !== 0) return familyCompare;
    const lastCompare = a.lastName.localeCompare(b.lastName, undefined, {
      sensitivity: "base",
    });
    if (lastCompare !== 0) return lastCompare;
    return a.firstName.localeCompare(b.firstName, undefined, { sensitivity: "base" });
  });

  return rows;
}
