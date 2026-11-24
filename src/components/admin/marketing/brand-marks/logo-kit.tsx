"use client";

import { useId, type ReactNode } from "react";
import { G } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import { gardenBody, gardenDisplay, gardenHand } from "@/components/garden/fonts";
import { Art, CENTER, INK, STAGE } from "@/components/admin/marketing/brand-marks/mark-kit";
import { BOWL_VB, BOWL_VECTOR } from "@/components/admin/marketing/brand-marks/bowl-vector";

// Kit for the transparent, print-ready logo stickers (Logos tab).
// - Everything inside one <DieCut> becomes one sticker: a thick, ROUND white border the printer cuts along.
//   There is no drop shadow by default, so the cut follows the border only.
// - Text is inline SVG (not an <img>) so it uses the Garden fonts, gets round stroke joins and gradients.
// Keep style numbers whole so SSR and client markup match.

export const CLAY = "#B95A34";
export const CLAY_DEEP = "#8A3F22";
export const LOGO_WHITE = "#FFFFFF";

// ---------------------------------------------------------------- die-cut border

const DIRECTIONS = 24;
/** Sum of |cos| over the directions, halved: how far a chain of `m`-long shadows reaches along any axis. */
const REACH = Array.from({ length: DIRECTIONS }, (_, i) => Math.abs(Math.cos((i * 2 * Math.PI) / DIRECTIONS))).reduce((a, b) => a + b, 0) / 2;
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * A round dilation of `radius` built from drop-shadows in 12 directions. Each shadow unions the shape with
 * a copy shifted by a short step, so together they grow it by `radius` with near-round corners (4-way
 * shadows leave square notches on thick borders). Returned as pairs: chaining many shadows in ONE
 * `filter` costs ~2^n in Chrome (12 took 36s to export), so <Outline> nests one div per pair instead.
 */
export function roundOutlineSteps(radius: number, color = LOGO_WHITE): string[] {
  const m = radius / REACH;
  const steps = Array.from({ length: DIRECTIONS }, (_, i) => {
    const a = (i * 2 * Math.PI) / DIRECTIONS;
    return `drop-shadow(${r2(m * Math.cos(a))}px ${r2(m * Math.sin(a))}px 0 ${color})`;
  });
  const pairs: string[] = [];
  for (let i = 0; i < steps.length; i += 2) pairs.push(steps.slice(i, i + 2).join(" "));
  return pairs;
}

/** Wraps `children` in one full-stage div per outline step (see roundOutlineSteps). */
function Outline({ radius, color, extra, z, children }: { radius: number; color: string; extra?: string; z?: number; children: ReactNode }) {
  const steps = roundOutlineSteps(radius, color);
  if (extra) steps.push(extra);
  return steps.reduce<ReactNode>(
    (inner, filter, i) => (
      <div style={{ position: "absolute", inset: 0, filter, zIndex: i === steps.length - 1 ? z : undefined }}>{inner}</div>
    ),
    children,
  );
}

type DieCutProps = {
  children: ReactNode;
  /** Border width in stage units (≈36 on a 1080 stage ≈ 0.1 in on a 3 in sticker). */
  border?: number;
  color?: string;
  /** Degrees; rotates around (cx, cy). */
  tilt?: number;
  cx?: number;
  cy?: number;
  /** Optional hard shadow (screen use only — printers would cut around it). */
  shadow?: string;
  z?: number;
};

/** Everything inside becomes ONE die-cut sticker with a shared round border. */
export function DieCut({ children, border = 36, color = LOGO_WHITE, tilt = 0, cx = CENTER, cy = CENTER, shadow, z = 3 }: DieCutProps) {
  return (
    <Outline radius={border} color={color} extra={shadow ? `drop-shadow(0 ${Math.round(border * 0.5)}px 0 ${shadow})` : undefined} z={z}>
      <div style={{ position: "absolute", inset: 0, transform: tilt ? `rotate(${tilt}deg)` : undefined, transformOrigin: `${Math.round(cx)}px ${Math.round(cy)}px` }}>
        {/* DOM text inside (e.g. TagPill) uses the Garden fonts too; make sure the export embeds them. */}
        <FontHint font={fontFamily("display")} />
        {children}
      </div>
    </Outline>
  );
}

