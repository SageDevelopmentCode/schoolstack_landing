import { EyeOff, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import type { GChipTone } from "@/components/school-parent/garden/ui";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import type { PhotoMediaConsent } from "@/lib/students/photo-media-consent";

export function consentChipTone(consent: PhotoMediaConsent | null): GChipTone {
  if (consent === "full") return "success";
  if (consent === "limited") return "warning";
  if (consent === "none") return "alert";
  return "info";
}

/** One icon per consent level (guide card + panel option cards). */
export const CONSENT_ICONS: Record<PhotoMediaConsent, LucideIcon> = {
  full: ShieldCheck,
  limited: Users,
  none: EyeOff,
};

/** Pastel behind each level's icon (literal classes so Tailwind keeps them). */
export const CONSENT_TINTS: Record<PhotoMediaConsent, string> = {
  full: "bg-[var(--sf-mint)]",
  limited: "bg-[var(--sf-butter)]",
  none: "bg-[var(--sf-peach)]",
};

export type PhotoPermissionLearner = {
  studentId: string;
  studentName: string;
  /** Full child record, for the photo thumb. */
  child: FamilyChildOverview;
};

/** "Maya", "Maya and Leo", "Maya, Leo and Ava". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** "Updated Nov 14, 2026" from an ISO timestamp, or null. */
export function formatConsentUpdated(updatedAt: string | null | undefined): string | null {
  if (!updatedAt) return null;
  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return `Updated ${parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}
