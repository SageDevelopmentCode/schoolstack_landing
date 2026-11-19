"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import { useMemo, type CSSProperties, type ReactNode } from "react";
import { gardenFontVariables } from "@/components/garden/fonts";
import { Mascot, type MascotName, type MascotView } from "@/components/admin/marketing/mascot/Mascot";
import { FONT, G } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import type { Rect } from "@/components/admin/marketing/brand-marks/types";

// Sticker kit for profile pictures, app icons and covers. The house look: the bowl (and friends) as a
// die-cut sticker — white outline + hard tinted shadow — on a soft pastel pattern.
// Pure graphics are SVG data-URL <img>s (fast html-to-image exports, no id clashes); text is DOM so it
// uses the Garden fonts. Keep style numbers whole so SSR and client markup match.

export const STAGE = 1080;
export const CENTER = STAGE / 2;
export const INK = G.ink;
export const BERRY = "#C2563F";
export const PINE = "#3F6B4F";
export const PUMPKIN = "#E8823A";
export const NIGHT = "#2A2238";
export const CHALK = "#24382E";
export const ROSE = "#F4C6C0";
export const SKY_BLUE = "#6FB7F2";
export const NAVY = "#3B6FB6";
export const LEAF_COLORS = ["#D9692F", "#C2563F", "#E8A33A", "#B5722E", "#8E9A4B"];
export const CONFETTI_COLORS = ["#FFCF3F", "#7BC47F", "#FF7A6B", "#6FB7F2", "#B98BEA", G.peach];

export const PASTEL = {
  mint: G.mint,
  butter: G.butter,
  peach: G.peach,
  sky: G.sky,
  lav: G.lav,
  rose: ROSE,
  cream: G.cream,
  sage: "#D5E3CB",
  winter: "#E7EFF8",
  apricot: "#FCE3C8",
  sand: "#F3E3CC",
} as const;

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

// ---------------------------------------------------------------- stage

/** Design surface: `width × height` px out, `stageW × stageH` units in. */
export function MarkStage({
  width,
  height,
  stageW = STAGE,
  stageH = STAGE,
  background,
  children,
}: {
  width: number;
  height: number;
  stageW?: number;
  stageH?: number;
  background: string;
  children: ReactNode;
}) {
  const scale = width / stageW;
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", background }}>
      <div
        className={gardenFontVariables}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: stageW,
          height: stageH,
          transform: scale === 1 ? undefined : `scale(${scale})`,
          transformOrigin: "top left",
          fontFamily: FONT.body,
          color: INK,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Full-stage layer. */
export function Layer({ children, z = 1, style }: { children?: ReactNode; z?: number; style?: CSSProperties }) {
  return <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: z, ...style }}>{children}</div>;
}

/** An SVG drawn as an <img>, centred on (x, y). */
export function Art({ svg, x, y, w, h, rotate = 0, z = 2, opacity, flip }: { svg: string; x: number; y: number; w: number; h?: number; rotate?: number; z?: number; opacity?: number; flip?: boolean }) {
  const src = useMemo(() => svgSrc(svg), [svg]);
  const height = h ?? w;
  const transforms = [rotate ? `rotate(${rotate}deg)` : "", flip ? "scaleX(-1)" : ""].filter(Boolean).join(" ");
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={w}
      height={height}
      style={{ position: "absolute", left: x - w / 2, top: y - height / 2, width: w, height, zIndex: z, opacity, transform: transforms || undefined, display: "block", maxWidth: "none" }}
    />
  );
}

// ---------------------------------------------------------------- sticker

/** White die-cut outline (4-way dilation) plus an optional hard drop shadow. */
export function stickerFilter(outline: number, color = "#FFFFFF", shadow?: string, drop = 16) {
  const o = Math.round(outline);
  const parts = [`drop-shadow(${o}px 0 0 ${color})`, `drop-shadow(-${o}px 0 0 ${color})`, `drop-shadow(0 ${o}px 0 ${color})`, `drop-shadow(0 -${o}px 0 ${color})`];
  if (shadow) parts.push(`drop-shadow(0 ${Math.round(drop)}px 0 ${shadow})`);
  return parts.join(" ");
}

type StickerProps = {
  children: ReactNode;
  /** Degrees; rotates around (cx, cy) while the shadow stays straight down. */
  tilt?: number;
  cx?: number;
  cy?: number;
  outline?: number;
  outlineColor?: string;
  shadow?: string;
  drop?: number;
  z?: number;
};

/** Everything inside becomes ONE sticker: a shared outline and shadow (bowl + hat + apple…). */
export function Sticker({ children, tilt = 0, cx = CENTER, cy = CENTER, outline = 7, outlineColor = "#FFFFFF", shadow, drop = 16, z = 3 }: StickerProps) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: z, filter: stickerFilter(outline, outlineColor, shadow, drop) }}>
      <div style={{ position: "absolute", inset: 0, transform: tilt ? `rotate(${tilt}deg)` : undefined, transformOrigin: `${Math.round(cx)}px ${Math.round(cy)}px` }}>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the bowl

// Logo.png is 512² with the art in the box x 102–410, y 94–406. BowlLogo crops to that box so
// `width` is the width of the bowl art itself, and its children draw in that box's 308×312 units.
const LOGO = { src: "/images/Logo.png", size: 512, x: 102, y: 94, w: 308, h: 312 } as const;
export const BOWL_BOX = { w: LOGO.w, h: LOGO.h } as const;
/** Handy points on the bowl, in BowlLogo child units. */
export const BOWL = {
  spoonTip: { x: 270, y: 14 },
  /** The spoon leans this many degrees right of vertical. */
  spoonAngle: 32,
  sproutTop: { x: 88, y: 8 },
  rimLeft: { x: 4, y: 132 },
  rimRight: { x: 302, y: 132 },
  face: { x: 154, y: 222 },
} as const;