/** A small border around one piece, nested inside a bigger DieCut (e.g. a cream edge round the bowl on a disc). */
export function Edge({ children, border = 12, color = LOGO_WHITE, z = 3 }: { children: ReactNode; border?: number; color?: string; z?: number }) {
  return (
    <Outline radius={border} color={color} z={z}>
      {children}
    </Outline>
  );
}

// ---------------------------------------------------------------- the vector bowl

export const vectorBowlHeight = (width: number) => Math.round((width * BOWL_VB.h) / BOWL_VB.w);

/** The redrawn bowl, centred on (cx, cy). `svg` swaps in a one-colour version. Children draw in 308×312 bowl units. */
export function VectorBowl({ cx = CENTER, cy = CENTER, width, svg = BOWL_VECTOR, rotate = 0, z = 3, children }: { cx?: number; cy?: number; width: number; svg?: string; rotate?: number; z?: number; children?: ReactNode }) {
  const k = width / BOWL_VB.w;
  const height = vectorBowlHeight(width);
  return (
    <div
      style={{
        position: "absolute",
        left: Math.round(cx - width / 2),
        top: Math.round(cy - height / 2),
        width,
        height,
        zIndex: z,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      <Art svg={svg} x={Math.round(width / 2)} y={Math.round(height / 2)} w={width} h={height} z={1} />
      {children ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: BOWL_VB.w, height: BOWL_VB.h, transform: `scale(${k})`, transformOrigin: "top left", zIndex: 2 }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- word art

/** One pass of the text: drawn back to front. `fill: "gradient"` uses the WordArt's gradient. */
export type Paint = { fill?: string; stroke?: string; sw?: number; dx?: number; dy?: number; opacity?: number };

/** 3D extrude: copies stepping down (and optionally sideways) behind the face. */
export function extrude(color: string, depth: number, sw: number, { step = 3, dx = 0 }: { step?: number; dx?: number } = {}): Paint[] {
  const steps = Math.max(1, Math.round(depth / step));
  return Array.from({ length: steps }, (_, i) => {
    const t = (steps - i) / steps;
    return { fill: color, stroke: color, sw, dx: Math.round(dx * t), dy: Math.round(depth * t) };
  });
}

type TextLook = {
  size: number;
  font?: "display" | "hand" | "body";
  weight?: number;
  /** Letter spacing in em. */
  tracking?: number;
  layers: Paint[];
  /** Top-to-bottom colour stops for `fill: "gradient"`. */
  gradient?: string[];
  /** Per-letter fills for the LAST layer (rainbow letters). */
  letters?: string[];
};

/**
 * The resolved next/font family names, not `var(--font-sf-*)`: SVG presentation attributes can't read CSS
 * variables, and html-to-image matches @font-face rules against the raw inline value, so a var() never embeds.
 */
const fontFamily = (font: TextLook["font"]) =>
  `${(font === "hand" ? gardenHand : font === "body" ? gardenBody : gardenDisplay).style.fontFamily}, sans-serif`;

function useSafeId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

function paintAttrs(p: Paint, gradientId: string) {
  return {
    fill: p.fill === "gradient" ? `url(#${gradientId})` : (p.fill ?? "none"),
    stroke: p.stroke,
    strokeWidth: p.sw,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    paintOrder: "stroke",
    opacity: p.opacity,
    transform: p.dx || p.dy ? `translate(${p.dx ?? 0} ${p.dy ?? 0})` : undefined,
  };
}

function GradientDef({ id, stops }: { id: string; stops?: string[] }) {
  if (!stops?.length) return null;
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      {stops.map((color, i) => (
        <stop key={i} offset={stops.length === 1 ? 0 : i / (stops.length - 1)} stopColor={color} />
      ))}
    </linearGradient>
  );
}

function letterSpans(text: string, colors: string[] | undefined) {
  if (!colors?.length) return text;
  let n = 0;
  return Array.from(text).map((ch, i) => {
    if (ch === " ") return <tspan key={i}> </tspan>;
    const fill = colors[n % colors.length];
    n += 1;
    return (
      <tspan key={i} fill={fill}>
        {ch}
      </tspan>
    );
  });
}

/**
 * A full-stage SVG layer (text and shapes draw in stage units). `font` adds an empty HTML span in that font:
 * html-to-image only embeds web fonts it finds on HTML elements (it never walks into <svg>), so without the
 * hint the PNG falls back to the body font.
 */
function FontHint({ font }: { font: string }) {
  return <span aria-hidden style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, overflow: "hidden", fontFamily: font }} />;
}

function StageSvg({ w = STAGE, h = STAGE, z = 4, font, children }: { w?: number; h?: number; z?: number; font: string; children: ReactNode }) {
  return (
    <>
      <FontHint font={font} />
      <svg aria-hidden width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", zIndex: z, display: "block" }}>
        {children}
      </svg>
    </>
  );
}

/** Straight word art centred on (x, y). */
export function WordArt({ text, x = CENTER, y, rotate = 0, w, h, z, ...look }: TextLook & { text: string; x?: number; y: number; rotate?: number; w?: number; h?: number; z?: number }) {
  const gid = useSafeId("wa");
  const { size, font, weight = 800, tracking = -0.03, layers, gradient, letters } = look;
  return (
    <StageSvg w={w} h={h} z={z} font={fontFamily(font)}>
      <defs>
        <GradientDef id={gid} stops={gradient} />
      </defs>
      <g transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined} style={{ fontFamily: fontFamily(font) }} fontWeight={font === "hand" ? 400 : weight} fontSize={size} letterSpacing={`${tracking}em`} textAnchor="middle" dominantBaseline="central">
        {layers.map((p, i) => (
          <text key={i} x={x} y={y} {...paintAttrs(p, gid)}>
            {i === layers.length - 1 ? letterSpans(text, letters) : text}
          </text>
        ))}
      </g>
    </StageSvg>
  );
}

