"use client";

import type { ReactNode } from "react";
import { FONT, G } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  ART,
  Art,
  ArtSticker,
  BOWL,
  BowlSticker,
  CHALK,
  darken,
  INK,
  MascotSticker,
  PASTEL,
  PIECE,
  Pattern,
  PieceSticker,
  ROSE,
  Scatter,
  TagPill,
  Wordmark,
  type PatternKind,
} from "@/components/admin/marketing/brand-marks/mark-kit";
import { CREW, crewMember } from "@/components/admin/marketing/brand-marks/crew";
import {
  COVER_FORMAT_ORDER,
  COVER_FORMATS,
  type BrandMark,
  type BrandMarkGroup,
  type BrandMarkSeason,
  type CoverFormat,
} from "@/components/admin/marketing/brand-marks/types";

// Cover banners: one concept → Facebook page (1640×624), LinkedIn page (1128×191) and LinkedIn
// profile (1584×396). Copy sits in each format's safe rect (clear of the profile photo / logo and,
// on Facebook, inside the mobile crop); the art fills the right-hand side.

const HEADLINE = "The complete operating system for microschools";
const SHORT = "The operating system for microschools";
const SITE = "trymudkitchen.com";

/** Copy sizes per format. LinkedIn page is a single line with no wordmark. */
const COPY: Record<CoverFormat, { word: number; head: number; tag: number; gap: number; maxW: number; x: number }> = {
  facebook: { word: 42, head: 70, tag: 28, gap: 22, maxW: 620, x: 330 },
  "linkedin-profile": { word: 32, head: 52, tag: 0, gap: 14, maxW: 560, x: 450 },
  "linkedin-page": { word: 0, head: 36, tag: 0, gap: 0, maxW: 9999, x: 240 },
};

/** Where the right-hand art is centred, and how big the hero bowl is. */
const ART_AREA: Record<CoverFormat, { cx: number; cy: number; bowl: number; unit: number }> = {
  facebook: { cx: 1170, cy: 312, bowl: 440, unit: 1 },
  "linkedin-profile": { cx: 1290, cy: 198, bowl: 300, unit: 0.68 },
  "linkedin-page": { cx: 1030, cy: 96, bowl: 132, unit: 0.3 },
};

type CopyProps = {
  f: CoverFormat;
  headline?: string;
  /** One-line headline for the LinkedIn page banner. */
  short?: string;
  tone?: "light" | "dark" | "chalk";
  hand?: boolean;
  align?: "left" | "center";
  x?: number;
  cy?: number;
  maxW?: number;
  tag?: boolean;
  wordmark?: boolean;
  scale?: number;
};

function CoverCopy({ f, headline = HEADLINE, short = SHORT, tone = "light", hand = false, align = "left", x, cy, maxW, tag = true, wordmark = true, scale = 1 }: CopyProps) {
  const c = COPY[f];
  const { height } = COVER_FORMATS[f];
  const compact = f === "linkedin-page";
  const color = tone === "light" ? INK : tone === "chalk" ? "#F4EFE6" : G.cream;
  const head = Math.round(c.head * scale);
  return (
    <div
      style={{
        position: "absolute",
        left: x ?? c.x,
        top: Math.round(cy ?? height / 2),
        transform: align === "center" ? "translate(-50%, -50%)" : "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        gap: c.gap,
        zIndex: 6,
      }}
    >
      {wordmark && c.word ? <Wordmark size={c.word} color={tone === "light" ? INK : G.cream} /> : null}
      <div
        style={{
          fontFamily: hand ? FONT.hand : FONT.display,
          fontWeight: hand ? 400 : 800,
          fontSize: hand ? Math.round(head * 1.25) : head,
          lineHeight: hand ? 1 : 0.98,
          letterSpacing: hand ? "0" : "-0.035em",
          color,
          maxWidth: compact ? undefined : (maxW ?? c.maxW),
          whiteSpace: compact ? "nowrap" : undefined,
        }}
      >
        {compact ? short : headline}
      </div>
      {tag && c.tag ? <TagPill size={c.tag} bg={tone === "light" ? G.clay : G.butter} color={tone === "light" ? "#FFFFFF" : INK} shadow={tone === "light" ? G.clayDeep : "rgba(0,0,0,.35)"}>{SITE}</TagPill> : null}
    </div>
  );
}

function Bg({ f, kind, base, ink, size = 90 }: { f: CoverFormat; kind: PatternKind; base: string; ink?: string; size?: number }) {
  const { width, height } = COVER_FORMATS[f];
  const unit = f === "linkedin-page" ? 0.55 : f === "linkedin-profile" ? 0.8 : 1;
  return <Pattern kind={kind} base={base} ink={ink} size={Math.round(size * unit)} w={width} h={height} />;
}

