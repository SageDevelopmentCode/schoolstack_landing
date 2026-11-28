import type { CSSProperties } from "react";
import { gardenFontVariables } from "@/components/garden/fonts";
import type { DemoTheme } from "@/data/school-demos/types";

/**
 * School-branded Garden for the demo school websites.
 *
 * The site uses Garden materials (cream paper, ink borders, toy shadows,
 * tape, polaroids, pastel washes, Bricolage / Nunito / Gochi) while the
 * school's own colours take the Garden action roles, the same idea as
 * `ParentGardenFrame`:
 *
 * - `--sf-clay`   → `theme.dark`  (primary buttons, accent words)
 * - `--sf-forest` → `theme.dark`  (the one dark panel)
 * - `--sf-butter` → school primary on paper (sticky notes, tape, highlights)
 * - `--sf-peach`  → faint school primary (eyebrow pills, soft call-outs)
 *
 * Sizes use container units (`@3xl/site`, `cqw`): the site renders at 375,
 * 1024 or 1440px design widths inside a scaled preview, so viewport
 * breakpoints (`lg:`) never match the frame.
 */

/** Classes that turn on the Garden fonts, tokens and the site type reset. */
export const SITE_SCOPE_CLASS = `${gardenFontVariables} sf-garden sf-site-garden`;

