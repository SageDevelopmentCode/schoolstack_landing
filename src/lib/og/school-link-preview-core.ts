/**
 * Pure helpers for school link previews (the card a chat app shows when a school shares its tour,
 * application or portal link). No I/O here so it can be unit tested; the image itself is drawn in
 * `school-link-preview.tsx` and served by `src/app/school/[slug]/link-preview/route.tsx`.
 */

export const SCHOOL_PREVIEW_PAGES = ["tour", "apply", "form", "portal"] as const;
export type SchoolPreviewPage = (typeof SCHOOL_PREVIEW_PAGES)[number];

export function parseSchoolPreviewPage(value: string | null | undefined): SchoolPreviewPage {
  return SCHOOL_PREVIEW_PAGES.includes(value as SchoolPreviewPage) ? (value as SchoolPreviewPage) : "portal";
}

/** Garden constants (match `--sf-*` in garden.css). */
export const PREVIEW_INK = "#2B241D";
export const PREVIEW_SOFT = "#6D6257";
export const PREVIEW_CREAM = "#F7F1E7";
export const PREVIEW_PAPER = "#FFFAF4";
const FALLBACK_ACCENT = "#2E4A3C";

// ---------------------------------------------------------------- colour

type Rgb = [number, number, number];

export function parseHexColor(value: string | null | undefined): Rgb | null {
  const hex = value?.trim().replace(/^#/, "") ?? "";
  if (/^[0-9a-f]{3}$/i.test(hex)) return [0, 1, 2].map((i) => parseInt(hex[i] + hex[i], 16)) as Rgb;
  if (/^[0-9a-f]{6}$/i.test(hex)) return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
  return null;
}

const toHex = (rgb: Rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;

/** Mix `a` toward `b` by `t` (0 = a, 1 = b). */
export function mixColors(a: string, b: string, t: number): string {
  const x = parseHexColor(a) ?? parseHexColor(FALLBACK_ACCENT)!;
  const y = parseHexColor(b) ?? parseHexColor(PREVIEW_CREAM)!;
  return toHex(x.map((v, i) => v + (y[i] - v) * t) as Rgb);
}

function luminance(color: string): number {
  const rgb = parseHexColor(color) ?? [0, 0, 0];
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

/** Ink or white, whichever reads better on `background`. */
export function readableTextOn(background: string): string {
  return contrastRatio(PREVIEW_INK, background) >= contrastRatio("#FFFFFF", background) ? PREVIEW_INK : "#FFFFFF";
}

export type SchoolPreviewPalette = {
  accent: string;
  /** Card background: the accent washed toward cream. */
  paper: string;
  /** Dot-grid ink on the paper. */
  dots: string;
  /** Hard shadow under the logo card. */
  shadow: string;
  /** The school name: the school's own colour when it passes AA on the paper, else ink. */
  name: string;
  /** Text on a solid accent fill (monogram). */
  onAccent: string;
};

export function schoolPreviewPalette(colors: { accent?: string; accentDark?: string } | null | undefined): SchoolPreviewPalette {
  const accent = parseHexColor(colors?.accent) ? colors!.accent!.trim() : FALLBACK_ACCENT;
  // Wash toward Garden paper (warmer and brighter than cream) so muted accents don't go grey.
  const paper = mixColors(accent, PREVIEW_PAPER, 0.84);
  const candidates = [colors?.accentDark, accent, mixColors(accent, PREVIEW_INK, 0.45)].filter(
    (c): c is string => !!c && !!parseHexColor(c),
  );
  const name = candidates.find((c) => contrastRatio(c, paper) >= 4.5) ?? PREVIEW_INK;
  return {
    accent,
    paper,
    dots: mixColors(accent, PREVIEW_PAPER, 0.55),
    shadow: mixColors(accent, PREVIEW_INK, 0.35),
    name,
    onAccent: readableTextOn(accent),
  };
}

// ---------------------------------------------------------------- logo source (SSRF guard)

/** Logos uploaded in My School land here (see `ORGANIZATION_BRANDING_BUCKET`). */
const BRANDING_PUBLIC_PATH = "/storage/v1/object/public/organization-branding/";

export type SchoolLogoSource = { kind: "public"; path: string } | { kind: "remote"; url: string };

/**
 * Where the card may load a school logo from. Only our own `public/images` files or the school's
 * upload in our Supabase branding bucket — the logo URL is admin-editable text, so anything else
 * (other hosts, `..`, protocol-relative URLs) is refused rather than fetched.
 */
export function resolveSchoolLogoSource(src: string | null | undefined, supabaseUrl: string | null | undefined): SchoolLogoSource | null {
  const value = src?.trim();
  if (!value) return null;

  if (value.startsWith("/") && !value.startsWith("//")) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(value.split(/[?#]/)[0]);
    } catch {
      return null;
    }
    if (decoded.includes("..") || decoded.includes("\\") || !decoded.startsWith("/images/")) return null;
    return { kind: "public", path: decoded };
  }

  let url: URL;
  let supabase: URL;
  try {
    url = new URL(value);
    supabase = new URL(supabaseUrl ?? "");
  } catch {
    return null;
  }
  if (url.origin !== supabase.origin) return null;
  if (url.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(url.hostname)) return null;
  if (!url.pathname.startsWith(BRANDING_PUBLIC_PATH) || url.pathname.includes("..")) return null;
  return { kind: "remote", url: url.toString() };
}

// ---------------------------------------------------------------- copy

export function truncateText(value: string | null | undefined, max: number): string {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** Headline size on the 1200px card: big for short lines, smaller as it gets longer. */
export function headlineSize(text: string): number {
  const n = text.length;
  if (n <= 20) return 84;
  if (n <= 34) return 74;
  if (n <= 52) return 64;
  if (n <= 72) return 56;
  return 50;
}

/** Up to two initials for the no-logo badge ("Sage Field School" → "SF"). */
export function schoolInitials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const skip = new Set(["the", "of", "and", "a", "an"]);
  const main = words.filter((w) => !skip.has(w.toLowerCase()));
  const picked = (main.length ? main : words).slice(0, 2);
  return picked.map((w) => w[0]!.toUpperCase()).join("") || "S";
}

// ---------------------------------------------------------------- cache-busting version

/** Short stable hash (FNV-1a) of what's drawn, so crawlers refetch when branding or copy changes. */
export function schoolPreviewVersion(parts: Array<string | null | undefined>): string {
  let hash = 0x811c9dc5;
  for (const char of parts.map((p) => p ?? "").join("\u0001")) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

export type SchoolPreviewParams = { page: SchoolPreviewPage; form?: string | null; version: string };

/**
 * Site-relative image URL for a school page's card: `/school/<slug>/link-preview/<page>/<version>[/<form>]`.
 * Path-only (no query string) so the URL survives any HTML or XML escaping in chat-app crawlers.
 */
export function schoolPreviewImagePath(slug: string, { page, form, version }: SchoolPreviewParams): string {
  const parts = [page, version, ...(form ? [form] : [])].map(encodeURIComponent);
  return `/school/${encodeURIComponent(slug)}/link-preview/${parts.join("/")}`;
}
