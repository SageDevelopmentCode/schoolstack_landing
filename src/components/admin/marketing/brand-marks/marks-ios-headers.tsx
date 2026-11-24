"use client";

import type { ReactNode } from "react";
import { FONT, G } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import type { MascotName } from "@/components/admin/marketing/mascot/Mascot";
import {
  BowlFace,
  BowlSticker,
  bowlHeight,
  darken,
  INK,
  MascotSticker,
  PASTEL,
  Pattern,
  Scatter,
  TagPill,
  Wordmark,
  type PatternKind,
} from "@/components/admin/marketing/brand-marks/mark-kit";
import { CREW, crewMember } from "@/components/admin/marketing/brand-marks/crew";
import {
  IOS_HEADER_FORMAT_ORDER,
  IOS_HEADER_FORMATS,
  type BrandMark,
  type IosHeaderFormat,
  type Rect,
} from "@/components/admin/marketing/brand-marks/types";

// App Store artwork: one concept → 16:9 (5244×2950) and ultrawide (3840×1646), each with and without
// words. Everything that matters sits inside the format's `safe` rect (Apple may crop it), and the
// bottom title band stays free of faces and copy. Stages are drawn at half size and exported at 2×.
//
// The bowl comes from Logo.png (≈308px of art), so it is upscaled here: keep it ≤ ~600 stage units and
// let the vector crew carry the size.

const HEADLINE = "The operating system for microschools";

type Ctx = {
  f: IosHeaderFormat;
  text: boolean;
  W: number;
  H: number;
  safe: Rect;
  /** Type and art scale: 1 on ultrawide, larger on the taller 16:9 stage. */
  u: number;
  cx: number;
  cy: number;
  bottom: number;
  right: number;
};

function ctx(f: IosHeaderFormat, text: boolean): Ctx {
  const spec = IOS_HEADER_FORMATS[f];
  const safe = spec.safe;
  return {
    f,
    text,
    W: spec.stage.w,
    H: spec.stage.h,
    safe,
    u: f === "ios-16x9" ? 1.45 : 1,
    cx: Math.round(safe.x + safe.w / 2),
    cy: Math.round(safe.y + safe.h / 2),
    bottom: safe.y + safe.h,
    right: safe.x + safe.w,
  };
}

const r = Math.round;
const mascotH = (w: number) => r((w * 260) / 240);

function Bg({ c, kind, base, ink, size = 90 }: { c: Ctx; kind: PatternKind; base: string; ink?: string; size?: number }) {
  return <Pattern kind={kind} base={base} ink={ink} size={r(size * c.u)} w={c.W} h={c.H} />;
}

type CopyProps = {
  c: Ctx;
  x: number;
  /** Vertical centre (or top when `top` is set). */
  y: number;
  top?: boolean;
  align?: "left" | "center";
  tone?: "light" | "dark";
  wordmark?: boolean;
  headline?: string;
  head?: number;
  maxW?: number;
};

/** Wordmark + display headline, sized by the format's `u`. */
function Copy({ c, x, y, top = false, align = "left", tone = "light", wordmark = true, headline = HEADLINE, head = 88, maxW }: CopyProps) {
  const color = tone === "light" ? INK : G.cream;
  const size = r(head * c.u);
  return (
    <div
      style={{
        position: "absolute",
        left: r(x),
        top: r(y),
        transform: `${align === "center" ? "translateX(-50%)" : ""} ${top ? "" : "translateY(-50%)"}`.trim() || undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        gap: r(22 * c.u),
        width: maxW ? r(maxW) : undefined,
        zIndex: 6,
      }}
    >
      {wordmark ? <Wordmark size={r(54 * c.u)} color={color} /> : null}
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: size, lineHeight: 1.0, letterSpacing: "-0.035em", color }}>{headline}</div>
    </div>
  );
}