function hexToRgb(hex: string): [number, number, number] | null {
  const raw = hex.trim().replace(/^#/, "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** White text on the school colour when it passes AA, otherwise Garden ink. */
export function readableOn(color: string) {
  const rgb = hexToRgb(color);
  if (!rgb) return "#ffffff";
  const contrastWithWhite = 1.05 / (luminance(rgb) + 0.05);
  return contrastWithWhite >= 4.5 ? "#ffffff" : "#2b241d";
}

/** Garden cream `#F7F1E7`. */
const CREAM_LUMINANCE = luminance([0xf7, 0xf1, 0xe7]);

/** True when the colour passes 3:1 on cream (large display text). */
function passesLargeOnCream(color: string) {
  const rgb = hexToRgb(color);
  if (!rgb) return true;
  return (CREAM_LUMINANCE + 0.05) / (luminance(rgb) + 0.05) >= 3;
}

type Rgb = [number, number, number];

function toHex([r, g, b]: Rgb) {
  return `#${[r, g, b].map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

/** Garden cream's hue, used when a school colour is grey/black and has no hue to borrow. */
const NEUTRAL_HUE: [number, number] = [38, 0.45];

function hueOf(color: string): [number, number] {
  const rgb = hexToRgb(color);
  if (!rgb) return NEUTRAL_HUE;
  const [h, s, l] = rgbToHsl(rgb);
  // Near-greys and near-blacks have no reliable hue.
  if (s < 0.1 || l < 0.06 || l > 0.97) return NEUTRAL_HUE;
  return [h, s];
}

/**
 * A light pastel in the colour's hue. Saturation is clamped so navy turns into
 * a clear sky blue (not grey) and neon green into a soft mint (not highlighter).
 */
export function pastel(color: string, lightness: number, maxSat = 0.72) {
  const [h, s] = hueOf(color);
  return toHex(hslToRgb(h, Math.min(maxSat, Math.max(0.3, s)), lightness));
}

/** Pastel at the midpoint hue of two colours (shortest way round the wheel). */
function blendPastel(a: string, b: string, lightness: number) {
  const [ha, sa] = hueOf(a);
  const [hb, sb] = hueOf(b);
  let diff = hb - ha;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  const h = (ha + diff / 2 + 360) % 360;
  return toHex(hslToRgb(h, Math.min(0.72, Math.max(0.3, (sa + sb) / 2)), lightness));
}

function rotatedPastel(color: string, degrees: number, lightness: number) {
  const [h, s] = hueOf(color);
  return toHex(hslToRgb((h + degrees + 360) % 360, Math.min(0.72, Math.max(0.3, s)), lightness));
}

export function contrast(a: string, b: string) {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return 21;
  const [hi, lo] = [luminance(ra), luminance(rb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function sameColor(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Site "moods" give the shared website different personalities per school
 * without per-school layouts:
 * - `paper`: school-tinted cream hero (the classic Garden look)
 * - `bold`:  hero on the school's dark colour, accent line in its bright colour
 * - `sunny`: hero on a strong wash of the school's primary colour
 */
export type SiteMood = "paper" | "bold" | "sunny";
const MOODS: SiteMood[] = ["paper", "bold", "sunny"];

function hashString(value: string) {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** The school's mood: `theme.siteMood` when set, else a stable pick from the slug. */
export function resolveSiteMood(config: { slug?: string; schoolName: string; theme: DemoTheme }): SiteMood {
  const { theme } = config;
  if (theme.siteMood) return theme.siteMood;
  const pick = MOODS[hashString(config.slug || config.schoolName) % MOODS.length];
  // A dark hero needs white text to read on the school's dark colour.
  if (pick === "bold" && readableOn(theme.dark) !== "#ffffff") return "sunny";
  return pick;
}

const INK = "#2b241d";

export function siteGardenScopeStyle(theme: DemoTheme, mood: SiteMood = "paper"): CSSProperties {
  const action = theme.dark;
  const deep = `color-mix(in srgb, ${action} 60%, black)`;
  const onAction = readableOn(action);
  const actionIsDark = onAction === "#ffffff";

  // School-derived papers and pastels (replace Garden's fixed mint/sky/lavender).
  const butter = pastel(theme.primary, 0.8, 0.8);
  const accentSource =
    !sameColor(theme.accentText, theme.dark) && !sameColor(theme.accentText, theme.primary)
      ? pastel(theme.accentText, 0.87)
      : rotatedPastel(theme.primary, -35, 0.87);
  const sky = pastel(theme.dark, 0.89);
  const lav = blendPastel(theme.primary, theme.dark, 0.89);
  const peach = pastel(theme.primary, 0.92);
  const [ch, cs] = hueOf(theme.primary);
  const cream = toHex(hslToRgb(ch, Math.min(0.5, Math.max(0.25, cs * 0.6)), 0.945));
  const paper = toHex(hslToRgb(ch, Math.min(0.6, Math.max(0.3, cs * 0.6)), 0.983));
  // Outlines and toy shadows lean toward the school's dark colour but stay near-black.
  const ink = actionIsDark ? `color-mix(in srgb, ${action} 24%, ${INK})` : INK;
  const accentInk = passesLargeOnCream(action) ? action : deep;

  // Hero palette per mood.
  let hero: Record<string, string>;
  if (mood === "bold") {
    const brightOnDark = contrast(theme.primary, action) >= 3 ? theme.primary : butter;
    hero = {
      "--sf-hero-bg": action,
      "--sf-hero-ink": "#ffffff",
      "--sf-hero-soft": "rgba(255,255,255,0.82)",
      "--sf-hero-accent": brightOnDark,
      // The school's dark colour is the hero here, so the CTA takes the bright colour.
      "--sf-hero-btn": brightOnDark,
      "--sf-hero-on-btn": readableOn(brightOnDark),
      "--sf-hero-marker": "transparent",
      "--sf-hero-squiggle": butter,
      "--sf-hero-dot": "rgba(255,255,255,0.16)",
      "--sf-hero-blob": "rgba(255,255,255,0.07)",
      "--sf-marquee-bg": butter,
      "--sf-marquee-ink": INK,
      "--sf-marquee-mark": action,
    };
  } else if (mood === "sunny") {
    const sunny = pastel(theme.primary, 0.8, 0.6);
    hero = {
      "--sf-hero-bg": sunny,
      "--sf-hero-ink": INK,
      "--sf-hero-soft": "#4d443b",
      "--sf-hero-accent": contrast(action, sunny) >= 3 ? action : deep,
      "--sf-hero-btn": action,
      "--sf-hero-on-btn": onAction,
      "--sf-hero-marker": "rgba(255,255,255,0.7)",
      "--sf-hero-squiggle": "#ffffff",
      "--sf-hero-dot": `color-mix(in srgb, ${action} 22%, transparent)`,
      "--sf-hero-blob": sky,
      "--sf-marquee-bg": actionIsDark ? action : sky,
      "--sf-marquee-ink": actionIsDark ? "#ffffff" : INK,
      "--sf-marquee-mark": butter,
    };
  } else {
    hero = {
      "--sf-hero-bg": cream,
      "--sf-hero-ink": INK,
      "--sf-hero-soft": "#6d6257",
      "--sf-hero-accent": accentInk,
      "--sf-hero-btn": action,
      "--sf-hero-on-btn": onAction,
      "--sf-hero-marker": butter,
      "--sf-hero-squiggle": butter,
      "--sf-hero-dot": `color-mix(in srgb, ${action} 20%, transparent)`,
      "--sf-hero-blob": peach,
      "--sf-marquee-bg": butter,
      "--sf-marquee-ink": INK,
      "--sf-marquee-mark": action,
    };
  }

  return {
    "--sf-clay": action,
    "--sf-clay-deep": deep,
    // Accent words in headings: the school colour unless it's too light on cream.
    "--sf-accent-ink": accentInk,
    "--sf-on-clay": onAction,
    "--sf-forest": action,
    "--sf-forest-deep": deep,
    "--sf-on-forest": onAction,
    "--sf-ink": ink,
    "--sf-cream": cream,
    "--sf-paper": paper,
    "--sf-butter": butter,
    "--sf-butter-deep": `color-mix(in srgb, ${theme.primary} 55%, #8a6a1f)`,
    "--sf-mint": accentSource,
    "--sf-sky": sky,
    "--sf-lav": lav,
    "--sf-peach": peach,
    "--sf-accent-wash": pastel(theme.primary, 0.96),
    "--sf-dot": `color-mix(in srgb, ${action} 18%, transparent)`,
    "--sf-school-primary": theme.primary,
    ...hero,
    // SchoolDemoWordmark text logos read this.
    "--demo-dark": theme.dark,
  } as CSSProperties;
}

export const SITE_EASE = [0.22, 1, 0.36, 1] as const;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sf-cream)]";

