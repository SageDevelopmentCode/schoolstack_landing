"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import { renderMascotSvg, type MascotName, type MascotView } from "@/components/admin/marketing/mascot/storybook-art";
import { stickerFilter } from "@/components/admin/marketing/sticker";

export type { MascotName, MascotView };

/** When true, mascots draw as die-cut stickers (white outline + hard shadow, no ground patch). */
const MascotStickerContext = createContext(false);

export function MascotStickerProvider({ sticker, children }: { sticker: boolean; children: ReactNode }) {
  return <MascotStickerContext.Provider value={sticker}>{children}</MascotStickerContext.Provider>;
}

type MascotProps = {
  name: MascotName;
  view?: MascotView;
  /** Rendered width in px; height follows the 240×260 art box. */
  width: number;
  /** Grass-and-pebble patch under the feet (ignored for stickers). */
  ground?: boolean;
  /** Mirror horizontally (e.g. to point left). */
  flip?: boolean;
  /** Override the sticker look from context (`MascotStickerProvider`). */
  sticker?: boolean;
  style?: CSSProperties;
};

/**
 * One storybook crew character, drawn as an SVG data-URL image. An <img> (rather than inline SVG)
 * keeps html-to-image exports fast and avoids SVG id clashes between characters on one slide.
 */
export function Mascot({ name, view = "neutral", width, ground = true, flip = false, sticker, style }: MascotProps) {
  const contextSticker = useContext(MascotStickerContext);
  const isSticker = sticker ?? contextSticker;
  const src = useMemo(
    () =>
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        renderMascotSvg(name, view, isSticker ? { ground: false, shadow: false } : { ground }),
      )}`,
    [name, view, ground, isSticker],
  );
  const height = Math.round((width * 260) / 240);
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={width}
      height={height}
      style={{
        display: "block",
        width,
        height,
        flexShrink: 0,
        transform: flip ? "scaleX(-1)" : undefined,
        filter: isSticker ? stickerFilter(Math.max(3, Math.round(width / 70)), "#FFFFFF", "rgba(43,36,29,.28)", Math.max(4, Math.round(width / 40))) : undefined,
        ...style,
      }}
    />
  );
}
