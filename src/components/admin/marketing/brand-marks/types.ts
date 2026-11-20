import type { ReactNode } from "react";

/**
 * avatar: profile picture (1080², shown cropped to a circle).
 * app-icon: 1024², full bleed, masked by the OS.
 * cover: wide social banner (see COVER_FORMATS).
 */
export type BrandMarkKind = "avatar" | "app-icon" | "cover";

export type BrandMarkGroup = "everyday" | "crew" | "seasonal";

/** When to use a seasonal mark. `from` / `to` are "MM-DD"; a window may wrap the new year (12-26 → 01-10). */
export type BrandMarkSeason = { label: string; from: string; to: string };

export type Rect = { x: number; y: number; w: number; h: number };

export type CoverFormat = "facebook" | "linkedin-page" | "linkedin-profile";

type CoverFormatSpec = {
  label: string;
  short: string;
  width: number;
  height: number;
  /** Where copy should live: clear of the profile photo / logo and inside the mobile crop. */
  safe: Rect;
  /** Roughly where the platform draws the profile photo or page logo over the cover. */
  photo: Rect & { shape: "circle" | "square" };
  /** Facebook mobile shows only this horizontal slice of the cover. */
  mobile?: { x: number; w: number };
};

export const COVER_FORMATS: Record<CoverFormat, CoverFormatSpec> = {
  facebook: {
    label: "Facebook page cover",
    short: "Facebook",
    width: 1640,
    height: 624,
    safe: { x: 300, y: 40, w: 1040, h: 544 },
    photo: { x: 48, y: 470, w: 300, h: 300, shape: "circle" },
    mobile: { x: 265, w: 1110 },
  },
  "linkedin-page": {
    label: "LinkedIn company page",
    short: "LinkedIn page",
    width: 1128,
    height: 191,
    safe: { x: 236, y: 16, w: 872, h: 159 },
    photo: { x: 24, y: 100, w: 180, h: 180, shape: "square" },
  },
  "linkedin-profile": {
    label: "LinkedIn profile",
    short: "LinkedIn profile",
    width: 1584,
    height: 396,
    safe: { x: 430, y: 36, w: 1120, h: 324 },
    photo: { x: 48, y: 244, w: 304, h: 304, shape: "circle" },
  },
};

export const COVER_FORMAT_ORDER: CoverFormat[] = ["facebook", "linkedin-page", "linkedin-profile"];

/** Profile pictures and app icons are drawn on a 1080-unit square stage. */
export const SQUARE_STAGE = 1080;
export const SQUARE_OUTPUT: Record<"avatar" | "app-icon", number> = { avatar: 1080, "app-icon": 1024 };

export type BrandMark = {
  id: string;
  title: string;
  kind: BrandMarkKind;
  group: BrandMarkGroup;
  description?: string;
  season?: BrandMarkSeason;
  /** Stage background (also the fill behind the OS mask for app icons). */
  background: string;
  /** File name inside the download (e.g. `mint-dots.png`). */
  fileName: string;
  /** Exported PNG size. */
  width: number;
  height: number;
  /** Units the design is drawn in (scaled to width × height). */
  stage: { w: number; h: number };
  /** Covers: the design these format variants share, and which format this one is. */
  concept?: string;
  format?: CoverFormat;
  render: () => ReactNode;
};
