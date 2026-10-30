import type { ParentChipTone } from "@/components/school-parent/ui/ParentChip";
import type { PhotoMediaConsent } from "@/lib/students/photo-media-consent";

export function consentChipTone(consent: PhotoMediaConsent | null): ParentChipTone {
  if (consent === "full") return "success";
  if (consent === "limited") return "warning";
  if (consent === "none") return "alert";
  return "info";
}

export type PhotoPermissionLearner = {
  studentId: string;
  studentName: string;
};