export const bowlHeight = (width: number) => Math.round((width * LOGO.h) / LOGO.w);

/** The logo art only (no outline). Children draw in 308×312 bowl units (see BOWL). */
export function BowlLogo({ cx = CENTER, cy = CENTER, width, z = 3, children }: { cx?: number; cy?: number; width: number; z?: number; children?: ReactNode }) {
  const k = width / LOGO.w;
  const height = LOGO.h * k;
  return (
    <div style={{ position: "absolute", left: Math.round(cx - width / 2), top: Math.round(cy - height / 2), width, height: Math.round(height), zIndex: z }}>
      <img
        src={LOGO.src}
        alt=""
        aria-hidden
        width={Math.round(LOGO.size * k)}
        height={Math.round(LOGO.size * k)}
        style={{ position: "absolute", left: Math.round(-LOGO.x * k), top: Math.round(-LOGO.y * k), width: Math.round(LOGO.size * k), height: Math.round(LOGO.size * k), maxWidth: "none", display: "block" }}
      />
      {children ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: LOGO.w, height: LOGO.h, transform: `scale(${k})`, transformOrigin: "top left" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

type BowlStickerProps = {
  cx?: number;
  cy?: number;
  /** Width of the bowl art (≈700 of 1080 for avatars). */
  width: number;
  tilt?: number;
  /** Sticker shadow colour (usually a darker shade of the background). */
  shadow?: string;
  outline?: number;
  outlineColor?: string;
  drop?: number;
  z?: number;
  /** Accessories in bowl units (see BOWL) — they share the bowl's sticker outline. */
  children?: ReactNode;
  /** Extra pieces in stage units that are part of the same sticker (pencil under the bowl…). */
  around?: ReactNode;
};

export function BowlSticker({ cx = CENTER, cy = CENTER, width, tilt = -6, shadow, outline, outlineColor, drop, z = 3, children, around }: BowlStickerProps) {
  const scale = width / 700;
  return (
    <Sticker
      tilt={tilt}
      cx={cx}
      cy={cy}
      outline={outline ?? Math.max(3, Math.round(8 * scale))}
      outlineColor={outlineColor}
      shadow={shadow}
      drop={drop ?? Math.max(4, Math.round(18 * scale))}
      z={z}
    >
      {around}
      <BowlLogo cx={cx} cy={cy} width={width}>{children}</BowlLogo>
    </Sticker>
  );
}

/** A crew character centred on (cx, cy) — no ground patch. */
export function MascotAt({ name, view = "happy", cx, cy, width, flip, z = 3 }: { name: MascotName; view?: MascotView; cx: number; cy: number; width: number; flip?: boolean; z?: number }) {
  const height = Math.round((width * 260) / 240);
  return (
    <Mascot
      name={name}
      view={view}
      width={width}
      ground={false}
      flip={flip}
      style={{ position: "absolute", left: Math.round(cx - width / 2), top: Math.round(cy - height / 2), zIndex: z }}
    />
  );
}

export function MascotSticker({ tilt = 0, shadow, outlineColor, outline, z = 3, ...mascot }: { name: MascotName; view?: MascotView; cx: number; cy: number; width: number; flip?: boolean; tilt?: number; shadow?: string; outlineColor?: string; outline?: number; z?: number }) {
  const scale = mascot.width / 600;
  return (
    <Sticker
      tilt={tilt}
      cx={mascot.cx}
      cy={mascot.cy}
      outline={outline ?? Math.max(3, Math.round(8 * scale))}
      outlineColor={outlineColor}
      shadow={shadow}
      drop={Math.max(4, Math.round(16 * scale))}
      z={z}
    >
      <MascotAt {...mascot} />
    </Sticker>
  );
}

export type BowlMood = "happy" | "love" | "jack" | "sleepy" | "wink";

/** A little face on the bowl body. */
export function BowlFace({ mood = "happy" }: { mood?: BowlMood }) {
  return <Art svg={faceSvg(mood)} x={LOGO.w / 2} y={LOGO.h / 2} w={LOGO.w} h={LOGO.h} z={2} />;
}

function faceSvg(mood: BowlMood) {
  const line = "#5B2414";
  const wrap = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO.w} ${LOGO.h}">${body}</svg>`;
  const blush = `<ellipse cx="96" cy="236" rx="15" ry="8" fill="#FF8A73" opacity=".55"/><ellipse cx="212" cy="236" rx="15" ry="8" fill="#FF8A73" opacity=".55"/>`;
  const smile = `<path d="M136,236 Q154,254 172,236" fill="none" stroke="${line}" stroke-width="6" stroke-linecap="round"/>`;
  const dot = (x: number) => `<circle cx="${x}" cy="214" r="10" fill="${line}"/><circle cx="${x + 3}" cy="210" r="3.4" fill="#fff"/>`;
  if (mood === "jack") {
    const carve = "#3A1A0C";
    const glow = `stroke="#FFCF3F" stroke-width="3" stroke-linejoin="round"`;
    return wrap(
      `<polygon points="100,220 138,220 119,192" fill="${carve}" ${glow}/><polygon points="170,220 208,220 189,192" fill="${carve}" ${glow}/>`
        + `<polygon points="146,234 162,234 154,222" fill="${carve}" ${glow}/>`
        + `<path d="M90,240 Q154,290 218,240 L206,248 L196,240 L184,254 L170,244 L154,258 L138,244 L124,254 L112,240 L102,248 Z" fill="${carve}" ${glow}/>`,
    );
  }
  if (mood === "love") {
    const heart = (x: number) => `<path transform="translate(${x - 13},200)" d="M13,26 C4,19 0,13 0,8 C0,3 4,0 8,0 C10,0 12,2 13,4 C14,2 16,0 18,0 C22,0 26,3 26,8 C26,13 22,19 13,26Z" fill="${BERRY}" stroke="${line}" stroke-width="2.5"/>`;
    return wrap(heart(122) + heart(186) + blush + smile);
  }
  if (mood === "sleepy") {
    const shut = (x: number) => `<path d="M${x - 11},214 Q${x},222 ${x + 11},214" fill="none" stroke="${line}" stroke-width="6" stroke-linecap="round"/>`;
    return wrap(shut(122) + shut(186) + blush + `<ellipse cx="154" cy="240" rx="7" ry="5" fill="${line}"/>`);
  }
  if (mood === "wink") {
    return wrap(dot(122) + `<path d="M175,214 Q186,206 197,214" fill="none" stroke="${line}" stroke-width="6" stroke-linecap="round"/>` + blush + smile);
  }
  return wrap(dot(122) + dot(186) + blush + smile);
}

// ---------------------------------------------------------------- accessories (viewBoxes noted per piece)

const svg = (vb: string, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const S = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;

function buntingSvg() {
  const colors = [BERRY, "#FFFFFF", NAVY];
  const at = (t: number) => {
    const x = (1 - t) ** 2 * 10 + 2 * (1 - t) * t * 400 + t ** 2 * 790;
    const y = (1 - t) ** 2 * 24 + 2 * (1 - t) * t * 110 + t ** 2 * 24;
    return [Math.round(x), Math.round(y)];
  };
  const flags = Array.from({ length: 9 }, (_, i) => {
    const [x, y] = at(0.07 + i * 0.107);
    const fill = colors[i % 3];
    const star = fill === NAVY ? `<circle cx="${x}" cy="${y + 22}" r="6" fill="#fff"/>` : "";
    return `<path d="M${x - 34},${y} L${x + 34},${y} L${x},${y + 66} Z" fill="${fill}" ${S} stroke-width="4"/>${star}`;
  }).join("");
  return svg("0 0 800 180", `<path d="M10,24 Q400,110 790,24" fill="none" stroke="${INK}" stroke-width="5"/>${flags}`);
}

export const ART = {
  /** 200×200; fur band centred near (100,163). */
  santaHat: svg(
    "0 0 200 200",
    `<path d="M34,152 C44,96 82,46 138,34 C168,28 190,46 184,76 C172,66 160,68 156,80 C150,104 160,128 168,152 Z" fill="${BERRY}" ${S} stroke-width="7"/>`
      + `<path d="M62,142 C72,104 96,72 130,58" fill="none" stroke="#E07A5F" stroke-width="9" stroke-linecap="round" opacity=".7"/>`
      + `<rect x="16" y="140" width="170" height="46" rx="23" fill="#fff" ${S} stroke-width="7"/>`
      + `<circle cx="184" cy="80" r="22" fill="#fff" ${S} stroke-width="7"/>`,
  ),
  /** 160×210; base centred near (80,186). */
  partyHat: svg(
    "0 0 160 210",
    `<defs><clipPath id="ph"><path d="M20,190 L80,26 L140,190 Z"/></clipPath></defs>`
      + `<path d="M20,190 L80,26 L140,190 Z" fill="${G.butter}"/>`
      + `<g clip-path="url(#ph)"><path d="M0,90 L160,60 L160,80 L0,110Z M0,140 L160,110 L160,130 L0,160Z" fill="#FF7A6B"/><circle cx="62" cy="168" r="7" fill="#6FB7F2"/><circle cx="104" cy="150" r="6" fill="#7BC47F"/><circle cx="84" cy="98" r="5" fill="#6FB7F2"/></g>`
      + `<path d="M20,190 L80,26 L140,190 Z" fill="none" ${S} stroke-width="7"/>`
      + `<circle cx="80" cy="22" r="17" fill="#B98BEA" ${S} stroke-width="6"/>`,
  ),
  /** 240×190; cap base centred near (120,130). */
  gradCap: svg(
    "0 0 240 190",
    `<path d="M64,76 L64,128 Q120,154 176,128 L176,76 Z" fill="#3A322A" ${S} stroke-width="7"/>`
      + `<polygon points="120,18 230,60 120,102 10,60" fill="${INK}" ${S} stroke-width="7"/>`
      + `<path d="M120,60 L206,74 L206,128" fill="none" stroke="${G.butter}" stroke-width="6" stroke-linecap="round"/>`
      + `<path d="M196,124 L216,124 L222,164 L190,164 Z" fill="${G.butter}" ${S} stroke-width="5"/>`
      + `<circle cx="120" cy="60" r="8" fill="${G.butter}"/>`,
  ),
  /** 200×180; band centred near (100,140). */
  beanie: svg(
    "0 0 200 180",
    `<path d="M28,128 C24,58 176,58 172,128 Z" fill="${BERRY}" ${S} stroke-width="7"/>`
      + `<path d="M44,98 Q100,74 156,98" stroke="#fff" stroke-width="10" fill="none" opacity=".85"/>`
      + `<rect x="16" y="116" width="168" height="48" rx="18" fill="${G.butter}" ${S} stroke-width="7"/>`
      + [36, 56, 76, 96, 116, 136, 156].map((x) => `<path d="M${x},126 v28" stroke="#E2B83A" stroke-width="4" stroke-linecap="round"/>`).join("")
      + `<circle cx="100" cy="42" r="26" fill="#fff" ${S} stroke-width="7"/>`,
  ),
  /** 100×120. */
  mitten: svg(
    "0 0 100 120",
    `<path d="M26,104 L26,62 C10,58 6,40 16,32 C24,26 32,32 32,40 L32,28 C32,6 76,6 76,30 L76,104 Z" fill="${BERRY}" ${S} stroke-width="6"/>`
      + `<circle cx="54" cy="52" r="7" fill="#fff" opacity=".8"/>`
      + `<rect x="20" y="92" width="62" height="24" rx="8" fill="#fff" ${S} stroke-width="6"/>`,
  ),
  /** 220×80. */
  sunglasses: svg(
    "0 0 220 80",
    `<path d="M96,30 Q110,22 124,30" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`
      + `<rect x="8" y="14" width="92" height="56" rx="24" fill="${INK}"/><rect x="120" y="14" width="92" height="56" rx="24" fill="${INK}"/>`
      + `<path d="M26,30 L46,30 M138,30 L158,30" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".75"/>`,
  ),
  /** 320×160; wraps the bowl just under the rim, tail on the right. */
  scarf: svg(
    "0 0 320 160",
    `<path d="M216,40 L262,40 L276,150 L238,154 Z" fill="${BERRY}" ${S} stroke-width="6"/>`
      + `<path d="M240,154 l2,-10 M252,152 l1,-10 M264,151 l0,-10" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
      + `<path d="M226,80 L268,78 M230,112 L272,110" stroke="#fff" stroke-width="8" opacity=".85"/>`
      + `<path d="M8,10 Q160,40 312,10 L306,52 Q160,82 14,52 Z" fill="${BERRY}" ${S} stroke-width="6"/>`
      + `<path d="M40,30 Q160,56 280,30" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="18 14" opacity=".85"/>`,
  ),
  /** 160×80. */
  bowtie: svg(
    "0 0 160 80",
    `<path d="M80,40 L16,10 C6,30 6,50 16,70 Z" fill="${SKY_BLUE}" ${S} stroke-width="6"/><path d="M80,40 L144,10 C154,30 154,50 144,70 Z" fill="${SKY_BLUE}" ${S} stroke-width="6"/>`
      + `<circle cx="34" cy="30" r="5" fill="#fff"/><circle cx="40" cy="52" r="5" fill="#fff"/><circle cx="126" cy="30" r="5" fill="#fff"/><circle cx="120" cy="52" r="5" fill="#fff"/>`
      + `<rect x="66" y="24" width="28" height="32" rx="8" fill="${NAVY}" ${S} stroke-width="6"/>`,
  ),
  /** 200×200. */
  sun: svg(
    "0 0 200 200",
    Array.from({ length: 12 }, (_, i) => `<path d="M100,14 L100,40" transform="rotate(${i * 30} 100 100)" stroke="#F2B53A" stroke-width="10" stroke-linecap="round"/>`).join("")
      + `<circle cx="100" cy="100" r="50" fill="${G.butter}" ${S} stroke-width="7"/>`,
  ),
  /** 100×100. */
  moon: svg("0 0 100 100", `<path d="M66,10 A42,42 0 1,0 90,74 A34,34 0 1,1 66,10 Z" fill="${G.butter}" ${S} stroke-width="4"/>`),
  /** 100×110. */
  apple: svg(
    "0 0 100 110",
    `<path d="M50,34 C30,20 6,30 8,60 C10,90 30,108 50,100 C70,108 90,90 92,60 C94,30 70,20 50,34Z" fill="${BERRY}" ${S} stroke-width="5"/>`
      + `<path d="M24,52 C22,62 24,72 28,78" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".55"/>`
      + `<path d="M50,34 C50,22 54,14 60,8" fill="none" stroke="#6B4A2A" stroke-width="6" stroke-linecap="round"/>`
      + `<path d="M56,22 C62,8 80,6 86,14 C78,26 64,28 56,22Z" fill="#7BC47F" ${S} stroke-width="4"/>`,
  ),
  /** 320×70, pointing left. */
  pencil: svg(
    "0 0 320 70",
    `<rect x="52" y="12" width="206" height="46" fill="${G.butter}" ${S} stroke-width="5"/>`
      + `<path d="M52,27 L258,27 M52,43 L258,43" stroke="#E2B83A" stroke-width="4"/>`
      + `<rect x="258" y="10" width="24" height="50" fill="#B9B2A8" ${S} stroke-width="5"/>`
      + `<path d="M282,10 L304,10 Q316,10 316,22 L316,48 Q316,60 304,60 L282,60 Z" fill="#F4A6A0" ${S} stroke-width="5"/>`
      + `<path d="M52,12 L8,35 L52,58 Z" fill="#E8C49A" ${S} stroke-width="5"/><path d="M8,35 L22,28 L22,42 Z" fill="${INK}"/>`,
  ),
  /** 120×110. */
  pumpkin: svg(
    "0 0 120 110",
    `<ellipse cx="34" cy="64" rx="28" ry="38" fill="${PUMPKIN}" ${S} stroke-width="5"/><ellipse cx="86" cy="64" rx="28" ry="38" fill="${PUMPKIN}" ${S} stroke-width="5"/>`
      + `<ellipse cx="60" cy="64" rx="30" ry="42" fill="#F09A4E" ${S} stroke-width="5"/>`
      + `<path d="M58,24 Q56,12 64,4" fill="none" stroke="#4F7A3A" stroke-width="9" stroke-linecap="round"/>`,
  ),
  /** 100×120. */
  acorn: svg(
    "0 0 100 120",
    `<path d="M18,52 C18,90 40,112 50,114 C60,112 82,90 82,52 Z" fill="#C98A4B" ${S} stroke-width="6"/>`
      + `<path d="M30,66 C30,82 38,94 44,98" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/>`
      + `<path d="M10,54 C10,26 90,26 90,54 C70,62 30,62 10,54Z" fill="#8A5A33" ${S} stroke-width="6"/>`
      + `<path d="M26,40 L40,52 M44,34 L58,48 M62,34 L74,46" stroke="#6B4224" stroke-width="3" stroke-linecap="round"/>`
      + `<path d="M50,30 Q52,16 62,10" stroke="#6B4A2A" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  ),
  /** 100×64. */
  bat: svg(
    "0 0 100 64",
    `<path d="M50,26 C46,16 40,14 36,18 C30,8 16,6 4,14 C14,18 18,26 16,36 C24,30 32,32 36,40 C40,34 46,34 50,42 C54,34 60,34 64,40 C68,32 76,30 84,36 C82,26 86,18 96,14 C84,6 70,8 64,18 C60,14 54,16 50,26Z" fill="#7A66A0"/>`
      + `<path d="M44,22 L42,12 L48,18 M56,22 L58,12 L52,18" fill="#7A66A0" stroke="#7A66A0" stroke-width="3" stroke-linejoin="round"/>`
      + `<circle cx="46" cy="26" r="1.8" fill="${G.butter}"/><circle cx="54" cy="26" r="1.8" fill="${G.butter}"/>`,
  ),
  /** 280×140. */
  books: svg(
    "0 0 280 140",
    `<rect x="14" y="94" width="252" height="40" rx="6" fill="${BERRY}" ${S} stroke-width="5"/><path d="M40,114 L230,114" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/>`
      + `<rect x="34" y="56" width="214" height="38" rx="6" fill="${SKY_BLUE}" ${S} stroke-width="5"/><rect x="196" y="56" width="18" height="38" fill="${G.butter}" ${S} stroke-width="4"/>`
      + `<g transform="rotate(-3 135 36)"><rect x="22" y="18" width="226" height="36" rx="6" fill="${G.butter}" ${S} stroke-width="5"/><path d="M48,36 L170,36" stroke="${BERRY}" stroke-width="4" stroke-linecap="round"/></g>`,
  ),
  /** 100×100. */
  globe: svg(
    "0 0 100 100",
    `<circle cx="50" cy="50" r="44" fill="${SKY_BLUE}" ${S} stroke-width="5"/>`
      + `<path d="M22,34 C30,24 44,26 46,36 C48,46 36,48 34,58 C32,66 22,64 18,54 C16,46 16,40 22,34Z" fill="#7BC47F" ${S} stroke-width="3"/>`
      + `<path d="M58,20 C68,18 80,26 82,36 C76,40 68,36 62,42 C56,46 52,36 58,20Z" fill="#7BC47F" ${S} stroke-width="3"/>`
      + `<path d="M60,62 C70,58 80,64 76,74 C72,82 62,84 58,76 C56,70 56,64 60,62Z" fill="#7BC47F" ${S} stroke-width="3"/>`
      + `<path d="M24,22 Q34,12 46,10" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`,
  ),
  /** 220×170. */
  camera: svg(
    "0 0 220 170",
    `<path d="M70,44 L82,20 L138,20 L150,44 Z" fill="${NAVY}" ${S} stroke-width="7"/>`
      + `<rect x="30" y="30" width="30" height="16" rx="5" fill="${BERRY}" ${S} stroke-width="5"/>`
      + `<rect x="12" y="44" width="196" height="114" rx="22" fill="${SKY_BLUE}" ${S} stroke-width="7"/>`
      + `<circle cx="110" cy="102" r="44" fill="#fff" ${S} stroke-width="7"/><circle cx="110" cy="102" r="28" fill="${INK}"/><circle cx="100" cy="92" r="9" fill="#fff" opacity=".85"/>`
      + `<rect x="158" y="58" width="34" height="18" rx="5" fill="${G.butter}" ${S} stroke-width="5"/>`,
  ),
  /** 160×220; rosette centred near (80,80). */
  rosette: svg(
    "0 0 160 220",
    `<path d="M54,110 L34,206 L58,188 L74,212 L84,116 Z" fill="${NAVY}" ${S} stroke-width="6"/><path d="M106,110 L126,206 L102,188 L86,212 L76,116 Z" fill="${NAVY}" ${S} stroke-width="6"/>`
      + Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return `<circle cx="${Math.round(80 + 58 * Math.cos(a))}" cy="${Math.round(80 + 58 * Math.sin(a))}" r="19" fill="${SKY_BLUE}" ${S} stroke-width="5"/>`;
      }).join("")
      + `<circle cx="80" cy="80" r="60" fill="${SKY_BLUE}"/><circle cx="80" cy="80" r="40" fill="${G.butter}" ${S} stroke-width="6"/>`
      + `<path d="M80,56 L87,73 L105,74 L91,86 L96,104 L80,94 L64,104 L69,86 L55,74 L73,73 Z" fill="${BERRY}" ${S} stroke-width="3"/>`,
  ),
  /** 220×260; stems end at bottom centre (110,258). */
  tulips: svg(
    "0 0 220 260",
    `<path d="M110,258 C108,200 80,150 64,96 M110,258 C110,190 110,140 110,70 M110,258 C114,200 140,150 156,100" stroke="#4F9D3F" stroke-width="8" fill="none" stroke-linecap="round"/>`
      + `<path d="M110,222 C80,204 70,172 76,150 C96,160 108,192 110,222Z" fill="#7BC47F" ${S} stroke-width="4"/><path d="M110,222 C140,204 150,172 144,150 C124,160 112,192 110,222Z" fill="#7BC47F" ${S} stroke-width="4"/>`
      + ([[64, 96, BERRY], [110, 70, "#F28CA0"], [156, 100, G.butter]] as Array<[number, number, string]>)
        .map(([cx, cy, c]) => `<path d="M${cx - 22},${cy} C${cx - 26},${cy - 30} ${cx - 14},${cy - 44} ${cx - 8},${cy - 34} L${cx},${cy - 46} L${cx + 8},${cy - 34} C${cx + 14},${cy - 44} ${cx + 26},${cy - 30} ${cx + 22},${cy} C${cx + 16},${cy + 16} ${cx - 16},${cy + 16} ${cx - 22},${cy} Z" fill="${c}" ${S} stroke-width="5"/>`)
        .join(""),
  ),
  /** 800×180 — flags hang below the string. */
  bunting: buntingSvg(),
  /** Chalk outline star, 100×100. */
  chalkStar: svg("0 0 100 100", `<path d="M50,8 L61,38 L94,39 L68,59 L77,91 L50,72 L23,91 L32,59 L6,39 L39,38 Z" fill="none" stroke="#F4EFE6" stroke-width="5" stroke-linejoin="round" opacity=".9"/>`),
} as const;

// Small scatter pieces, each 100×100 and tinted per call.
export const PIECE = {
  maple: (fill: string) => svg("0 0 100 100", `<path d="M50,4 L58,26 L72,18 L68,40 L90,36 L80,52 L94,60 L70,66 L74,82 L54,74 L52,96 L48,96 L46,74 L26,82 L30,66 L6,60 L20,52 L10,36 L32,40 L28,18 L42,26 Z" fill="${fill}" ${S} stroke-width="4"/>`),
  leaf: (fill: string) => svg("0 0 100 100", `<path d="M50,6 C80,26 84,66 50,94 C16,66 20,26 50,6Z" fill="${fill}" ${S} stroke-width="4"/><path d="M50,18 L50,86" stroke="${INK}" stroke-width="3" opacity=".6"/>`),
  heart: (fill: string) => svg("0 0 100 100", `<path d="M50,88 C20,66 6,48 6,32 C6,18 18,8 30,8 C40,8 47,14 50,22 C53,14 60,8 70,8 C82,8 94,18 94,32 C94,48 80,66 50,88Z" fill="${fill}" ${S} stroke-width="5"/>`),
  blossom: (fill: string) => svg(
    "0 0 100 100",
    Array.from({ length: 5 }, (_, i) => `<ellipse cx="50" cy="26" rx="16" ry="22" fill="${fill}" ${S} stroke-width="3.5" transform="rotate(${i * 72} 50 50)"/>`).join("")
      + `<circle cx="50" cy="50" r="12" fill="${G.butter}" ${S} stroke-width="3.5"/>`,
  ),
  flake: (fill: string) => svg(
    "0 0 100 100",
    [0, 60, 120].map((a) => `<g transform="rotate(${a} 50 50)"><path d="M50,8 L50,92 M50,22 L40,12 M50,22 L60,12 M50,78 L40,88 M50,78 L60,88" stroke="${fill}" stroke-width="7" stroke-linecap="round" fill="none"/></g>`).join(""),
  ),
  dot: (fill: string) => svg("0 0 100 100", `<circle cx="50" cy="50" r="44" fill="${fill}"/>`),
  star: (fill: string) => svg("0 0 100 100", `<path d="M50,6 L62,38 L96,39 L69,60 L79,94 L50,74 L21,94 L31,60 L4,39 L38,38 Z" fill="${fill}" ${S} stroke-width="4"/>`),
  sparkle: (fill: string) => svg("0 0 100 100", `<path d="M50,4 C54,40 60,46 96,50 C60,54 54,60 50,96 C46,60 40,54 4,50 C40,46 46,40 50,4Z" fill="${fill}"/>`),
  confetti: (fill: string) => svg("0 0 100 100", `<rect x="34" y="14" width="32" height="72" rx="8" fill="${fill}"/>`),
  squiggle: (fill: string) => svg("0 0 100 100", `<path d="M10,60 Q25,30 40,55 T70,50 T95,40" fill="none" stroke="${fill}" stroke-width="12" stroke-linecap="round"/>`),
  shamrock: (fill: string) => svg(
    "0 0 100 100",
    `<path d="M50,54 Q56,76 68,92" fill="none" stroke="#3F7E33" stroke-width="7" stroke-linecap="round"/>`
      + [0, 120, 240].map((a) => `<path transform="rotate(${a} 50 50)" d="M50,50 C38,42 30,34 30,26 C30,18 36,14 42,14 C46,14 49,17 50,20 C51,17 54,14 58,14 C64,14 70,18 70,26 C70,34 62,42 50,50Z" fill="${fill}" ${S} stroke-width="4"/>`).join(""),
  ),
  coin: (fill: string) => svg("0 0 100 100", `<circle cx="50" cy="50" r="42" fill="${fill}" ${S} stroke-width="5"/><circle cx="50" cy="50" r="28" fill="none" stroke="#fff" stroke-width="5" opacity=".6"/>`),
  egg: (fill: string) => svg(
    "0 0 100 100",
    `<path d="M50,6 C72,6 86,42 86,62 C86,84 70,96 50,96 C30,96 14,84 14,62 C14,42 28,6 50,6Z" fill="${fill}" ${S} stroke-width="4"/>`
      + `<path d="M18,56 L28,48 L38,56 L50,48 L62,56 L72,48 L82,56" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>`
      + `<circle cx="34" cy="76" r="5" fill="#fff"/><circle cx="52" cy="80" r="5" fill="#fff"/><circle cx="68" cy="74" r="5" fill="#fff"/>`,
  ),
  cloud: (fill: string) => svg("0 0 100 100", `<path d="M24,72 C8,72 4,58 12,50 C8,36 26,28 36,34 C42,20 64,18 70,32 C84,26 98,38 92,52 C102,56 98,72 84,72 Z" fill="${fill}" ${S} stroke-width="4"/>`),
  firework: (fill: string) => svg(
    "0 0 100 100",
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const px = (r: number) => Math.round(50 + r * Math.cos(a));
      const py = (r: number) => Math.round(50 + r * Math.sin(a));
      return `<path d="M${px(14)},${py(14)} L${px(38)},${py(38)}" stroke="${fill}" stroke-width="6" stroke-linecap="round"/><circle cx="${px(46)}" cy="${py(46)}" r="4" fill="${fill}"/>`;
    }).join(""),
  ),
} as const;

