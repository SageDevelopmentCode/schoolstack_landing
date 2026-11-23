"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import type { ReactNode } from "react";
import { FONT, G } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  ART,
  Art,
  BOWL,
  BowlSticker,
  CONFETTI_COLORS,
  darken,
  INK,
  Layer,
  MascotSticker,
  PASTEL,
  Pattern,
  PieceSticker,
  Scatter,
  stickerFilter,
  TagPill,
  Tape,
  Wordmark,
  type PatternKind,
} from "@/components/admin/marketing/brand-marks/mark-kit";
import { crewMember } from "@/components/admin/marketing/brand-marks/crew";
import type { BrandMark, Rect } from "@/components/admin/marketing/brand-marks/types";
import { LINK_PREVIEW_CARDS, LINK_PREVIEW_SIZE, type LinkPreviewCard } from "@/lib/marketing/link-previews";

// Link previews: the 1200×630 card chat apps and social sites show for a pasted link. Same sticker look
// as the Covers (pastel pattern, die-cut bowl and crew, Bricolage headline), one card per public page.
// Copy lives in src/lib/marketing/link-previews.ts. Chat bubbles show these at ~300px wide, so headlines
// stay big (≥ 60px) and everything important sits inside SAFE (WhatsApp and some feeds crop the edges).

const W = LINK_PREVIEW_SIZE.width;
const H = LINK_PREVIEW_SIZE.height;
/** Keep words and faces in here. */
const SAFE: Rect = { x: 60, y: 40, w: W - 120, h: H - 80 };
/** The copy column; scatter pieces stay out of it. */
const COPY_AREA: Rect = { x: 0, y: 0, w: 700, h: H };

// ---------------------------------------------------------------- copy

type CopyProps = {
  card: LinkPreviewCard;
  dark?: boolean;
  /** Colour of the accent phrase. */
  accent?: string;
  /** Headline size (px on the 1200 stage). */
  head?: number;
  maxW?: number;
  x?: number;
  cy?: number;
  align?: "left" | "center";
  /** Render `card.chips` under the headline (off when the art labels them instead). */
  chips?: boolean;
  /** Shadow colour for the chips. */
  chipShadow?: string;
};

function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "7px 16px 8px",
        borderRadius: 999,
        border: `3px solid ${dark ? G.cream : INK}`,
        background: dark ? "transparent" : "#FFFFFF",
        color: dark ? G.cream : INK,
        fontFamily: FONT.body,
        fontWeight: 800,
        fontSize: 19,
        lineHeight: 1,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function CardCopy({ card, dark = false, accent = G.clay, head = 72, maxW = 600, x = SAFE.x + 12, cy = H / 2, align = "left", chips = true, chipShadow = INK }: CopyProps) {
  const ink = dark ? G.cream : INK;
  const centered = align === "center";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: Math.round(cy),
        width: maxW,
        transform: centered ? "translate(-50%, -50%)" : "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: centered ? "center" : "flex-start",
        textAlign: align,
        gap: 24,
        zIndex: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", justifyContent: centered ? "center" : "flex-start" }}>
        <Wordmark size={32} color={ink} />
        {card.eyebrow ? <Eyebrow dark={dark}>{card.eyebrow}</Eyebrow> : null}
      </div>
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: head, lineHeight: 0.98, letterSpacing: "-0.035em", color: ink }}>
        {card.lead}
        {card.accent ? <span style={{ color: accent }}> {card.accent}</span> : null}
        {card.tail ? <> {card.tail}</> : null}
      </div>
      {card.sub ? (
        <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 26, lineHeight: 1.3, color: dark ? "rgba(247,241,231,.86)" : G.soft, maxWidth: maxW - 20 }}>
          {card.sub}
        </div>
      ) : null}
      {chips && card.chips?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: centered ? "center" : "flex-start", maxWidth: maxW }}>
          {card.chips.map((chip, i) => (
            <TagPill key={chip} size={22} bg="#FFFFFF" color={INK} edge={INK} shadow={chipShadow} rotate={i % 2 ? 1.5 : -1.5}>
              ✓ {chip}
            </TagPill>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- art helpers

function Bg({ kind, base, ink, size = 80 }: { kind: PatternKind; base: string; ink?: string; size?: number }) {
  return <Pattern kind={kind} base={base} ink={ink} size={size} w={W} h={H} />;
}

function Sparkles({ count = 8, seed = 3, color = "#FFFFFF", cx = 930, cy = 315, clear = 170 }: { count?: number; seed?: number; color?: string; cx?: number; cy?: number; clear?: number }) {
  return <Scatter pieces={["sparkle"]} colors={[color]} count={count} seed={seed} w={W} h={H} cx={cx} cy={cy} clear={clear} avoid={[COPY_AREA]} size={[26, 46]} />;
}

/** A taped photo print, centred on (x, y). `w × h` is the photo itself. */
function Polaroid({ src, x, y, w, h, rotate = 0, tape = "rgba(255,229,138,.85)", z = 4 }: { src: string; x: number; y: number; w: number; h: number; rotate?: number; tape?: string; z?: number }) {
  const pad = 14;
  const bottom = 46;
  const outerW = w + pad * 2;
  const outerH = h + pad + bottom;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: Math.round(x - outerW / 2),
          top: Math.round(y - outerH / 2),
          width: outerW,
          height: outerH,
          padding: `${pad}px ${pad}px ${bottom}px`,
          boxSizing: "border-box",
          background: "#FFFFFF",
          borderRadius: 6,
          boxShadow: "0 20px 34px -16px rgba(43,36,29,.55)",
          transform: rotate ? `rotate(${rotate}deg)` : undefined,
          zIndex: z,
        }}
      >
        <img src={src} alt="" aria-hidden width={w} height={h} style={{ width: w, height: h, objectFit: "cover", display: "block", borderRadius: 3, maxWidth: "none" }} />
      </div>
      <Tape x={x} y={Math.round(y - outerH / 2 + 4)} w={128} rotate={rotate - 6} color={tape} z={z + 1} />
    </>
  );
}

