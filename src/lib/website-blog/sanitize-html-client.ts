"use client";

import DOMPurify from "dompurify";

export function sanitizeBlogHtmlClient(html: string): string {
  if (!html.trim()) return "";
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
  });
}
