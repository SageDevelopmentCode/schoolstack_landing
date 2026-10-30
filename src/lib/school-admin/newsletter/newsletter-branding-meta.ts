import type { OrganizationBranding } from "@/lib/organization-settings/types";

export function newsletterPrimaryFromBranding(branding: OrganizationBranding): string {
  return branding.colors.accentMid || branding.colors.accent;
}