/** Text along a circular arc round (cx, cy): over the top, or along the bottom (reading left to right). */
export function ArcText({ text, cx = CENTER, cy = CENTER, r, side = "top", w, h, z, ...look }: TextLook & { text: string; cx?: number; cy?: number; r: number; side?: "top" | "bottom"; w?: number; h?: number; z?: number }) {
  const gid = useSafeId("ag");
  const pid = useSafeId("ap");
  const { size, font, weight = 800, tracking = 0.02, layers, gradient, letters } = look;
  const d = side === "top" ? `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}` : `M${cx - r},${cy} A${r},${r} 0 0 0 ${cx + r},${cy}`;
  return (
    <StageSvg w={w} h={h} z={z} font={fontFamily(font)}>
      <defs>
        <GradientDef id={gid} stops={gradient} />
        <path id={pid} d={d} fill="none" />
      </defs>
      <g style={{ fontFamily: fontFamily(font) }} fontWeight={font === "hand" ? 400 : weight} fontSize={size} letterSpacing={`${tracking}em`} dominantBaseline="central">
        {layers.map((p, i) => (
          <text key={i} {...paintAttrs(p, gid)}>
            <textPath href={`#${pid}`} startOffset="50%" textAnchor="middle">
              {i === layers.length - 1 ? letterSpans(text, letters) : text}
            </textPath>
          </text>
        ))}
      </g>
    </StageSvg>
  );
}

// ---------------------------------------------------------------- shapes (SVG strings, drawn with <Art>)