const toyBase = `inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[var(--sf-ink)] px-6 text-[15px] font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-1 disabled:cursor-default disabled:opacity-60 ${focusRing}`;

/** School-coloured primary "toy" button. One per view. */
export const SITE_BTN_PRIMARY = `${toyBase} bg-[var(--sf-clay)] text-[var(--sf-on-clay)] shadow-[0_5px_0_0_var(--sf-ink)] hover:shadow-[0_7px_0_0_var(--sf-ink)] active:shadow-[0_1px_0_0_var(--sf-ink)] focus-visible:ring-[var(--sf-clay)]/40`;

/** Ink outline toy button. */
export const SITE_BTN_OUTLINE = `${toyBase} bg-white text-[var(--sf-ink)] shadow-[0_5px_0_0_var(--sf-ink)] hover:shadow-[0_7px_0_0_var(--sf-ink)] active:shadow-[0_1px_0_0_var(--sf-ink)] focus-visible:ring-[var(--sf-ink)]/30`;

/** Butter toy button for the dark panel. */
export const SITE_BTN_ON_DARK = `${toyBase} bg-[var(--sf-butter)] text-[var(--sf-ink)] shadow-[0_5px_0_0_var(--sf-ink)] hover:shadow-[0_7px_0_0_var(--sf-ink)] active:shadow-[0_1px_0_0_var(--sf-ink)] focus-visible:ring-[var(--sf-butter)]/50`;

/** Quiet text-style button on the dark panel. */
export const SITE_BTN_GHOST_DARK = `inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[var(--sf-on-forest)]/40 px-6 text-[15px] font-extrabold text-[var(--sf-on-forest)] transition-colors duration-200 hover:border-[var(--sf-on-forest)] ${focusRing} focus-visible:ring-white/40`;

