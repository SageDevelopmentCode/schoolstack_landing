import {
  buildNewsletterArticleHtml,
  escapeHtml,
  type BuildContentOptions,
} from "./newsletter-render";
import {
  NEWSLETTER_CSS,
  NEWSLETTER_DOCUMENT_CSS,
  NEWSLETTER_GOOGLE_FONTS_HREF,
} from "./newsletter-styles";
import type { NewsletterEdition, NewsletterSchoolMeta } from "./newsletter-types";
import { getRuntimeSiteUrl } from "@/lib/site";

/** Static CSP for exported newsletter HTML (parent document API, downloads, WebView). */
const EXPORT_CONTENT_SECURITY_POLICY =
  "default-src 'self' https: data:; script-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src https: data:; base-uri 'self'; form-action 'none'";

export function buildExportHtmlDocument(
  edition: NewsletterEdition,
  school: NewsletterSchoolMeta,
  options: BuildContentOptions = {},
): string {
  const article = buildNewsletterArticleHtml(edition, school, options);
  const title = edition.title.trim() || "Newsletter";
  const baseHref = `${getRuntimeSiteUrl()}/`;
  const safeBaseHref = escapeHtml(baseHref);
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta http-equiv="Content-Security-Policy" content="${EXPORT_CONTENT_SECURITY_POLICY}"><base href="${safeBaseHref}"><title>${safeTitle}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${escapeHtml(NEWSLETTER_GOOGLE_FONTS_HREF)}" rel="stylesheet"><style>${NEWSLETTER_DOCUMENT_CSS}${NEWSLETTER_CSS}</style></head><body>${article}</body></html>`;
}

export function downloadFile(content: string, mime: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function plainTextFromHtml(html: string): Promise<string> {
  const host = document.createElement("div");
  host.innerHTML = html;
  host.querySelectorAll(".news-empty, .n-edit-chip, .n-edit-hit, .n-placeholder").forEach((el) => el.remove());
  // The quote mark is drawn by CSS; put real quotes back for plain text.
  host.querySelectorAll(".n-quote").forEach((el) => {
    el.prepend("“");
    el.append("”");
  });
  host.querySelectorAll("p, li, h2, h3, .n-teacher, .n-event, .n-label, .n-quote, .n-eyebrow, figcaption").forEach((el) => el.append("\n"));
  host.querySelectorAll("br").forEach((el) => el.replaceWith("\n"));
  return (host.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}