const svg = (vb: string, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const pts = (list: Array<[number, number]>) => list.map(([x, y]) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`).join(" ");

type Ring = { color: string; width: number; inset: number; dash?: string };
const ringSvg = (cx: number, cy: number, r: number, ring?: Ring) =>
  ring ? `<circle cx="${cx}" cy="${cy}" r="${r - ring.inset}" fill="none" stroke="${ring.color}" stroke-width="${ring.width}"${ring.dash ? ` stroke-dasharray="${ring.dash}" stroke-linecap="round"` : ""}/>` : "";

export const SHAPE = {
  /** 1000×1000 disc. */
  disc: (fill: string, ring?: Ring) => svg("0 0 1000 1000", `<circle cx="500" cy="500" r="500" fill="${fill}"/>${ringSvg(500, 500, 500, ring)}`),
  /** 1000×1000 rounded square. */
  squircle: (fill: string, dots?: string) =>
    svg(
      "0 0 1000 1000",
      `<rect width="1000" height="1000" rx="230" fill="${fill}"/>`
        + (dots
          ? Array.from({ length: 36 }, (_, i) => {
            const x = 110 + (i % 6) * 156;
            const y = 110 + Math.floor(i / 6) * 156;
            return `<circle cx="${x}" cy="${y}" r="12" fill="${dots}"/>`;
          }).join("")
          : ""),
    ),
  /** 1000×1000 soft splash blob. */
  blob: (fill: string) =>
    svg(
      "0 0 1000 1000",
      `<path d="M520,40 C660,30 760,120 840,210 C930,310 990,420 960,560 C930,700 860,800 740,880 C620,960 470,980 340,930 C200,880 90,790 50,650 C10,510 40,370 120,260 C200,150 380,50 520,40 Z" fill="${fill}"/>`,
    ),
  /** 1000×1000 starburst with `points` rays. */
  burst: (fill: string, points = 18, inner = 0.84) =>
    svg(
      "0 0 1000 1000",
      `<polygon points="${pts(
        Array.from({ length: points * 2 }, (_, i) => {
          const a = (i * Math.PI) / points - Math.PI / 2;
          const r = i % 2 ? 500 * inner : 500;
          return [500 + r * Math.cos(a), 500 + r * Math.sin(a)] as [number, number];
        }),
      )}" fill="${fill}" stroke="${fill}" stroke-width="16" stroke-linejoin="round"/>`,
    ),
  /** 1000×1000 scalloped seal. */
  scallop: (fill: string, bumps = 22, ring?: Ring) => {
    const r = 440;
    const bumpR = Math.round((Math.PI * r) / bumps) + 6;
    const circles = Array.from({ length: bumps }, (_, i) => {
      const a = (i * 2 * Math.PI) / bumps;
      return `<circle cx="${Math.round(500 + r * Math.cos(a))}" cy="${Math.round(500 + r * Math.sin(a))}" r="${bumpR}" fill="${fill}"/>`;
    }).join("");
    return svg("0 0 1000 1000", `${circles}<circle cx="500" cy="500" r="${r}" fill="${fill}"/>${ringSvg(500, 500, 440, ring)}`);
  },
  /** 800×1000 postage stamp: perforated edge, inner panel. */
  stamp: (paper: string, panel: string, line: string) => {
    const bite = 24;
    const holes: string[] = [];
    for (let x = 40; x <= 760; x += 60) holes.push(`<circle cx="${x}" cy="0" r="${bite}"/><circle cx="${x}" cy="1000" r="${bite}"/>`);
    for (let y = 40; y <= 960; y += 60) holes.push(`<circle cx="0" cy="${y}" r="${bite}"/><circle cx="800" cy="${y}" r="${bite}"/>`);
    return svg(
      "0 0 800 1000",
      `<defs><mask id="perf"><rect width="800" height="1000" fill="#fff"/><g fill="#000">${holes.join("")}</g></mask></defs>`
        + `<rect width="800" height="1000" fill="${paper}" mask="url(#perf)"/>`
        + `<rect x="70" y="70" width="660" height="860" rx="14" fill="${panel}"/>`
        + `<rect x="92" y="92" width="616" height="816" rx="8" fill="none" stroke="${line}" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round"/>`,
    );
  },
  /** 1000×260 ribbon banner with folded tails. */
  ribbon: (fill: string, shade: string) =>
    svg(
      "0 0 1000 260",
      `<path d="M10,90 L150,90 L150,240 L10,240 L60,165 Z" fill="${shade}"/><path d="M990,90 L850,90 L850,240 L990,240 L940,165 Z" fill="${shade}"/>`
        + `<path d="M150,240 L200,200 L200,240 Z M850,240 L800,200 L800,240 Z" fill="${darkenHex(shade)}"/>`
        + `<path d="M120,40 Q500,0 880,40 L880,200 Q500,160 120,200 Z" fill="${fill}"/>`,
    ),
  /** 600×400 speech bubble, tail at the bottom left. */
  bubble: (fill: string, line: string) =>
    svg(
      "0 0 600 400",
      `<path d="M300,20 C460,20 580,80 580,170 C580,260 460,320 300,320 C268,320 238,318 210,312 L110,384 L134,296 C62,270 20,224 20,170 C20,80 140,20 300,20 Z" fill="${fill}" stroke="${line}" stroke-width="14" stroke-linejoin="round"/>`,
    ),
  /** 200×200 four-point sparkle. */
  sparkle: (fill: string) => svg("0 0 200 200", `<path d="M100,8 C108,80 120,92 192,100 C120,108 108,120 100,192 C92,120 80,108 8,100 C80,92 92,80 100,8Z" fill="${fill}"/>`),
  /** 200×200 heart with an ink line. */
  heart: (fill: string) =>
    svg("0 0 200 200", `<path d="M100,176 C40,132 12,96 12,64 C12,36 36,16 60,16 C80,16 94,28 100,44 C106,28 120,16 140,16 C164,16 188,36 188,64 C188,96 160,132 100,176Z" fill="${fill}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>`),
  /** 200×200 star with an ink line. */
  star: (fill: string) =>
    svg("0 0 200 200", `<path d="M100,12 L124,76 L192,78 L138,120 L158,186 L100,148 L42,186 L62,120 L8,78 L76,76 Z" fill="${fill}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>`),
  /** 600×80 hand-drawn swoosh underline. */
  swoosh: (color: string) => svg("0 0 600 80", `<path d="M14,52 C140,22 330,14 586,34 C430,36 300,44 180,66" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`),
} as const;