/** An app screen in a white phone, as one die-cut sticker. Centred on (x, y). */
function PhoneSticker({ src, x, y, w, rotate = 0, shadow, z = 4 }: { src: string; x: number; y: number; w: number; rotate?: number; shadow: string; z?: number }) {
  const bezel = 10;
  const screenH = Math.round((w * 2087) / 960);
  const outerW = w + bezel * 2;
  const outerH = screenH + bezel * 2;
  return (
    <Layer z={z} style={{ filter: stickerFilter(6, "#FFFFFF", shadow, 14) }}>
      <div
        style={{
          position: "absolute",
          left: Math.round(x - outerW / 2),
          top: Math.round(y - outerH / 2),
          width: outerW,
          height: outerH,
          padding: bezel,
          boxSizing: "border-box",
          background: INK,
          borderRadius: 38,
          transform: rotate ? `rotate(${rotate}deg)` : undefined,
        }}
      >
        <img src={src} alt="" aria-hidden width={w} height={screenH} style={{ width: w, height: screenH, display: "block", borderRadius: 28, maxWidth: "none" }} />
      </div>
    </Layer>
  );
}

/** Crew sticker with a little label tag under it. */
function LabelledCrew({ name, x, y, w, tilt, shadow, label }: { name: Parameters<typeof crewMember>[0]; x: number; y: number; w: number; tilt: number; shadow: string; label: string }) {
  return (
    <>
      <MascotSticker name={name} view={crewMember(name).view} cx={x} cy={y} width={w} tilt={tilt} shadow={shadow} z={4} />
      <div style={{ position: "absolute", left: x, top: y + Math.round(w * 0.6), transform: "translateX(-50%)", zIndex: 6 }}>
        <TagPill size={22} bg="#FFFFFF" color={INK} edge={INK} shadow={shadow} rotate={tilt > 0 ? 3 : -3}>
          {label}
        </TagPill>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- the cards

type Design = { background: string; description: string; draw: (card: LinkPreviewCard) => ReactNode };

const SKY_INK = "#D3E2F7";
const SKY_SHADOW = "#A9BFD8";
const MINT_SHADOW = "#A8C79C";
const PEACH_SHADOW = "#D9A88F";
const LAV_SHADOW = "#BBA6CC";
const BUTTER_SHADOW = "#C99A2E";

const DESIGNS: Record<string, Design> = {
  home: {
    background: PASTEL.butter,
    description: "Butter gingham, bowl with Pip, Dig and Clover.",
    draw: (card) => (
      <>
        <Bg kind="gingham" base={PASTEL.butter} ink="#F2C75C" size={90} />
        <CardCopy card={card} head={70} maxW={580} accent={G.clayDeep} chipShadow={BUTTER_SHADOW} />
        <BowlSticker cx={945} cy={290} width={320} tilt={-6} shadow={BUTTER_SHADOW} />
        <MascotSticker name="pip" view="wave" cx={790} cy={470} width={180} tilt={-8} shadow={BUTTER_SHADOW} z={5} />
        <MascotSticker name="dig" view="happy" cx={1070} cy={460} width={180} tilt={8} shadow={BUTTER_SHADOW} z={5} />
        <MascotSticker name="clover" view="excited" cx={1085} cy={140} width={130} tilt={10} shadow={BUTTER_SHADOW} z={5} />
      </>
    ),
  },
  "get-started": {
    background: G.forest,
    description: "Forest banner with the crew peeking up from the bottom.",
    draw: (card) => {
      const names = ["pip", "nutmeg", "dig", "fennel", "marigold", "dot", "bramble"] as const;
      const left = 150;
      const right = 1050;
      const mw = 160;
      const mh = Math.round((mw * 260) / 240);
      const step = (right - left) / (names.length - 1);
      return (
        <>
          <Bg kind="stars" base={G.forest} ink="#3D5C4C" />
          <CardCopy card={card} dark accent={G.butter} head={90} maxW={1060} x={W / 2} cy={215} align="center" />
          {names.map((n, i) => (
            <MascotSticker
              key={n}
              name={n}
              view={crewMember(n).view}
              cx={Math.round(left + i * step)}
              cy={Math.round(H - mh * 0.34 + (i % 2 ? mh * 0.08 : 0))}
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
  "free-preview": {
    background: PASTEL.sky,
    description: "Sky dots, three tick tags, Terra, Pip and Dig.",
    draw: (card) => (
      <>
        <Bg kind="dots" base={PASTEL.sky} ink={SKY_INK} />
        <Sparkles seed={5} />
        <CardCopy card={card} head={70} maxW={600} chipShadow={SKY_SHADOW} />
        <MascotSticker name="terra" view="happy" cx={965} cy={190} width={200} tilt={-6} shadow={SKY_SHADOW} z={4} />
        <MascotSticker name="pip" view="wave" cx={850} cy={445} width={185} tilt={-4} shadow={SKY_SHADOW} z={5} />
        <MascotSticker name="dig" view="happy" cx={1080} cy={435} width={185} tilt={7} shadow={SKY_SHADOW} z={5} />
      </>
    ),
  },
  try: {
    background: PASTEL.mint,
    description: "Mint dots and one big bowl sticker.",
    draw: (card) => (
      <>
        <Bg kind="dots" base={PASTEL.mint} />
        <Sparkles seed={4} count={9} clear={220} />
        <CardCopy card={card} head={84} maxW={560} accent={G.forest} />
        <BowlSticker cx={935} cy={315} width={380} tilt={-8} shadow={darken(PASTEL.mint, 0.26)} />
      </>
    ),
  },
  about: {
    background: G.cream,
    description: "Graph paper, a taped Sage Field photo and Pip.",
    draw: (card) => (
      <>
        <Bg kind="grid" base={G.cream} ink="#E8DCCB" size={60} />
        <CardCopy card={card} head={60} maxW={610} />
        <Polaroid src="/images/sagefield/entrance.jpg" x={945} y={300} w={270} h={330} rotate={4} />
        <MascotSticker name="pip" view="wave" cx={1105} cy={505} width={150} tilt={8} shadow="#D9C7AE" z={6} />
        <BowlSticker cx={790} cy={505} width={130} tilt={-10} shadow="#D9C7AE" z={6} />
      </>
    ),
  },
  features: {
    background: PASTEL.sky,
    description: "Sky dots, three crew stickers labelled with the roles.",
    draw: (card) => {
      const labels = card.chips ?? [];
      const shadow = "#B9CBE6";
      return (
        <>
          <Bg kind="dots" base={PASTEL.sky} ink="#D3E2F7" />
          <Sparkles seed={21} count={7} clear={0} />
          <CardCopy card={card} head={78} maxW={580} chips={false} />
          <LabelledCrew name="nutmeg" x={810} y={240} w={160} tilt={-5} shadow={shadow} label={labels[0] ?? ""} />
          <LabelledCrew name="pip" x={975} y={190} w={160} tilt={6} shadow={shadow} label={labels[1] ?? ""} />
          <LabelledCrew name="dig" x={1110} y={330} w={150} tilt={-4} shadow={shadow} label={labels[2] ?? ""} />
        </>
      );
    },
  },
  customers: {
    background: PASTEL.peach,
    description: "Peach dots with two taped Sage Field photos.",
    draw: (card) => (
      <>
        <Bg kind="dots" base={PASTEL.peach} />
        <CardCopy card={card} head={86} maxW={560} />
        <Polaroid src="/images/sagefield/kids-running.jpg" x={920} y={225} w={340} h={226} rotate={-4} />
        <Polaroid src="/images/sagefield/garden.jpg" x={1075} y={430} w={180} h={230} rotate={6} tape="rgba(221,235,213,.92)" z={6} />
      </>
    ),
  },
  sagefield: {
    background: PASTEL.peach,
    description: "Peach dots, the Sage Field classroom photo and a bowl.",
    draw: (card) => (
      <>
        <Bg kind="dots" base={PASTEL.peach} />
        <CardCopy card={card} head={64} maxW={660} accent={G.forest} />
        <Polaroid src="/images/sagefield/classroom-main.jpg" x={960} y={300} w={270} h={340} rotate={4} />
        <BowlSticker cx={800} cy={500} width={140} tilt={-10} shadow={PEACH_SHADOW} z={6} />
      </>
    ),
  },
  tools: {
    background: PASTEL.lav,
    description: "Lav dots, three crew stickers labelled with the tools.",
    draw: (card) => {
      const labels = card.chips ?? [];
      return (
        <>
          <Bg kind="dots" base={PASTEL.lav} />
          <Sparkles seed={8} count={7} clear={0} />
          <CardCopy card={card} head={84} maxW={560} chips={false} />
          <LabelledCrew name="pip" x={800} y={260} w={160} tilt={-6} shadow={LAV_SHADOW} label={labels[0] ?? ""} />
          <LabelledCrew name="nutmeg" x={970} y={200} w={160} tilt={5} shadow={LAV_SHADOW} label={labels[1] ?? ""} />
          <LabelledCrew name="dig" x={1110} y={330} w={150} tilt={-5} shadow={LAV_SHADOW} label={labels[2] ?? ""} />
        </>
      );
    },
  },
  "how-many-students": {
    background: PASTEL.mint,
    description: "Mint waves and a big Pip.",
    draw: (card) => (
      <>
        <Bg kind="waves" base={PASTEL.mint} ink="#CDE2C4" />
        <Sparkles seed={11} />
        <CardCopy card={card} head={74} maxW={600} accent={G.forest} />
        <MascotSticker name="pip" view="wave" cx={955} cy={320} width={310} tilt={-6} shadow={MINT_SHADOW} z={4} />
      </>
    ),
  },
  "tuition-planner": {
    background: PASTEL.sky,
    description: "Sky stripes, a big Nutmeg and coin stickers.",
    draw: (card) => (
      <>
        <Bg kind="stripes" base={PASTEL.sky} ink={SKY_INK} />
        <CardCopy card={card} head={76} maxW={600} />
        <MascotSticker name="nutmeg" view="thumbs" cx={960} cy={330} width={300} tilt={6} shadow={SKY_SHADOW} z={4} />
        <PieceSticker piece="coin" color={G.butter} x={790} y={170} w={90} rotate={-12} shadow={SKY_SHADOW} z={5} />
        <PieceSticker piece="coin" color={G.butter} x={1120} y={500} w={74} rotate={14} shadow={SKY_SHADOW} z={5} />
      </>
    ),
  },
  "ops-check": {
    background: PASTEL.apricot,
    description: "Apricot checks, a big Bramble and star stickers.",
    draw: (card) => (
      <>
        <Bg kind="checker" base={PASTEL.apricot} />
        <CardCopy card={card} head={74} maxW={600} />
        <MascotSticker name="bramble" view="cheeky" cx={955} cy={320} width={300} tilt={-5} shadow="#D9AE84" z={4} />
        <PieceSticker piece="star" color={G.butter} x={1120} y={150} w={84} rotate={12} shadow="#D9AE84" z={5} />
        <PieceSticker piece="star" color="#FFFFFF" x={790} y={500} w={64} rotate={-10} shadow="#D9AE84" z={5} />
      </>
    ),
  },
  blog: {
    background: PASTEL.lav,
    description: "Lav waves with Loam and Tansy.",
    draw: (card) => (
      <>
        <Bg kind="waves" base={PASTEL.lav} />
        <Sparkles seed={13} />
        <CardCopy card={card} head={88} maxW={580} />
        <MascotSticker name="loam" view="wink" cx={890} cy={300} width={250} tilt={-6} shadow={LAV_SHADOW} z={4} />
        <MascotSticker name="tansy" view="celebrate" cx={1090} cy={390} width={210} tilt={7} shadow={LAV_SHADOW} z={5} />
      </>
    ),
  },
  download: {
    background: PASTEL.sage,
    description: "Sage dots, the app in a phone sticker and Pip.",
    draw: (card) => (
      <>
        <Bg kind="dots" base={PASTEL.sage} />
        <CardCopy card={card} head={80} maxW={580} accent={G.forest} />
        <PhoneSticker src="/images/mobileapp/1.webp" x={985} y={330} w={230} rotate={6} shadow={MINT_SHADOW} />
        <MascotSticker name="pip" view="wave" cx={810} cy={470} width={170} tilt={-8} shadow={MINT_SHADOW} z={5} />
      </>
    ),
  },
  "gift-card": {
    background: PASTEL.butter,
    description: "Butter gingham, confetti and a party-hat bowl.",
    draw: (card) => (
      <>
        <Bg kind="gingham" base={PASTEL.butter} ink="#F2C75C" size={90} />
        <Scatter pieces={["confetti", "dot"]} colors={CONFETTI_COLORS} count={16} seed={21} w={W} h={H} cx={950} cy={320} clear={200} avoid={[COPY_AREA]} size={[22, 40]} />
        <CardCopy card={card} head={62} maxW={620} accent={G.clayDeep} />
        <BowlSticker cx={955} cy={345} width={320} tilt={6} shadow={BUTTER_SHADOW}>
          <Art svg={ART.partyHat} x={BOWL.spoonTip.x - 8} y={BOWL.spoonTip.y - 4} w={120} h={158} rotate={BOWL.spoonAngle} z={4} />
        </BowlSticker>
      </>
    ),
  },
  "demo-school": {
    background: PASTEL.sky,
    description: "Sky grid with Dig, Fennel and Pip.",
    draw: (card) => (
      <>
        <Bg kind="grid" base={PASTEL.sky} ink={SKY_INK} size={60} />
        <CardCopy card={card} head={64} maxW={600} />
        <MascotSticker name="dig" view="happy" cx={955} cy={195} width={200} tilt={-6} shadow={SKY_SHADOW} z={4} />
        <MascotSticker name="fennel" view="excited" cx={840} cy={445} width={180} tilt={-4} shadow={SKY_SHADOW} z={5} />
        <MascotSticker name="pip" view="wave" cx={1080} cy={440} width={180} tilt={7} shadow={SKY_SHADOW} z={5} />
      </>
    ),
  },
  "website-demo": {
    background: PASTEL.apricot,
    description: "Apricot dots with Terra and Marigold.",
    draw: (card) => (
      <>
        <Bg kind="dots" base={PASTEL.apricot} />
        <Sparkles seed={17} />
        <CardCopy card={card} head={66} maxW={600} />
        <MascotSticker name="terra" view="happy" cx={905} cy={305} width={260} tilt={-6} shadow="#D9AE84" z={4} />
        <MascotSticker name="marigold" view="love" cx={1100} cy={420} width={190} tilt={8} shadow="#D9AE84" z={5} />
      </>
    ),
  },
};

export const LINK_PREVIEW_MARKS: BrandMark[] = LINK_PREVIEW_CARDS.map((card): BrandMark => {
  const design = DESIGNS[card.id] ?? DESIGNS.home;
  return {
    id: `og-${card.id}`,
    title: card.title,
    description: design.description,
    kind: "link-preview",
    group: "everyday",
    background: design.background,
    fileName: `${card.id}.png`,
    width: W,
    height: H,
    stage: { w: W, h: H },
    pages: card.paths,
    render: () => design.draw(card),
  };
});
