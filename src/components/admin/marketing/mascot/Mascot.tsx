"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import { useMemo, type CSSProperties } from "react";
import { renderMascotSvg, type MascotName, type MascotView } from "@/components/admin/marketing/mascot/storybook-art";

export type { MascotName, MascotView };

type MascotProps = {
  name: MascotName;
  view?: MascotView;
  /** Rendered width in px; height follows the 240×260 art box. */
  width: number;
  /** Grass-and-pebble patch under the feet. */
  ground?: boolean;
  /** Mirror horizontally (e.g. to point left). */
  flip?: boolean;
  style?: CSSProperties;
};

/**
 * One storybook crew character, drawn as an SVG data-URL image. An <img> (rather than inline SVG)
 * keeps html-to-image exports fast and avoids SVG id clashes between characters on one slide.
 */
export function Mascot({ name, view = "neutral", width, ground = true, flip = false, style }: MascotProps) {
  const src = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderMascotSvg(name, view, { ground }))}`,
    [name, view, ground],
  );
  const height = Math.round((width * 260) / 240);
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={width}
      height={height}
      style={{ display: "block", width, height, flexShrink: 0, transform: flip ? "scaleX(-1)" : undefined, ...style }}
    />
  );
}
