"use client";

import DOMPurify from "dompurify";

/**
 * Sanitize HTML email bodies for read-only display in the admin UI.
 */
export function sanitizeEmailHtml(html: string): string {
  if (!html.trim()) return "";
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });
}
