import type { NewsletterEdition } from "./newsletter-types";

const DEFAULT_PRIMARY = "#477455";

export function getNewsletterHeroCoverSrc(edition: NewsletterEdition): string | undefined {
  const src = edition.coverImage?.trim();
  return src || undefined;
}

function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace(/^#/, "");
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return { r, g, b };
  }
  return null;
}

function rgbaFromHex(hex: string, alpha: number): string {
  const rgb = parseHexColor(hex) ?? parseHexColor(DEFAULT_PRIMARY)!;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** Escape a URL for use inside CSS `url("...")`. */
export function escapeCssUrl(url: string): string {
  return url.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export type NewsletterHeroCoverCssVars = {
  "--n-hero-cover": string;
  "--n-hero-overlay-bottom": string;
  "--n-hero-overlay-mid": string;
};

export function newsletterHeroCoverCssVars(
  coverSrc: string,
  primaryColor?: string,
): NewsletterHeroCoverCssVars {
  const primary = primaryColor?.trim() || DEFAULT_PRIMARY;
  return {
    "--n-hero-cover": `url("${escapeCssUrl(coverSrc)}")`,
    "--n-hero-overlay-bottom": rgbaFromHex(primary, 0.85),
    "--n-hero-overlay-mid": rgbaFromHex(primary, 0.55),
  };
}

/** Inline style attribute for exported HTML hero cover. */
export function newsletterHeroCoverInlineStyle(
  coverSrc: string,
  primaryColor?: string,
): string {
  const vars = newsletterHeroCoverCssVars(coverSrc, primaryColor);
  return `--n-hero-cover:${vars["--n-hero-cover"]};--n-hero-overlay-bottom:${vars["--n-hero-overlay-bottom"]};--n-hero-overlay-mid:${vars["--n-hero-overlay-mid"]}`;
}