/** Bowl with Pip, Dig and Clover around it, in units of the original cover layout × k. */
function BowlAndFriends({ x, y, k, shadow }: { x: number; y: number; k: number; shadow: string }) {
  return (
    <>
      <BowlSticker cx={x} cy={y} width={r(343 * k)} tilt={-6} shadow={shadow} />
      <MascotSticker name="pip" view="wave" cx={r(x - 190 * k)} cy={r(y + 120 * k)} width={r(220 * k)} tilt={-8} shadow={shadow} z={5} />
      <MascotSticker name="dig" view="happy" cx={r(x + 200 * k)} cy={r(y + 110 * k)} width={r(230 * k)} tilt={8} shadow={shadow} z={5} />
      <MascotSticker name="clover" view="excited" cx={r(x + 210 * k)} cy={r(y - 170 * k)} width={r(150 * k)} tilt={10} shadow={shadow} z={5} />
    </>
  );
}
/** The BowlAndFriends group's extent at k = 1. */
const FRIENDS = { left: 300, right: 315, top: 251, bottom: 239 };

type Concept = {
  id: string;
  title: string;
  description: string;
  background: string;
  draw: (c: Ctx) => ReactNode;
};

const CONCEPTS: Concept[] = [
  {
    id: "ios-crew-parade",
    title: "Crew parade",
    description: "All 12 crew stickers in two rows on graph paper.",
    background: G.cream,
    draw: (c) => {
      const titleH = r(88 * c.u);
      const rowsTop = c.text ? c.safe.y + titleH + r(40 * c.u) : c.safe.y;
      const rowH = (c.bottom - rowsTop) / 2;
      const step = c.safe.w / 6;
      const mw = r(Math.min(step * 0.9, (rowH / 1.08) * 0.9));
      return (
        <>
          <Bg c={c} kind="grid" base={G.cream} ink="#E8DCCB" size={70} />
          {c.text ? (
            <div
              style={{
                position: "absolute",
                left: c.cx,
                top: c.safe.y,
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: r(24 * c.u),
                width: "max-content",
                whiteSpace: "nowrap",
                zIndex: 6,
              }}
            >
              <Wordmark size={r(54 * c.u)} />
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: titleH, letterSpacing: "-0.035em", lineHeight: 1, color: INK }}>meet the crew</span>
            </div>
          ) : null}
          {CREW.map((m, i) => {
            const row = i < 6 ? 0 : 1;
            const col = i % 6;
            const shift = row ? step * 0.12 : -step * 0.12;
            return (
              <MascotSticker
                key={m.name}
                name={m.name}
                view={m.view}
                cx={r(c.safe.x + step * (col + 0.5) + shift)}
                cy={r(rowsTop + rowH * (row + 0.5) + (col % 2 ? 10 : -10) * c.u)}
                width={mw}
                tilt={(i + row) % 2 ? 6 : -6}
                shadow="#D9C7AE"
                z={4}
              />
            );
          })}
        </>
      );
    },
  },
  {
    id: "ios-big-bowl",
    title: "Big bowl",
    description: "One big bowl sticker on mint dots with sparkles.",
    background: PASTEL.mint,
    draw: (c) => {
      const bw = r((c.f === "ios-16x9" ? 560 : 380) * (c.text ? 0.92 : 1));
      const bx = c.text ? r(c.right - bw / 2 - 30 * c.u) : c.cx;
      const by = c.cy;
      const copyW = c.safe.w - bw - r(130 * c.u);
      const copyRect = { x: c.safe.x, y: c.safe.y, w: copyW, h: c.safe.h };
      return (
        <>
          <Bg c={c} kind="dots" base={PASTEL.mint} />
          <Scatter
            pieces={["sparkle"]}
            colors={["#FFFFFF"]}
            count={c.text ? 9 : 12}
            seed={4}
            w={c.W}
            h={c.H}
            cx={bx}
            cy={by}
            clear={r(bw * 0.68)}
            avoid={c.text ? [copyRect] : undefined}
            size={[r(36 * c.u), r(64 * c.u)]}
          />
          {c.text ? <Copy c={c} x={c.safe.x} y={c.cy} maxW={copyW} /> : null}
          <BowlSticker cx={bx} cy={by} width={bw} tilt={-8} shadow={darken(PASTEL.mint, 0.26)} />
        </>
      );
    },
  },
  {
    id: "ios-bowl-friends",
    title: "Bowl & friends",
    description: "Butter gingham, the bowl with Pip, Dig and Clover.",
    background: PASTEL.butter,
    draw: (c) => {
      const groupH = FRIENDS.top + FRIENDS.bottom;
      const groupW = FRIENDS.left + FRIENDS.right;
      const k = c.text ? (c.f === "ios-16x9" ? 1.4 : 0.98) : Math.min((c.safe.h * 0.94) / groupH, (c.safe.w * 0.9) / groupW, c.f === "ios-16x9" ? 1.7 : 1.05);
      const gx = c.text ? r(c.right - FRIENDS.right * k - 10 * c.u) : c.cx;
      const gy = r(c.cy + ((FRIENDS.top - FRIENDS.bottom) / 2) * k);
      const copyW = c.safe.w - groupW * k - r(90 * c.u);
      return (
        <>
          <Bg c={c} kind="gingham" base={PASTEL.butter} ink="#F2C75C" size={100} />
          {c.text ? <Copy c={c} x={c.safe.x} y={c.cy} maxW={copyW} /> : null}
          <BowlAndFriends x={gx} y={gy} k={k} shadow="#C99A2E" />
        </>
      );
    },
  },
  {
    id: "ios-peekaboo",
    title: "Peek-a-boo",
    description: "Seven crew peeking over a meadow under a starry forest sky.",
    background: G.forest,
    draw: (c) => {
      const names: MascotName[] = ["pip", "nutmeg", "dig", "fennel", "marigold", "dot", "bramble"];
      const big = c.f === "ios-16x9";
      const mw = c.text ? (big ? 300 : 190) : big ? 320 : 210;
      const mh = mascotH(mw);
      const hillTop = c.bottom - r(36 * c.u);
      const left = c.safe.x + mw / 2;
      const right = c.right - mw / 2;
      const step = (right - left) / (names.length - 1);
      const hillH = c.H - hillTop + 20;
      return (
        <>
          <Bg c={c} kind="stars" base={G.forest} ink="#3D5C4C" />
          {c.text ? <Copy c={c} x={c.cx} y={c.safe.y} top align="center" tone="dark" maxW={c.safe.w} /> : null}
          {names.map((n, i) => (
            <MascotSticker
              key={n}
              name={n}
              view={crewMember(n).view}
              cx={r(left + i * step)}
              cy={r(hillTop - mh * 0.32 + (i % 2 ? mh * 0.06 : 0))}
              width={mw}
              tilt={i % 2 ? 5 : -5}
              shadow={G.forestDeep}
              outlineColor={G.paper}
              z={4}
            />
          ))}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: r(-c.W * 0.3),
              top: hillTop,
              width: r(c.W * 1.6),
              height: hillH,
              background: G.moss,
              borderTop: `${r(8 * c.u)}px solid ${G.paper}`,
              borderRadius: `50% 50% 0 0 / ${r(110 * c.u)}px ${r(110 * c.u)}px 0 0`,
              zIndex: 5,
            }}
          />
        </>
      );
    },
  },
  {
    id: "ios-feature-row",
    title: "Feature crew",
    description: "Five crew stickers; the text version labels what each one does.",
    background: PASTEL.sky,
    draw: (c) => {
      const names: MascotName[] = ["pip", "nutmeg", "fennel", "loam", "dot"];
      const big = c.f === "ios-16x9";
      const headLines = 2;
      const headH = r(88 * c.u * headLines);
      const pill = r(30 * c.u);
      const pillH = r(pill * 1.9);
      const mw = c.text ? (big ? 300 : 180) : big ? 320 : 220;
      const top = c.text ? c.safe.y + headH + r(40 * c.u) : c.safe.y;
      const rowY = r(c.text ? (top + c.bottom - pillH) / 2 : c.cy);
      const left = c.safe.x + mw * 0.7;
      const right = c.right - mw * 0.7;
      const step = (right - left) / (names.length - 1);
      return (
        <>
          <Bg c={c} kind="dots" base={PASTEL.sky} ink="#D3E2F7" />
          {c.text ? <Copy c={c} x={c.cx} y={c.safe.y} top align="center" wordmark={false} maxW={c.safe.w} /> : null}
          {names.map((n, i) => {
            const m = crewMember(n);
            const x = r(left + i * step);
            return (
              <div key={n}>
                <MascotSticker name={n} view={m.view} cx={x} cy={rowY + (i % 2 ? r(8 * c.u) : -r(8 * c.u))} width={mw} tilt={i % 2 ? 6 : -6} shadow="#A9BFD8" z={4} />
                {c.text ? (
                  <div style={{ position: "absolute", left: x, top: rowY + r(mw * 0.6), transform: "translateX(-50%)", zIndex: 6 }}>
                    <TagPill size={pill} bg="#FFFFFF" color={INK} shadow="#A9BFD8" edge={INK} rotate={i % 2 ? 3 : -3}>
                      {m.short}
                    </TagPill>
                  </div>
                ) : null}
              </div>
            );
          })}
        </>
      );
    },
  },
  {
    id: "ios-wordmark",
    title: "Big wordmark",
    description: "Peach stripes, the bowl and the MudKitchen name, with Pip and Dig.",
    background: PASTEL.peach,
    draw: (c) => {
      const big = c.f === "ios-16x9";
      const shadow = darken(PASTEL.peach, 0.2);
      const bw = c.text ? (big ? 400 : 230) : big ? 560 : 380;
      const bh = bowlHeight(bw);
      const name = r(c.text ? (big ? 210 : 120) : 0);
      const tag = r(34 * c.u);
      const gap = r(26 * c.u);
      const blockH = c.text ? bh + gap + name + gap + r(tag * 1.9) : bh;
      const blockTop = r(c.cy - blockH / 2);
      const mw = big ? (c.text ? 300 : 380) : c.text ? 220 : 250;
      const sideY = r(c.cy + mascotH(mw) * 0.08);
      return (
        <>
          <Bg c={c} kind="stripes" base={PASTEL.peach} ink="#F3CDBA" size={110} />
          <BowlSticker cx={c.cx} cy={r(blockTop + bh / 2)} width={bw} tilt={-6} shadow={shadow}>
            {c.text ? null : <BowlFace mood="happy" />}
          </BowlSticker>
          {c.text ? (
            <div
              style={{
                position: "absolute",
                left: c.cx,
                top: blockTop + bh + gap,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap,
                zIndex: 6,
                width: "max-content",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: name, lineHeight: 1, letterSpacing: "-0.045em", color: INK }}>MudKitchen</span>
              <TagPill size={tag} bg={G.clay} color="#FFFFFF" shadow={G.clayDeep}>
                {HEADLINE}
              </TagPill>
            </div>
          ) : null}
          <MascotSticker name="pip" view="wave" cx={r(c.safe.x + mw * 0.62)} cy={sideY} width={mw} tilt={-8} shadow={shadow} z={5} />
          <MascotSticker name="dig" view="happy" cx={r(c.right - mw * 0.62)} cy={sideY} width={mw} tilt={8} shadow={shadow} z={5} />
        </>
      );
    },
  },
];

export const IOS_HEADER_MARKS: BrandMark[] = CONCEPTS.flatMap((concept) =>
  IOS_HEADER_FORMAT_ORDER.flatMap((format) =>
    [true, false].map((text): BrandMark => {
      const spec = IOS_HEADER_FORMATS[format];
      const slug = concept.id.replace(/^ios-/, "");
      return {
        id: `${concept.id}-${format}-${text ? "text" : "art"}`,
        title: concept.title,
        description: concept.description,
        kind: "ios-header",
        group: "everyday",
        background: concept.background,
        fileName: `${slug}-${spec.width}x${spec.height}-${text ? "text" : "art-only"}.png`,
        width: spec.width,
        height: spec.height,
        stage: spec.stage,
        concept: concept.id,
        iosFormat: format,
        textless: !text,
        render: () => concept.draw(ctx(format, text)),
      };
    }),
  ),
);
