import type { ReactNode } from "react";

/**
 * avatar: profile picture (1080², shown cropped to a circle).
 * app-icon: 1024², full bleed, masked by the OS.
 * cover: wide social banner (see COVER_FORMATS).
 * ios-header: App Store artwork (see IOS_HEADER_FORMATS).
 * link-preview: 1200×630 Open Graph card for one public page (see src/lib/marketing/link-previews.ts).
 * logo: transparent die-cut logo sticker for print (exported at LOGO_SCALE × its stage).
 */
export type BrandMarkKind = "avatar" | "app-icon" | "cover" | "ios-header" | "link-preview" | "logo";

/** Logo stickers: which list they sit in (also the folder in the zip). */
export type LogoSection = "bowl" | "wordmark" | "badge";

/** Logo stickers are drawn on a 1080-unit stage and exported at 3× (3240px ≈ 10.8 in at 300 dpi). */
export const LOGO_SCALE = 3;

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

export type IosHeaderFormat = "ios-16x9" | "ios-ultrawide";

type IosHeaderFormatSpec = {
  label: string;
  short: string;
  /** Exported PNG size. */
  width: number;
  height: number;
  /** Design units (output is exactly 2× the stage). */
  stage: { w: number; h: number };
  /** Keep faces and words in here: Apple may crop the sides and top on smaller layouts. */
  safe: Rect;
  /** Bottom band where the App Store may lay the app name and subtitle over the art. */
  overlay: Rect;
};

/**
 * App Store artwork. The safe zone and title band are our own conservative guesses (a centred ~70% × 64%
 * box with the bottom ~22% kept free), not published Apple numbers — tweak them here if Apple's template differs.
 */
export const IOS_HEADER_FORMATS: Record<IosHeaderFormat, IosHeaderFormatSpec> = {
  "ios-16x9": {
    label: "App Store artwork · 16:9",
    short: "16:9 · 5244×2950",
    width: 5244,
    height: 2950,
    stage: { w: 2622, h: 1475 },
    safe: { x: 393, y: 206, w: 1836, h: 944 },
    overlay: { x: 0, y: 1150, w: 2622, h: 325 },
  },
  "ios-ultrawide": {
    label: "App Store artwork · ultrawide",
    short: "Ultrawide · 3840×1646",
    width: 3840,
    height: 1646,
    stage: { w: 1920, h: 823 },
    safe: { x: 288, y: 115, w: 1344, h: 527 },
    overlay: { x: 0, y: 642, w: 1920, h: 181 },
  },
};

export const IOS_HEADER_FORMAT_ORDER: IosHeaderFormat[] = ["ios-16x9", "ios-ultrawide"];

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
  /** Covers and App Store artwork: the design these format variants share, and which format this one is. */
  concept?: string;
  format?: CoverFormat;
  /** App Store artwork: which size, and whether this is the art-only version. */
  iosFormat?: IosHeaderFormat;
  textless?: boolean;
  /** Link previews: the routes that use this card. */
  pages?: string[];
  /** Logo stickers: which list they sit in. */
  section?: LogoSection;
  render: () => ReactNode;
};