/** Section frame widths and gutters. */
export const SITE_CONTAINER = "mx-auto max-w-[1240px] px-5 @3xl/site:px-10";
export const SITE_SECTION = "py-20 @3xl/site:py-28";
export const SITE_GUTTER = "px-3 @3xl/site:px-6";
/** Inset rounded block for washed sections. */
export const SITE_BLOCK =
  "relative mx-auto max-w-[1400px] rounded-[32px] border-2 border-[var(--sf-ink)] px-5 py-14 @3xl/site:rounded-[44px] @3xl/site:px-12 @3xl/site:py-20 @5xl/site:px-16";

/** Type. `.sf-display` is Bricolage 800. */
export const SITE_H1 =
  "sf-display text-[clamp(2.6rem,6.4cqw,5.6rem)] leading-[0.92] text-[var(--sf-ink)]";

/** Hero h1 sizes by headline length, so long headlines don't become 7-line walls. */
const SITE_HERO_H1_SHORT = "sf-display text-[clamp(2.6rem,6.4cqw,5.6rem)] leading-[0.92]";
const SITE_HERO_H1_MEDIUM = "sf-display text-[clamp(2.4rem,5.1cqw,4.4rem)] leading-[0.95]";
const SITE_HERO_H1_LONG = "sf-display text-[clamp(2.1rem,4.1cqw,3.5rem)] leading-[1]";

export function siteHeroH1Class(headline: string[]) {
  const length = headline.join(" ").length;
  if (length <= 32) return SITE_HERO_H1_SHORT;
  if (length <= 50) return SITE_HERO_H1_MEDIUM;
  return SITE_HERO_H1_LONG;
}

/** Accent lines longer than this get a wrapping marker instead of the squiggle. */
export const SITE_SQUIGGLE_MAX_CHARS = 24;
export const SITE_H2 =
  "sf-display text-[clamp(2.1rem,4.3cqw,3.9rem)] leading-[0.98] text-[var(--sf-ink)]";
export const SITE_H3 = "sf-display text-[1.5rem] leading-[1.05] text-[var(--sf-ink)]";
/** Configs embed raw URLs in copy, so body text must wrap anywhere. */
export const SITE_BODY = "text-[16px] leading-relaxed text-[var(--sf-soft)] [overflow-wrap:anywhere]";
export const SITE_LEAD = "text-[17px] leading-relaxed text-[var(--sf-soft)] @3xl/site:text-[18px] [overflow-wrap:anywhere]";
export const SITE_EYEBROW = "text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-clay-deep)]";
export const SITE_HAND = "sf-hand text-[1.35rem] leading-none text-[var(--sf-soft)]";

/** Toy depth for cards. */
export const SITE_CARD = "rounded-[26px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_6px_0_0_var(--sf-ink)]";
export const SITE_CARD_SM = "rounded-[22px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_4px_0_0_var(--sf-ink)]";
/** Soft depth for paper things without borders. */
export const SITE_SOFT_SHADOW = "shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)]";

/** Icon in a white ringed circle. */
export const SITE_ICON_RING =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--sf-ink)] ring-2 ring-[var(--sf-ink)]";

/** Rotating card fills; school butter and peach plus Garden pastels. Literal classes only. */
export const SITE_TINT_BG = [
  "bg-[var(--sf-butter)]",
  "bg-[var(--sf-mint)]",
  "bg-[var(--sf-sky)]",
  "bg-[var(--sf-lav)]",
  "bg-[var(--sf-peach)]",
] as const;

/** Tape colours to cycle so neighbours differ. */
export const SITE_TAPES = [
  "var(--sf-butter)",
  "var(--sf-mint)",
  "var(--sf-sky)",
  "var(--sf-lav)",
] as const;

/** Small alternating tilts for cards and notes (deg). */
export const SITE_TILTS = [-1.2, 1, -0.6, 1.4, -1.6, 0.8] as const;

export const tiltAt = (i: number) => `${SITE_TILTS[i % SITE_TILTS.length]}deg`;

/** Hover/focus straightening for tilted things (pair with inline `rotate`). */
export const SITE_STRAIGHTEN =
  "transition-[rotate,translate] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0";
