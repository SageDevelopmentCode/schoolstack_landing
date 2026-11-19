"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import { useMemo } from "react";

// Shared "sticker" look for the Marketing Studio: die-cut outline filter, colour helpers and soft
// pastel pattern backgrounds. No imports from the slide kits, so any of them (and Mascot) can use it.

const INK = "#2B241D";
const SPRINKLES = ["#FFCF3F", "#7BC47F", "#FF7A6B", "#6FB7F2", "#B98BEA", "#F8DDCF"];
const svg = (vb: string, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;

export function svgSrc(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const parseHex = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const toHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;

/** Mix toward warm ink (f = 0..1): pattern inks and sticker shadows. */
export function darken(hex: string, f: number) {
  const ink = parseHex(INK);
  return toHex(parseHex(hex).map((v, i) => v + (ink[i] - v) * f));
}

/** Mix toward white (f = 0..1). */
export function lighten(hex: string, f: number) {
  return toHex(parseHex(hex).map((v) => v + (255 - v) * f));
}

/** White die-cut outline (4-way dilation) plus an optional hard drop shadow. */
export function stickerFilter(outline: number, color = "#FFFFFF", shadow?: string, drop = 16) {
  const o = Math.round(outline);
  const parts = [`drop-shadow(${o}px 0 0 ${color})`, `drop-shadow(-${o}px 0 0 ${color})`, `drop-shadow(0 ${o}px 0 ${color})`, `drop-shadow(0 -${o}px 0 ${color})`];
  if (shadow) parts.push(`drop-shadow(0 ${Math.round(drop)}px 0 ${shadow})`);
  return parts.join(" ");
}

export type PatternKind = "dots" | "polka" | "gingham" | "stripes" | "checker" | "waves" | "grid" | "stars" | "hearts" | "sprinkles" | "plain";

export function patternSvg(kind: PatternKind, base: string, ink: string, s: number, w: number, h: number) {
  let tile = "";
  let transform = "";
  const q = Math.round(s / 4);
  const tq = Math.round((s * 3) / 4);
  const half = Math.round(s / 2);
  switch (kind) {
    case "dots":
      tile = `<circle cx="${q}" cy="${q}" r="${Math.round(s * 0.08)}" fill="${ink}"/><circle cx="${tq}" cy="${tq}" r="${Math.round(s * 0.08)}" fill="${ink}"/>`;
      break;
    case "polka":
      tile = `<circle cx="${q}" cy="${q}" r="${Math.round(s * 0.15)}" fill="${ink}"/><circle cx="${tq}" cy="${tq}" r="${Math.round(s * 0.15)}" fill="${ink}"/>`;
      break;
    case "gingham":
      tile = `<rect width="${half}" height="${s}" fill="${ink}" opacity=".5"/><rect width="${s}" height="${half}" fill="${ink}" opacity=".5"/>`;
      break;
    case "stripes":
      tile = `<rect width="${half}" height="${s}" fill="${ink}"/>`;
      transform = "rotate(45)";
      break;
    case "checker":
      tile = `<rect width="${half}" height="${half}" fill="${ink}"/><rect x="${half}" y="${half}" width="${half}" height="${half}" fill="${ink}"/>`;
      break;
    case "waves":
      tile = `<path d="M0,${half} Q${q},${Math.round(s * 0.3)} ${half},${half} T${s},${half}" fill="none" stroke="${ink}" stroke-width="${Math.round(s * 0.07)}" stroke-linecap="round"/>`;
      break;
    case "grid":
      tile = `<path d="M${s},0 L0,0 0,${s}" fill="none" stroke="${ink}" stroke-width="3"/>`;
      break;
    case "stars": {
      const sp = (x: number, y: number, r: number) => `<path transform="translate(${x - r},${y - r}) scale(${(r * 2) / 100})" d="M50,4 C54,40 60,46 96,50 C60,54 54,60 50,96 C46,60 40,54 4,50 C40,46 46,40 50,4Z" fill="${ink}"/>`;
      tile = sp(q, q, Math.round(s * 0.09)) + sp(tq, tq, Math.round(s * 0.06));
      break;
    }
    case "hearts": {
      const hp = (x: number, y: number, r: number) => `<path transform="translate(${x - r},${y - r}) scale(${(r * 2) / 100})" d="M50,88 C20,66 6,48 6,32 C6,18 18,8 30,8 C40,8 47,14 50,22 C53,14 60,8 70,8 C82,8 94,18 94,32 C94,48 80,66 50,88Z" fill="${ink}"/>`;
      tile = hp(q, q, Math.round(s * 0.1)) + hp(tq, tq, Math.round(s * 0.1));
      break;
    }
    case "sprinkles":
      tile = ([[0.2, 0.2, 20], [0.7, 0.15, -40], [0.45, 0.5, 70], [0.15, 0.75, -10], [0.8, 0.7, 35]] as Array<[number, number, number]>)
        .map(([x, y, r], i) => `<rect x="${Math.round(x * s)}" y="${Math.round(y * s)}" width="${Math.round(s * 0.05)}" height="${Math.round(s * 0.15)}" rx="${Math.round(s * 0.025)}" fill="${SPRINKLES[i % SPRINKLES.length]}" opacity=".75" transform="rotate(${r} ${Math.round(x * s)} ${Math.round(y * s)})"/>`)
        .join("");
      break;
    case "plain":
      break;
  }
  return svg(
    `0 0 ${w} ${h}`,
    `<defs><pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse"${transform ? ` patternTransform="${transform}"` : ""}>${tile}</pattern></defs>`
      + `<rect width="${w}" height="${h}" fill="${base}"/>${kind === "plain" ? "" : `<rect width="${w}" height="${h}" fill="url(#p)"/>`}`,
  );
}

/** Pattern background layer (z 0) for any slide size. Only for flat hex backgrounds. */
export function SlidePattern({ kind, base, ink, size = 90, width, height }: { kind: PatternKind; base: string; ink?: string; size?: number; width: number; height: number }) {
  const src = useMemo(() => svgSrc(patternSvg(kind, base, ink ?? darken(base, 0.06), size, width, height)), [kind, base, ink, size, width, height]);
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, top: 0, width, height, maxWidth: "none", display: "block", zIndex: 0, pointerEvents: "none" }}
    />
  );
}

/** Pick a subtle default pattern for a flat background colour (deterministic, so a carousel stays consistent). */
export function defaultPatternFor(background: string): PatternKind | null {
  if (!/^#[0-9a-fA-F]{6}$/.test(background)) return null;
  const [r, g, b] = parseHex(background);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (lum < 0.45) return "stars";
  const light: PatternKind[] = ["dots", "grid", "waves"];
  return light[(r + g * 3 + b * 7) % light.length];
}
