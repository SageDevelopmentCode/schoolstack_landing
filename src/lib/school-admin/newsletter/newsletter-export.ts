import {
  buildNewsletterArticleHtml,
  type BuildContentOptions,
} from "./newsletter-render";
import type { NewsletterEdition, NewsletterSchoolMeta } from "./newsletter-types";

const EXPORT_STYLE_SNIPPET = `
body{padding:24px 14px;background:#F8F8F3;font-family:'DM Sans',sans-serif}
.newsletter{max-width:760px;margin:auto;border:1px solid #E0E7E0;border-radius:13px;overflow:hidden;background:white;color:#283943}
.n-masthead,.n-hero,.n-content,.n-footer{padding-left:24px;padding-right:24px}
.n-masthead{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:18px;padding-bottom:18px;border-bottom:1px solid #E4E8E1;font-size:9px;color:#7B8D7A}
.n-masthead-school,.n-masthead-mk{display:flex;align-items:center;gap:8px;min-width:0}
.n-masthead-mk{flex-shrink:0}
.n-school{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:700;color:#5F7864}
.n-masthead-tagline{white-space:nowrap}
.n-logo{display:block;object-fit:contain;flex-shrink:0}
.n-logo-school{height:30px;width:auto;max-width:120px}
.n-logo-mk{height:22px;width:auto}
.n-hero{padding-top:24px;padding-bottom:24px;background:#FFFDF7}
.n-hero h2{font-family:Fraunces,Georgia,serif;font-size:32px;margin:12px 0}
.n-section{padding:20px 0;border-bottom:1px solid #E4E8E1}
.n-footer{padding:18px 24px 16px;background:#FCFDFB;border-top:1px solid #E4E8E1;font-size:9px;text-align:center;color:#81927E}
.n-footer-signature{line-height:1.85}
.n-footer-mk{margin-top:14px;padding-top:14px;border-top:1px solid #E4E8E1}
.n-footer-mk a{display:inline-flex;align-items:center;gap:7px;color:#7B8D7A;text-decoration:none;font-size:9px;font-weight:600}
.n-logo-mk-footer{height:20px;width:auto}
`;

export function buildExportHtmlDocument(
  edition: NewsletterEdition,
  school: NewsletterSchoolMeta,
  options: BuildContentOptions = {},
): string {
  const article = buildNewsletterArticleHtml(edition, school, options);
  const title = edition.title.trim() || "Newsletter";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@500;600&display=swap" rel="stylesheet"><style>${EXPORT_STYLE_SNIPPET}</style></head><body>${article}</body></html>`;
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
  host.querySelectorAll(".news-empty").forEach((el) => el.remove());
  host.querySelectorAll("br").forEach((el) => el.replaceWith("\n"));
  return (host.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}