export type PieceName = keyof typeof PIECE;

// ---------------------------------------------------------------- pattern backgrounds

export type PatternKind = "dots" | "polka" | "gingham" | "stripes" | "checker" | "waves" | "grid" | "stars" | "hearts" | "sprinkles" | "plain";

function patternSvg(kind: PatternKind, base: string, ink: string, s: number, w: number, h: number) {
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
        .map(([x, y, r], i) => `<rect x="${Math.round(x * s)}" y="${Math.round(y * s)}" width="${Math.round(s * 0.05)}" height="${Math.round(s * 0.15)}" rx="${Math.round(s * 0.025)}" fill="${CONFETTI_COLORS[i % CONFETTI_COLORS.length]}" opacity=".75" transform="rotate(${r} ${Math.round(x * s)} ${Math.round(y * s)})"/>`)
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

/** Full-stage pastel pattern. `ink` defaults to a slightly darker shade of `base`. */
export function Pattern({ kind, base, ink, size = 90, w = STAGE, h = STAGE }: { kind: PatternKind; base: string; ink?: string; size?: number; w?: number; h?: number }) {
  const markup = patternSvg(kind, base, ink ?? darken(base, 0.07), size, w, h);
  return (
    <Layer z={0}>
      <Art svg={markup} x={w / 2} y={h / 2} w={w} h={h} z={0} />
    </Layer>
  );
}

// ---------------------------------------------------------------- scatter

/** Fixed pseudo-random numbers so every export is identical. */
const hash = (i: number, n: number, seed: number) => ((Math.sin(i * 127.1 + n * 311.7 + seed * 74.7) * 43758.5453) % 1 + 1) % 1;

type ScatterProps = {
  pieces: PieceName[];
  colors: string[];
  count: number;
  seed?: number;
  /** Keep this radius around (cx, cy) clear for the hero. */
  clear?: number;
  /** Stay inside this radius of (cx, cy) (≈ the circle crop). */
  within?: number;
  /** Rectangles to keep clear (stage units). */
  avoid?: Rect[];
  size?: [number, number];
  opacity?: number;
  cx?: number;
  cy?: number;
  w?: number;
  h?: number;
  z?: number;
  /** Give every piece a white sticker outline + this shadow colour. */
  sticker?: string;
};

export function Scatter({ pieces, colors, count, seed = 1, clear = 0, within, avoid, size = [44, 84], opacity = 1, cx = CENTER, cy = CENTER, w = STAGE, h = STAGE, z = 1, sticker }: ScatterProps) {
  const items = useMemo(() => {
    const out: Array<{ x: number; y: number; s: number; r: number; piece: PieceName; color: string }> = [];
    for (let i = 0; out.length < count && i < count * 60; i += 1) {
      const x = 30 + hash(i, 1, seed) * (w - 60);
      const y = 30 + hash(i, 2, seed) * (h - 60);
      const d = Math.hypot(x - cx, y - cy);
      if (d < clear || (within != null && d > within)) continue;
      if (avoid?.some((r) => x > r.x - 20 && x < r.x + r.w + 20 && y > r.y - 20 && y < r.y + r.h + 20)) continue;
      if (out.some((o) => Math.hypot(o.x - x, o.y - y) < (o.s + size[0]) * 0.7)) continue;
      // Whole numbers so server and client render identical style strings (no hydration mismatch).
      out.push({
        x: Math.round(x),
        y: Math.round(y),
        s: Math.round(size[0] + hash(i, 3, seed) * (size[1] - size[0])),
        r: Math.round(hash(i, 4, seed) * 360),
        piece: pieces[Math.floor(hash(i, 5, seed) * pieces.length)] ?? pieces[0],
        color: colors[Math.floor(hash(i, 6, seed) * colors.length)] ?? colors[0],
      });
    }
    return out;
  }, [pieces, colors, count, seed, clear, within, avoid, size, cx, cy, w, h]);
  return (
    <Layer z={z} style={{ opacity, filter: sticker ? stickerFilter(4, "#FFFFFF", sticker, 5) : undefined }}>
      {items.map((item, i) => (
        <Art key={i} svg={PIECE[item.piece](item.color)} x={item.x} y={item.y} w={item.s} rotate={item.r} z={1} />
      ))}
    </Layer>
  );
}

/** One decor piece as its own small sticker. */
export function PieceSticker({ piece, color, x, y, w, rotate = 0, shadow, outlineColor = "#FFFFFF", z = 4 }: { piece: PieceName; color: string; x: number; y: number; w: number; rotate?: number; shadow?: string; outlineColor?: string; z?: number }) {
  return (
    <Layer z={z} style={{ filter: stickerFilter(Math.max(3, Math.round(w / 22)), outlineColor, shadow, Math.max(3, Math.round(w / 16))) }}>
      <Art svg={PIECE[piece](color)} x={x} y={y} w={w} rotate={rotate} z={1} />
    </Layer>
  );
}

/** One ART piece as its own small sticker. */
export function ArtSticker({ svg: markup, x, y, w, h, rotate = 0, shadow, outlineColor = "#FFFFFF", z = 4 }: { svg: string; x: number; y: number; w: number; h?: number; rotate?: number; shadow?: string; outlineColor?: string; z?: number }) {
  return (
    <Layer z={z} style={{ filter: stickerFilter(Math.max(3, Math.round(w / 26)), outlineColor, shadow, Math.max(4, Math.round(w / 18))) }}>
      <Art svg={markup} x={x} y={y} w={w} h={h} rotate={rotate} z={1} />
    </Layer>
  );
}

// ---------------------------------------------------------------- labels

/** Pill label with a white sticker edge — inline (use inside a flex column). */
export function TagPill({ children, size = 64, bg = G.clay, color = "#FFFFFF", shadow = INK, rotate = 0, edge = "#FFFFFF" }: { children: ReactNode; size?: number; bg?: string; color?: string; shadow?: string; rotate?: number; edge?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: `${Math.round(size * 0.26)}px ${Math.round(size * 0.6)}px ${Math.round(size * 0.32)}px`,
        background: bg,
        color,
        border: `${Math.max(3, Math.round(size * 0.11))}px solid ${edge}`,
        borderRadius: 999,
        boxShadow: `0 ${Math.max(3, Math.round(size * 0.13))}px 0 0 ${shadow}`,
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      {children}
    </span>
  );
}

/** Sticker pill centred on (x, y). */
export function StickerTag({ x = CENTER, y, z = 6, ...pill }: { x?: number; y: number; z?: number; children: ReactNode; size?: number; bg?: string; color?: string; shadow?: string; rotate?: number; edge?: string }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", zIndex: z }}>
      <TagPill {...pill} />
    </div>
  );
}

