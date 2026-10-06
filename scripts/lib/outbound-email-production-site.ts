import { assertNoLocalhostInOutboundHtml } from "@/lib/outbound-email-localhost-guard";
import { PRODUCTION_SITE_URL, getRuntimeSiteUrl } from "@/lib/site";

export { assertNoLocalhostInOutboundHtml };

/** Call before dynamic imports of @/lib/emails or notification libs from scripts. */
export function ensureProductionSiteUrlForOutboundEmail(): string {
  const emailOverride = process.env.EMAIL_SITE_URL?.trim();
  if (emailOverride) {
    process.env.NEXT_PUBLIC_SITE_URL = emailOverride.replace(/\/$/, "");
    return getRuntimeSiteUrl();
  }

  const current = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (
    !current ||
    current.includes("localhost") ||
    current.includes("127.0.0.1")
  ) {
    process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_SITE_URL;
  }

  return getRuntimeSiteUrl();
}

export function logOutboundEmailSiteUrl(scriptPrefix: string): void {
  const siteUrl = getRuntimeSiteUrl();
  console.log(`[${scriptPrefix}] Using site URL: ${siteUrl}`);
}