function darkenHex(hex: string) {
  const h = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * 0.72).toString(16).padStart(2, "0"));
  return `#${c.join("")}`;
}

/** A shape centred on (x, y). */
export function Shape({ svg: markup, x = CENTER, y = CENTER, w, h, rotate, z = 1 }: { svg: string; x?: number; y?: number; w: number; h?: number; rotate?: number; z?: number }) {
  return <Art svg={markup} x={x} y={y} w={w} h={h} rotate={rotate} z={z} />;
}

// ---------------------------------------------------------------- text presets

/** Common looks for "MudKitchen" (pass `size`). */
export const LOOK = {
  /** Clay letters, ink outline, chunky ink extrude. */
  puffy: (size: number): TextLook => {
    const sw = Math.round(size * 0.11);
    return { size, layers: [...extrude(INK, Math.round(size * 0.1), sw), { fill: CLAY, stroke: INK, sw }] };
  },
  /** Butter letters with a deep clay 3D block going down-right. */
  retro: (size: number): TextLook => {
    const sw = Math.round(size * 0.07);
    return {
      size,
      tracking: -0.02,
      layers: [
        ...extrude(INK, Math.round(size * 0.16), sw * 2, { dx: Math.round(size * 0.08), step: 3 }),
        ...extrude(CLAY_DEEP, Math.round(size * 0.14), sw, { dx: Math.round(size * 0.07), step: 3 }),
        { fill: G.butter, stroke: INK, sw },
      ],
    };
  },
  /** Glossy bubble letters: peach → clay gradient, white highlight line, ink outline. */
  bubble: (size: number): TextLook => {
    const sw = Math.round(size * 0.12);
    return {
      size,
      tracking: -0.01,
      gradient: ["#FFB48E", "#E8774A", CLAY],
      layers: [
        { fill: INK, stroke: INK, sw, dy: Math.round(size * 0.06) },
        { fill: "gradient", stroke: INK, sw },
        { fill: "none", stroke: "#FFFFFF", sw: Math.max(3, Math.round(size * 0.025)), dy: -Math.round(size * 0.02), opacity: 0.55 },
      ],
    };
  },
  /** Plain forest letters (bumper lockups). */
  plain: (size: number, color: string = G.forest): TextLook => ({ size, tracking: -0.035, layers: [{ fill: color }] }),
  /** Handwritten, ink. */
  hand: (size: number, color: string = INK): TextLook => ({ size, font: "hand", tracking: 0, layers: [{ fill: color, stroke: color, sw: Math.round(size * 0.03) }] }),
  /** White letters on a clay outline (for ribbons and dark discs). */
  chalk: (size: number, line: string = CLAY_DEEP): TextLook => ({ size, layers: [{ fill: "#FFFFFF", stroke: line, sw: Math.round(size * 0.1) }] }),
  /** Every letter a different pastel-bright colour. */
  confetti: (size: number): TextLook => {
    const sw = Math.round(size * 0.11);
    return {
      size,
      layers: [...extrude(INK, Math.round(size * 0.08), sw), { fill: "#FFFFFF", stroke: INK, sw }],
      letters: ["#FF7A6B", "#FFCF3F", "#7BC47F", "#6FB7F2", "#B98BEA", "#F09A4E"],
    };
  },
};
