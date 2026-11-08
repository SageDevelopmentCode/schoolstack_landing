import type { CSSProperties } from "react";
import type { DemoTheme } from "@/data/school-demos/types";

/**
 * Global `h1, h2, h3` rules are unlayered and set font, weight, tracking and
 * line height, so those four need `!`. Color and size stay normal utilities.
 * Sizes use `cqw` so they follow the `@container/site` frame, not the viewport.
 */
export const DEMO_HEADING =
  "font-secondary! font-bold! tracking-[-0.04em]! leading-[1.04]!";

export const DEMO_H1 = `${DEMO_HEADING} text-[clamp(2.5rem,5.4cqw,4.75rem)]`;

export const DEMO_H2 = `${DEMO_HEADING} text-[clamp(1.9rem,3.6cqw,3.25rem)]`;

export const DEMO_H3 =
  "font-secondary! font-bold! tracking-[-0.02em]! leading-[1.2]! text-[1.2rem]";

export const DEMO_INK = "text-[var(--demo-ink)]";

/** School-branded highlighter underline behind the accent phrase. */
export const DEMO_ACCENT_HIGHLIGHT =
  "text-[var(--demo-accent)] bg-[linear-gradient(transparent_62%,var(--demo-highlight-bg)_62%)] [box-decoration-break:clone]";

export const DEMO_EYEBROW =
  "font-secondary text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--demo-accent)]";

/** Configs embed raw URLs in copy, so body text must wrap anywhere. */
export const DEMO_BODY =
  "font-secondary text-[16px] leading-relaxed text-[var(--demo-muted)] [overflow-wrap:anywhere]";

export const DEMO_CHIP =
  "font-secondary inline-flex items-center gap-1.5 rounded-pill bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[var(--demo-ink)] ring-1 ring-black/[0.06]";

/** Section gutter: blocks float inside the frame like the home page. */
export const DEMO_GUTTER = "px-3 @3xl/site:px-6";

/** Full-width rounded section block. Pair with a tint background. */
export const DEMO_BLOCK =
  "relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] @3xl/site:rounded-[40px] px-5 py-14 @3xl/site:px-12 @3xl/site:py-20 @5xl/site:px-16";

/** Inner content width for plain white sections. */
export const DEMO_CONTAINER = "mx-auto max-w-[1240px] px-5 @3xl/site:px-10";

export const DEMO_TILE =
  "rounded-[28px] p-6 @3xl/site:p-7 transition-transform duration-300 hover:-translate-y-1";

/** White floating card used as a sticker over photos. */
export const DEMO_STICKER =
  "rounded-[20px] bg-white/95 px-4 py-3 shadow-[var(--demo-shadow-float)] ring-1 ring-black/[0.05] backdrop-blur-sm";

export const DEMO_PHOTO_FRAME =
  "relative overflow-hidden rounded-[28px] ring-1 ring-black/[0.06] shadow-[var(--demo-shadow-float)]";

export const DEMO_PRIMARY_PILL =
  "font-secondary inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-[var(--demo-cta-bg)] px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_var(--demo-cta-bg)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--demo-cta-hover)]";

export const DEMO_OUTLINE_PILL =
  "font-secondary inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-black/15 bg-white px-6 text-[15px] font-semibold text-[var(--demo-ink)] transition-all duration-200 hover:border-black/35";

/** White pill for dark or photo backgrounds. */
export const DEMO_WHITE_PILL =
  "font-secondary inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-white px-6 text-[15px] font-semibold text-[var(--demo-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--demo-tint-1)]";

export const DEMO_GHOST_PILL_ON_DARK =
  "font-secondary inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-white/30 px-6 text-[15px] font-semibold text-white transition-all duration-200 hover:border-white/70";

/** Rotating tints for tiles so neighbours never share a colour. */
export const DEMO_TINTS = [
  "var(--demo-tint-1)",
  "var(--demo-tint-3)",
  "var(--demo-tint-4)",
  "var(--demo-tint-2)",
] as const;

export const STORY_EASE = [0.16, 1, 0.3, 1] as const;

/** Bright layout tokens derived from each school `DemoTheme`. */
export function buildBrightDemoWebsiteThemeVars(theme: DemoTheme): CSSProperties {
  const page = theme.pageBg ?? "#FFFFFF";
  const tint1 = `color-mix(in srgb, ${theme.primary} 10%, white)`;

  return {
    "--demo-paper": page,
    "--demo-page-bg": page,
    "--demo-ink": theme.dark,
    "--demo-muted": theme.muted,
    "--demo-line": theme.lightBorder,
    "--demo-cream": "#F7F3EC",
    "--demo-accent": theme.accentText,
    "--demo-tint-1": tint1,
    "--demo-tint-2": `color-mix(in srgb, ${theme.dark} 7%, white)`,
    "--demo-tint-3": "#F7F3EC",
    "--demo-tint-4": `color-mix(in srgb, ${theme.primaryHover} 8%, #F4F8FB)`,
    "--demo-section-tint": tint1,
    "--demo-highlight-bg": `color-mix(in srgb, ${theme.primary} 26%, white)`,
    "--demo-blob-a": `color-mix(in srgb, ${theme.primary} 30%, white)`,
    "--demo-blob-b": `color-mix(in srgb, ${theme.dark} 14%, white)`,
    "--demo-blob-c": `color-mix(in srgb, ${theme.primary} 14%, #FDE3D3)`,
    "--demo-glow": `color-mix(in srgb, ${theme.primary} 22%, transparent)`,
    "--demo-radius-card": "28px",
    "--demo-radius-button": "9999px",
    "--demo-shadow-card": "0 8px 30px rgba(20, 20, 40, 0.06)",
    "--demo-shadow-float": "0 30px 80px -20px rgba(20, 20, 40, 0.22)",
    "--demo-shadow-pill": "0 4px 14px rgba(20, 20, 40, 0.08)",
    "--demo-primary": theme.primary,
    "--demo-primary-hover": theme.primaryHover,
    "--demo-primary-soft": theme.badgeBg,
    "--demo-primary-light": `color-mix(in srgb, ${theme.primary} 45%, white)`,
    "--demo-dark": theme.dark,
    "--demo-dark-hover": theme.darkHover,
    "--demo-light-bg": theme.lightBg,
    "--demo-light-border": theme.lightBorder,
    "--demo-badge-bg": theme.badgeBg,
    "--demo-accent-text": theme.accentText,
    "--demo-cta-bg": theme.dark,
    "--demo-cta-hover": theme.primary,
    "--demo-ink-band": theme.dark,
  } as CSSProperties;
}
