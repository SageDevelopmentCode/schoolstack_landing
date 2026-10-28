import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parsePhotoMediaConsent,
  type PhotoMediaConsent,
} from "@/lib/students/photo-media-consent";

export type StudentPhotoMediaConsentRow = {
  studentId: string;
  consent: PhotoMediaConsent | null;
  updatedAt: string | null;
};

export type PhotoMediaConsentState = {
  consent: PhotoMediaConsent | null;
  updatedAt: string | null;
};

export function buildInitialConsentsMap(
  rows: StudentPhotoMediaConsentRow[],
): Record<string, PhotoMediaConsentState> {
  return Object.fromEntries(
    rows.map((row) => [
      row.studentId,
      { consent: row.consent, updatedAt: row.updatedAt },
    ]),
  );
}

export async function loadStudentPhotoMediaConsents(
  supabase: SupabaseClient,
  organizationId: string,
  studentIds: string[],
): Promise<StudentPhotoMediaConsentRow[]> {
  const uniqueIds = [...new Set(studentIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const { data, error } = await supabase
    .from("students")
    .select("id, photo_media_consent, photo_media_consent_updated_at")
    .eq("organization_id", organizationId)
    .in("id", uniqueIds);

  if (error) throw error;

  const byId = new Map(
    (data ?? []).map((row) => [
      String(row.id),
      {
        studentId: String(row.id),
        consent: parsePhotoMediaConsent(
          row.photo_media_consent as string | null | undefined,
        ),
        updatedAt:
          typeof row.photo_media_consent_updated_at === "string"
            ? row.photo_media_consent_updated_at
            : null,
      },
    ]),
  );

  return uniqueIds.map(
    (studentId) =>
      byId.get(studentId) ?? {
        studentId,
        consent: null,
        updatedAt: null,
      },
  );
}
