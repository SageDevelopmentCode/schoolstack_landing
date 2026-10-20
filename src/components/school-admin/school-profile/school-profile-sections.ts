import type { LucideIcon } from "lucide-react";
import { Clock, Globe, Image, Mail, MapPin, Phone } from "lucide-react";

export const SCHOOL_PROFILE_SECTIONS = [
  { id: "about", label: "About & links", icon: Globe },
  { id: "campus", label: "Campus", icon: MapPin },
  { id: "phones", label: "Phones", icon: Phone },
  { id: "emails", label: "Emails", icon: Mail },
  { id: "hours", label: "Hours & directions", icon: Clock },
  { id: "photos", label: "School photos", icon: Image },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  icon: LucideIcon;
}>;

export type SchoolProfileSectionId =
  (typeof SCHOOL_PROFILE_SECTIONS)[number]["id"];

export const SCHOOL_PROFILE_SECTION_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

export function subtitleForSchoolProfileSection(
  section: SchoolProfileSectionId,
): string {
  switch (section) {
    case "about":
      return "Website, short description, emergency line, and social links";
    case "campus":
      return "Primary campus name and mailing address";
    case "phones":
      return "Office and department phone numbers";
    case "emails":
      return "Inboxes families and staff should use to reach the school";
    case "hours":
      return "Office hours, directions, and parking notes";
    case "photos":
      return "Up to 5 campus photos (compressed before upload)";
  }
}

export function isSchoolProfileSectionLoading(
  sectionId: SchoolProfileSectionId,
  pendingSection: SchoolProfileSectionId | null,
  loadingSection: SchoolProfileSectionId | null,
): boolean {
  return pendingSection === sectionId || loadingSection === sectionId;
}
