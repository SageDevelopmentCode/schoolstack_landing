import { PRODUCTION_SITE_URL, getRuntimeSiteUrl } from "@/lib/site";

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

export function assertNoLocalhostInOutboundHtml(html: string): void {
  if (/localhost/i.test(html) || /127\.0\.0\.1/.test(html)) {
    throw new Error(
      "Outbound email HTML contains localhost — fix NEXT_PUBLIC_SITE_URL before sending",
    );
  }
}