/** Round sticker badge with big text (e.g. "100"). */
export function StickerBadge({ x, y, d, bg = G.butter, color = INK, rotate = 0, shadow = INK, children, sub, z = 5 }: { x: number; y: number; d: number; bg?: string; color?: string; rotate?: number; shadow?: string; children: ReactNode; sub?: ReactNode; z?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: Math.round(x - d / 2),
        top: Math.round(y - d / 2),
        width: d,
        height: d,
        borderRadius: 999,
        background: bg,
        border: `${Math.round(d * 0.045)}px solid #FFFFFF`,
        boxShadow: `0 ${Math.round(d * 0.05)}px 0 0 ${shadow}`,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        zIndex: z,
        color,
      }}
    >
      <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: Math.round(d * 0.38), lineHeight: 0.9, letterSpacing: "-0.04em" }}>{children}</span>
      {sub ? <span style={{ fontFamily: FONT.hand, fontSize: Math.round(d * 0.15), lineHeight: 1, marginTop: Math.round(d * 0.02) }}>{sub}</span> : null}
    </div>
  );
}

/** Handwritten label (Gochi Hand), centred on x. */
export function HandLabel({ children, x = CENTER, y, size = 64, color = INK, rotate = -4, z = 6 }: { children: ReactNode; x?: number; y: number; size?: number; color?: string; rotate?: number; z?: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) rotate(${rotate}deg)`, fontFamily: FONT.hand, fontSize: size, lineHeight: 1, color, whiteSpace: "nowrap", zIndex: z }}>
      {children}
    </div>
  );
}

/** Strip of washi tape, centred on (x, y). */
export function Tape({ x, y, w = 170, rotate = -8, color = "rgba(255,229,138,.82)", z = 7 }: { x: number; y: number; w?: number; rotate?: number; color?: string; z?: number }) {
  const h = Math.round(w * 0.28);
  return (
    <span
      aria-hidden
      style={{ position: "absolute", left: Math.round(x - w / 2), top: Math.round(y - h / 2), width: w, height: h, background: color, transform: `rotate(${rotate}deg)`, zIndex: z, boxShadow: "0 2px 0 rgba(43,36,29,.08)" }}
    />
  );
}

/** Small bowl + "MudKitchen" wordmark — inline. */
export function Wordmark({ size = 44, color = INK }: { size?: number; color?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.28) }}>
      <img src={LOGO.src} alt="" aria-hidden width={Math.round(size * 1.35)} height={Math.round(size * 1.35)} style={{ width: Math.round(size * 1.35), height: Math.round(size * 1.35), display: "block", transform: "rotate(-6deg)" }} />
      <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: size, letterSpacing: "-0.035em", lineHeight: 1, color }}>MudKitchen</span>
    </span>
  );
}
