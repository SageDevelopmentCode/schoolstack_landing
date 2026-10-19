import type { OrganizationFeatures } from "@/lib/organization-settings/types";

export function isSchoolGalleryEnabled(
  features: OrganizationFeatures | null | undefined,
): boolean {
  return Boolean(features?.admin?.photos);
}
