/**
 * School-accent colours for the Garden newsletter, computed as plain hex so
 * the same values work in the app, the standalone document, downloads and
 * older mobile WebViews (no `color-mix`).
 */

export const NEWSLETTER_DEFAULT_ACCENT = "#477455";

/** Garden neutrals (`--sf-*` on marketing pages). */
export const NEWSLETTER_PAPER = "#FFFAF4";
export const NEWSLETTER_CREAM = "#F7F1E7";
export const NEWSLETTER_INK = "#2B241D";

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string): Rgb | null {
  const raw = hex.trim().replace(/^#/, "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  const part = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

/** Mix `a` into `b`: weight 1 = all `a`, 0 = all `b`. */
export function mixHex(a: string, b: string, weight: number): string {
  const ca = parseHex(a) ?? parseHex(NEWSLETTER_DEFAULT_ACCENT)!;
  const cb = parseHex(b) ?? parseHex(NEWSLETTER_PAPER)!;
  return toHex({
    r: ca.r * weight + cb.r * (1 - weight),
    g: ca.g * weight + cb.g * (1 - weight),
    b: ca.b * weight + cb.b * (1 - weight),
  });
}

function luminance(hex: string): number {
  const c = parseHex(hex) ?? { r: 0, g: 0, b: 0 };
  const channel = (n: number) => {
    const v = n / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Darken the accent towards ink until it reads as small text on `bg` (AA 4.5). */
function readableOn(accent: string, bg: string): string {
  let weight = 1;
  let candidate = mixHex(accent, NEWSLETTER_INK, weight);
  while (contrastRatio(candidate, bg) < 4.5 && weight > 0) {
    weight = Math.max(0, weight - 0.08);
    candidate = mixHex(accent, NEWSLETTER_INK, weight);
  }
  return candidate;
}

export type NewsletterAccentPalette = {
  /** Fills, bars, rules. */
  accent: string;
  /** Small accent text on paper / tints (AA). */
  deep: string;
  /** Faint wash for hover and the plain hero. */
  wash: string;
  /** Soft tint for chips and dot grids. */
  tint: string;
  /** Text on a solid accent fill. */
  onAccent: string;
};

export function newsletterAccentPalette(primary?: string): NewsletterAccentPalette {
  const accent = parseHex(primary ?? "") ? toHex(parseHex(primary!)!) : NEWSLETTER_DEFAULT_ACCENT;
  const tint = mixHex(accent, NEWSLETTER_PAPER, 0.16);
  const deep = readableOn(accent, tint);
  return {
    accent,
    deep,
    wash: mixHex(accent, NEWSLETTER_PAPER, 0.08),
    tint,
    onAccent: contrastRatio("#FFFFFF", accent) >= 4.5 ? "#FFFFFF" : NEWSLETTER_INK,
  };
}

/** Inline `style` value for the `<article>` (attribute-safe: hex only). */
export function newsletterAccentInlineStyle(primary?: string): string {
  const p = newsletterAccentPalette(primary);
  return `--n-accent:${p.accent};--n-accent-deep:${p.deep};--n-accent-wash:${p.wash};--n-accent-tint:${p.tint};--n-on-accent:${p.onAccent}`;
}