type Concept = {
  id: string;
  title: string;
  description: string;
  group: BrandMarkGroup;
  background: string;
  season?: BrandMarkSeason;
  draw: (f: CoverFormat) => ReactNode;
};

const s = (f: CoverFormat, n: number) => Math.round(n * ART_AREA[f].unit);

const CONCEPTS: Concept[] = [
  {
    id: "cover-parade",
    title: "Sticker parade",
    description: "Butter gingham, headline, bowl with Pip, Dig and Clover.",
    group: "everyday",
    background: PASTEL.butter,
    draw: (f) => {
      const a = ART_AREA[f];
      const sh = "#C99A2E";
      return (
        <>
          <Bg f={f} kind="gingham" base={PASTEL.butter} ink="#F2C75C" size={100} />
          <CoverCopy f={f} />
          <BowlSticker cx={a.cx} cy={a.cy} width={Math.round(a.bowl * 0.78)} tilt={-6} shadow={sh} />
          <MascotSticker name="pip" view="wave" cx={a.cx - s(f, 190)} cy={a.cy + s(f, 120)} width={s(f, 220)} tilt={-8} shadow={sh} z={5} />
          <MascotSticker name="dig" view="happy" cx={a.cx + s(f, 200)} cy={a.cy + s(f, 110)} width={s(f, 230)} tilt={8} shadow={sh} z={5} />
          {f !== "linkedin-page" ? <MascotSticker name="clover" view="excited" cx={a.cx + s(f, 210)} cy={a.cy - s(f, 170)} width={s(f, 150)} tilt={10} shadow={sh} z={5} /> : null}
        </>
      );
    },
  },
  {
    id: "cover-big-bowl",
    title: "Big bowl",
    description: "Mint dots, wordmark and headline, one big bowl sticker.",
    group: "everyday",
    background: PASTEL.mint,
    draw: (f) => {
      const a = ART_AREA[f];
      const { width, height } = COVER_FORMATS[f];
      return (
        <>
          <Bg f={f} kind="dots" base={PASTEL.mint} />
          <CoverCopy f={f} />
          {f !== "linkedin-page" ? (
            <Scatter pieces={["sparkle"]} colors={["#FFFFFF"]} count={7} seed={4} w={width} h={height} cx={a.cx} cy={a.cy} clear={a.bowl * 0.62} avoid={[{ x: 0, y: 0, w: a.cx - a.bowl * 0.7, h: height }]} size={[s(f, 34), s(f, 60)]} />
          ) : null}
          <BowlSticker cx={a.cx} cy={a.cy} width={a.bowl} tilt={-8} shadow={darken(PASTEL.mint, 0.26)} />
        </>
      );
    },
  },
  {
    id: "cover-meet-crew",
    title: "Meet the crew",
    description: "All 12 crew stickers lined up on graph paper.",
    group: "everyday",
    background: G.cream,
    draw: (f) => {
      const { width, safe } = COVER_FORMATS[f];
      const page = f === "linkedin-page";
      const left = page ? safe.x + 20 : f === "facebook" ? 300 : safe.x + 40;
      const right = page ? width - 50 : f === "facebook" ? 1340 : width - 50;
      const step = (right - left) / (CREW.length - 1);
      const mw = page ? 84 : f === "facebook" ? 150 : 118;
      const rowY = page ? 96 : f === "facebook" ? 420 : 268;
      return (
        <>
          <Bg f={f} kind="grid" base={G.cream} ink="#E8DCCB" size={70} />
          {!page ? (
            <div
              style={{
                position: "absolute",
                left: f === "facebook" ? 820 : Math.round((left + right) / 2),
                top: f === "facebook" ? 180 : 76,
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                gap: f === "facebook" ? 22 : 16,
                zIndex: 6,
                whiteSpace: "nowrap",
              }}
            >
              <Wordmark size={f === "facebook" ? 44 : 32} />
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: f === "facebook" ? 64 : 46, letterSpacing: "-0.035em", lineHeight: 1, color: INK }}>
                meet the crew
              </span>
            </div>
          ) : null}
          {CREW.map((c, i) => (
            <MascotSticker
              key={c.name}
              name={c.name}
              view={c.view}
              cx={Math.round(left + i * step)}
              cy={rowY + (i % 2 ? (page ? 4 : 18) : page ? -4 : -18)}
              width={mw}
              tilt={i % 2 ? 6 : -6}
              shadow="#D9C7AE"
              z={4}
            />
          ))}
        </>
      );
    },
  },
  {
    id: "cover-peekaboo",
    title: "Peek-a-boo",
    description: "Crew peeking up from the bottom of a forest banner.",
    group: "everyday",
    background: G.forest,
    draw: (f) => {
      const { height } = COVER_FORMATS[f];
      const page = f === "linkedin-page";
      const names = page ? (["pip", "dig", "clover"] as const) : (["pip", "nutmeg", "dig", "fennel", "marigold", "dot", "bramble"] as const);
      const left = page ? 900 : f === "facebook" ? 330 : 520;
      const right = page ? 1080 : f === "facebook" ? 1320 : 1500;
      const mw = page ? 84 : f === "facebook" ? 220 : 150;
      const mh = Math.round((mw * 260) / 240);
      const step = (right - left) / (names.length - 1);
      return (
        <>
          <Bg f={f} kind="stars" base={G.forest} ink="#3D5C4C" />
          {page ? (
            <CoverCopy f={f} tone="dark" />
          ) : (
            <CoverCopy f={f} tone="dark" align="center" x={f === "facebook" ? 820 : 1000} cy={f === "facebook" ? 190 : 108} maxW={f === "facebook" ? 960 : 900} tag={false} scale={f === "facebook" ? 1 : 0.92} />
          )}
          {names.map((n, i) => (
            <MascotSticker
              key={n}
              name={n}
              view={crewMember(n).view}
              cx={Math.round(left + i * step)}
              cy={Math.round(height - mh * 0.22 + (i % 2 ? mh * 0.08 : 0))}
              width={mw}
              tilt={i % 2 ? 5 : -5}
              shadow={G.forestDeep}
              outlineColor={G.paper}
              z={4}
            />
          ))}
        </>
      );
    },
  },
  {
    id: "cover-features",
    title: "Feature stickers",
    description: "Five crew stickers, each labelled with what it does.",
    group: "everyday",
    background: PASTEL.sky,
    draw: (f) => {
      const page = f === "linkedin-page";
      const names = page ? (["pip", "nutmeg", "fennel"] as const) : (["pip", "nutmeg", "fennel", "loam", "dot"] as const);
      const fb = f === "facebook";
      const left = page ? 970 : fb ? 400 : 960;
      const right = page ? 1086 : fb ? 1240 : 1520;
      const step = (right - left) / (names.length - 1);
      const mw = page ? 60 : fb ? 180 : 118;
      const rowY = page ? 96 : fb ? 360 : 168;
      return (
        <>
          <Bg f={f} kind="dots" base={PASTEL.sky} ink="#D3E2F7" />
          {page ? (
            <CoverCopy f={f} />
          ) : fb ? (
            <CoverCopy f={f} align="center" x={820} cy={128} maxW={1000} tag={false} wordmark={false} scale={0.86} />
          ) : (
            <CoverCopy f={f} maxW={440} scale={0.9} />
          )}
          {names.map((n, i) => {
            const c = crewMember(n);
            return (
              <div key={n}>
                <MascotSticker name={n} view={c.view} cx={Math.round(left + i * step)} cy={rowY} width={mw} tilt={i % 2 ? 6 : -6} shadow="#A9BFD8" z={4} />
                {!page ? (
                  <div style={{ position: "absolute", left: Math.round(left + i * step), top: rowY + Math.round(mw * 0.62), transform: "translateX(-50%)", zIndex: 6 }}>
                    <TagPill size={fb ? 26 : 18} bg="#FFFFFF" color={INK} shadow="#A9BFD8" edge={INK} rotate={i % 2 ? 3 : -3}>{c.short}</TagPill>
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
    id: "cover-winter",
    title: "Winter holidays",
    description: "Santa-hat bowl, snow and a holiday greeting.",
    group: "seasonal",
    background: G.forest,
    season: { label: "Winter holidays", from: "12-01", to: "12-31" },
    draw: (f) => {
      const a = ART_AREA[f];
      const { width, height } = COVER_FORMATS[f];
      return (
        <>
          <Bg f={f} kind="dots" base={G.forest} ink="#4A6858" />
          <Scatter pieces={["flake"]} colors={["#FFFFFF"]} count={f === "linkedin-page" ? 6 : 14} seed={7} w={width} h={height} avoid={[{ x: 0, y: 0, w: a.cx - a.bowl * 0.6, h: height }]} cx={a.cx} cy={a.cy} clear={a.bowl * 0.6} size={[s(f, 34), s(f, 64)]} opacity={0.85} />
          <CoverCopy f={f} tone="dark" headline="Happy holidays, from our crew to yours" short="Happy holidays from MudKitchen" tag={false} maxW={f === "facebook" ? 520 : 470} />
          <BowlSticker cx={a.cx} cy={a.cy + s(f, 30)} width={Math.round(a.bowl * 0.86)} tilt={-4} shadow={G.forestDeep}>
            <Art svg={ART.scarf} x={156} y={246} w={300} h={150} z={3} />
            <Art svg={ART.santaHat} x={BOWL.spoonTip.x - 6} y={BOWL.spoonTip.y + 4} w={150} rotate={BOWL.spoonAngle} z={4} />
          </BowlSticker>
        </>
      );
    },
  },
  {
    id: "cover-spring",
    title: "Spring",
    description: "Blossom bowl, egg stickers and “hello, spring!”.",
    group: "seasonal",
    background: PASTEL.mint,
    season: { label: "Spring", from: "03-15", to: "05-15" },
    draw: (f) => {
      const a = ART_AREA[f];
      const sh = "#A8C79C";
      return (
        <>
          <Bg f={f} kind="waves" base={PASTEL.mint} ink="#CDE2C4" />
          <CoverCopy f={f} headline="Hello, spring! Fresh starts for your school" short="Hello, spring! — MudKitchen" tag={false} maxW={f === "facebook" ? 560 : 500} />
          <BowlSticker cx={a.cx} cy={a.cy + s(f, 20)} width={a.bowl} tilt={6} shadow={sh}>
            <Art svg={PIECE.blossom("#FFFFFF")} x={BOWL.sproutTop.x + 4} y={BOWL.sproutTop.y + 6} w={58} z={4} />
            <Art svg={PIECE.blossom(ROSE)} x={BOWL.sproutTop.x + 52} y={BOWL.sproutTop.y + 44} w={42} z={4} />
            <Art svg={PIECE.blossom(G.butter)} x={BOWL.sproutTop.x - 40} y={BOWL.sproutTop.y + 50} w={38} z={4} />
          </BowlSticker>
          {f !== "linkedin-page" ? (
            <>
              <PieceSticker piece="egg" color="#B9D8F5" x={a.cx - s(f, 300)} y={a.cy + s(f, 150)} w={s(f, 100)} rotate={-16} shadow={sh} z={5} />
              <PieceSticker piece="egg" color="#F7B8C4" x={a.cx + s(f, 300)} y={a.cy + s(f, 140)} w={s(f, 90)} rotate={14} shadow={sh} z={5} />
              <PieceSticker piece="blossom" color={ROSE} x={a.cx + s(f, 280)} y={a.cy - s(f, 190)} w={s(f, 80)} shadow={sh} z={5} />
            </>
          ) : null}
        </>
      );
    },
  },
  {
    id: "cover-back-to-school",
    title: "Back to school",
    description: "Chalkboard banner with apple and pencil stickers.",
    group: "seasonal",
    background: CHALK,
    season: { label: "Back to school", from: "08-01", to: "09-15" },
    draw: (f) => {
      const a = ART_AREA[f];
      const page = f === "linkedin-page";
      return (
        <>
          <Bg f={f} kind="grid" base={CHALK} ink="#2E4639" size={80} />
          <CoverCopy f={f} tone="chalk" hand headline="Back to school!" short="Back to school with MudKitchen!" tag={false} />
          <BowlSticker
            cx={a.cx}
            cy={a.cy - s(f, 20)}
            width={Math.round(a.bowl * 0.86)}
            tilt={-4}
            shadow="#132219"
            outlineColor={G.paper}
            around={<Art svg={ART.pencil} x={a.cx} y={a.cy + s(f, 230)} w={s(f, 380)} h={s(f, 84)} rotate={-4} z={4} />}
          >
            <Art svg={ART.apple} x={BOWL.rimLeft.x + 30} y={BOWL.rimLeft.y - 26} w={88} h={96} rotate={-12} z={4} />
          </BowlSticker>
          {!page ? (
            <>
              <div style={{ position: "absolute", left: a.cx - s(f, 330), top: a.cy - s(f, 200), fontFamily: FONT.hand, fontSize: s(f, 60), color: "#F4EFE6", transform: "rotate(-10deg)", zIndex: 2 }}>ABC</div>
              <div style={{ position: "absolute", left: a.cx + s(f, 230), top: a.cy - s(f, 210), fontFamily: FONT.hand, fontSize: s(f, 52), color: "#F4EFE6", transform: "rotate(8deg)", zIndex: 2 }}>1+2=3</div>
              <ArtSticker svg={ART.chalkStar} x={a.cx + s(f, 330)} y={a.cy + s(f, 120)} w={s(f, 70)} outlineColor={CHALK} />
            </>
          ) : null}
        </>
      );
    },
  },
];

export const COVER_MARKS: BrandMark[] = CONCEPTS.flatMap((concept) =>
  COVER_FORMAT_ORDER.map((format): BrandMark => {
    const { width, height } = COVER_FORMATS[format];
    return {
      id: `${concept.id}-${format}`,
      title: concept.title,
      description: concept.description,
      kind: "cover",
      group: concept.group,
      season: concept.season,
      background: concept.background,
      fileName: `${concept.id.replace(/^cover-/, "")}-${format}.png`,
      width,
      height,
      stage: { w: width, h: height },
      concept: concept.id,
      format,
      render: () => concept.draw(format),
    };
  }),
);
