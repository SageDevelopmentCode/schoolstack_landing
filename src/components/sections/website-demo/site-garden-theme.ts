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

export function siteGardenScopeStyle(theme: DemoTheme): CSSProperties {
  const action = theme.dark;
  const deep = `color-mix(in srgb, ${action} 60%, black)`;
  return {
    "--sf-clay": action,
    "--sf-clay-deep": deep,
    // Accent words in headings: the school colour unless it's too light on cream.
    "--sf-accent-ink": passesLargeOnCream(action) ? action : deep,
    "--sf-on-clay": readableOn(action),
    "--sf-forest": action,
    "--sf-forest-deep": `color-mix(in srgb, ${action} 60%, black)`,
    "--sf-on-forest": readableOn(action),
    "--sf-butter": `color-mix(in srgb, ${theme.primary} 30%, #fff8e6)`,
    "--sf-butter-deep": `color-mix(in srgb, ${theme.primary} 55%, #8a6a1f)`,
    "--sf-peach": `color-mix(in srgb, ${theme.primary} 16%, #fffaf4)`,
    "--sf-accent-wash": `color-mix(in srgb, ${theme.primary} 8%, #fffaf4)`,
    "--sf-school-primary": theme.primary,
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
