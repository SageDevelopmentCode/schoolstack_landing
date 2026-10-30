import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapEnrollmentConsentToPhotoMediaConsent,
  type PhotoMediaConsent,
} from "@/lib/students/photo-media-consent";

export async function syncStudentPhotoMediaConsentFromEnrollment(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
  enrollmentConsentValue: string,
): Promise<PhotoMediaConsent | null> {
  const consent = mapEnrollmentConsentToPhotoMediaConsent(enrollmentConsentValue);
  if (!consent) return null;

  const { error } = await supabase
    .from("students")
    .update({
      photo_media_consent: consent,
      photo_media_consent_updated_at: new Date().toISOString(),
    })
    .eq("id", studentId)
    .eq("organization_id", organizationId);

  if (error) throw error;
  return consent;
}

export async function syncPhotoMediaConsentAfterAgreementComplete(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    applicationId: string | null | undefined;
    consentValue: string;
    consentOptionsCount: number;
    isComplete: boolean;
  },
): Promise<void> {
  const {
    organizationId,
    applicationId,
    consentValue,
    consentOptionsCount,
    isComplete,
  } = input;

  if (!isComplete || consentOptionsCount === 0) return;

  const trimmed = consentValue.trim();
  if (!trimmed || !applicationId) return;

  const { data: application, error } = await supabase
    .from("applications")
    .select("student_id")
    .eq("id", applicationId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!application?.student_id) return;

  await syncStudentPhotoMediaConsentFromEnrollment(
    supabase,
    organizationId,
    String(application.student_id),
    trimmed,
  );
}
