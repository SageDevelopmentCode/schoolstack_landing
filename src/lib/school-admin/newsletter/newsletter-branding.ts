import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { PRODUCTION_SITE_URL, getRuntimeSiteUrl } from "@/lib/site";

export const MUDKITCHEN_LOGO_PATH = "/images/Logo.png";
export const MUDKITCHEN_LOGO_ALT = "MudKitchen";
export const MUDKITCHEN_FOOTER_LABEL = "Made with MudKitchen";
export const MUDKITCHEN_SITE_URL = PRODUCTION_SITE_URL;
export const NEWSLETTER_MASTHEAD_TAGLINE = "School stories";

export type NewsletterVisualBranding = {
  schoolLogoSrc?: string;
  schoolLogoAlt?: string;
  mudkitchenLogoSrc: string;
};

export function mudkitchenLogoUrlForExport(): string {
  return `${getRuntimeSiteUrl()}${MUDKITCHEN_LOGO_PATH}`;
}

/** In-app preview: relative MudKitchen logo path is fine. */
export function newsletterVisualBrandingForPreview(
  orgBranding: OrganizationBranding,
): NewsletterVisualBranding {
  const schoolSrc = orgBranding.logo.src?.trim() ?? "";
  return {
    schoolLogoSrc: schoolSrc || undefined,
    schoolLogoAlt: orgBranding.logo.alt?.trim() || "School logo",
    mudkitchenLogoSrc: MUDKITCHEN_LOGO_PATH,
  };
}

/** Exported HTML: absolute MudKitchen logo so files work off localhost. */
export function newsletterVisualBrandingForExport(
  orgBranding: OrganizationBranding,
): NewsletterVisualBranding {
  const preview = newsletterVisualBrandingForPreview(orgBranding);
  return {
    ...preview,
    mudkitchenLogoSrc: mudkitchenLogoUrlForExport(),
  };
}
