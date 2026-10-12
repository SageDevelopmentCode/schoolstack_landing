import "server-only";
import DOMPurify from "isomorphic-dompurify";

const BLOG_HTML_CONFIG = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ["target", "rel"],
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
};

export function sanitizeBlogHtml(html: string): string {
  if (!html.trim()) return "";
  return DOMPurify.sanitize(html, BLOG_HTML_CONFIG);
}
