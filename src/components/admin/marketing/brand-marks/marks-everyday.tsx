"use client";

import type { ReactNode } from "react";
import { G } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  BowlFace,
  BowlSticker,
  CENTER,
  darken,
  MascotSticker,
  Pattern,
  PASTEL,
  PieceSticker,
  Scatter,
  Tape,
  type PatternKind,
} from "@/components/admin/marketing/brand-marks/mark-kit";
import { SQUARE_OUTPUT, SQUARE_STAGE, type BrandMark, type BrandMarkGroup, type BrandMarkSeason } from "@/components/admin/marketing/brand-marks/types";

export type Variant = "avatar" | "icon";

export type Scene = {
  id: string;
  title: string;
  description?: string;
  background: string;
  season?: BrandMarkSeason;
  /** Which outputs this scene makes (default both). */
  kinds?: Variant[];
  draw: (variant: Variant) => ReactNode;
};

/** Turns scenes into avatar + app-icon marks (`<id>` and `<id>-icon`). */
export function marksFromScenes(group: BrandMarkGroup, scenes: Scene[]): BrandMark[] {
  return scenes.flatMap((scene) =>
    (scene.kinds ?? ["avatar", "icon"]).map((variant): BrandMark => {
      const size = SQUARE_OUTPUT[variant === "avatar" ? "avatar" : "app-icon"];
      return {
        id: variant === "avatar" ? scene.id : `${scene.id}-icon`,
        title: scene.title,
        description: scene.description,
        kind: variant === "avatar" ? "avatar" : "app-icon",
        group,
        season: scene.season,
        background: scene.background,
        fileName: `${scene.id}${variant === "icon" ? "-app-icon" : ""}.png`,
        width: size,
        height: size,
        stage: { w: SQUARE_STAGE, h: SQUARE_STAGE },
        render: () => scene.draw(variant),
      };
    }),
  );
}

/** Bowl width for the variant: big, but inside the circle crop / icon grid. */
export const bowlWidth = (v: Variant, avatar = 700, icon = 730) => (v === "icon" ? icon : avatar);

type BowlSceneProps = {
  v: Variant;
  base: string;
  pattern: PatternKind;
  ink?: string;
  patternSize?: number;
  tilt?: number;
  width?: number;
  cy?: number;
  cx?: number;
  shadow?: string;
  outlineColor?: string;
  /** Accessories in bowl units. */
  children?: ReactNode;
  around?: ReactNode;
  /** Decor behind / beside the sticker. */
  decor?: ReactNode;
};

/** The house layout: pastel pattern + one big bowl sticker (+ decor). */
export function BowlScene({ v, base, pattern, ink, patternSize, tilt = -6, width, cy = 560, cx = CENTER, shadow, outlineColor, children, around, decor }: BowlSceneProps) {
  return (
    <>
      <Pattern kind={pattern} base={base} ink={ink} size={patternSize} />
      {decor}
      <BowlSticker cx={cx} cy={cy} width={width ?? bowlWidth(v)} tilt={tilt} shadow={shadow ?? darken(base, 0.26)} outlineColor={outlineColor} around={around}>
        {children}
      </BowlSticker>
    </>
  );
}

/** A few plain sparkles that stay out of the hero and inside the crop. */
export function Sparkles({ v, color = "#FFFFFF", seed = 4, count = 6 }: { v: Variant; color?: string; seed?: number; count?: number }) {
  return <Scatter pieces={["sparkle"]} colors={[color]} count={count} seed={seed} clear={410} within={v === "avatar" ? 500 : undefined} size={[34, 60]} />;
}

const EVERYDAY: Scene[] = [
  {
    id: "mint-dots",
    title: "Mint sticker",
    description: "The original sticker — mint with tiny dots.",
    background: PASTEL.mint,
    draw: (v) => <BowlScene v={v} base={PASTEL.mint} pattern="dots" tilt={-8} decor={<Sparkles v={v} />} />,
  },
  {
    id: "butter-gingham",
    title: "Butter gingham",
    description: "Picnic-cloth gingham, sunny yellow.",
    background: PASTEL.butter,
    draw: (v) => <BowlScene v={v} base={PASTEL.butter} pattern="gingham" ink="#F2C75C" patternSize={110} tilt={6} shadow="#C99A2E" />,
  },
  {
    id: "peach-polka",
    title: "Peach polka",
    description: "Big soft polka dots on peach.",
    background: PASTEL.peach,
    draw: (v) => <BowlScene v={v} base={PASTEL.peach} pattern="polka" ink="#FFF1EA" patternSize={150} tilt={-5} decor={<Sparkles v={v} seed={11} />} />,
  },
  {
    id: "sky-clouds",
    title: "Sky clouds",
    description: "Cloud stickers drifting on sky blue.",
    background: PASTEL.sky,
    draw: (v) => (
      <BowlScene
        v={v}
        base={PASTEL.sky}
        pattern="dots"
        ink="#D3E2F7"
        tilt={5}
        decor={
          <>
            <PieceSticker piece="cloud" color="#FFFFFF" x={v === "avatar" ? 250 : 190} y={v === "avatar" ? 250 : 170} w={170} shadow="#B8CBE8" z={2} />
            <PieceSticker piece="cloud" color="#FFFFFF" x={v === "avatar" ? 860 : 900} y={v === "avatar" ? 330 : 280} w={130} shadow="#B8CBE8" z={2} />
          </>
        }
      />
    ),
  },
  {
    id: "lavender-stars",
    title: "Lavender stars",
    description: "Twinkly lavender with butter star stickers.",
    background: PASTEL.lav,
    draw: (v) => (
      <BowlScene
        v={v}
        base={PASTEL.lav}
        pattern="stars"
        ink="#D9C8E8"
        tilt={-10}
        decor={
          <>
            <PieceSticker piece="star" color={G.butter} x={v === "avatar" ? 240 : 170} y={v === "avatar" ? 300 : 200} w={96} rotate={-14} shadow="#B9A3CF" />
            <PieceSticker piece="star" color={G.butter} x={v === "avatar" ? 850 : 900} y={v === "avatar" ? 740 : 840} w={74} rotate={18} shadow="#B9A3CF" />
          </>
        }
      />
    ),
  },
  {
    id: "sage-stripes",
    title: "Sage stripes",
    description: "Calm diagonal stripes in sage.",
    background: PASTEL.sage,
    draw: (v) => <BowlScene v={v} base={PASTEL.sage} pattern="stripes" ink="#C8D8BB" patternSize={70} tilt={7} />,
  },
  {
    id: "graph-paper",
    title: "Taped to the notebook",
    description: "Sticker taped onto cream graph paper.",
    background: G.cream,
    draw: (v) => (
      <BowlScene
        v={v}
        base={G.cream}
        pattern="grid"
        ink="#E8DCCB"
        patternSize={72}
        tilt={-4}
        shadow="#D9C7AE"
        decor={
          <>
            <Tape x={v === "avatar" ? 270 : 250} y={v === "avatar" ? 300 : 280} rotate={-38} w={190} />
            <Tape x={v === "avatar" ? 810 : 840} y={v === "avatar" ? 820 : 850} rotate={-38} w={190} color="rgba(166,184,154,.8)" />
          </>
        }
      />
    ),
  },
  {
    id: "forest-night",
    title: "Forest night",
    description: "Deep forest with a cream sticker edge.",
    background: G.forest,
    draw: (v) => (
      <BowlScene
        v={v}
        base={G.forest}
        pattern="stars"
        ink="#3D5C4C"
        tilt={-6}
        shadow={G.forestDeep}
        outlineColor={G.paper}
        decor={<Sparkles v={v} color={G.butter} seed={6} count={7} />}
      />
    ),
  },
  {
    id: "clay-checker",
    title: "Clay checker",
    description: "Warm clay checks, cream sticker edge.",
    background: G.clay,
    draw: (v) => <BowlScene v={v} base={G.clay} pattern="checker" ink="#AA6852" patternSize={120} tilt={6} shadow={G.clayDeep} outlineColor={G.paper} />,
  },
  {
    id: "bowl-buddy",
    title: "Bowl buddy",
    description: "The bowl with a friendly face.",
    background: PASTEL.peach,
    draw: (v) => (
      <BowlScene
        v={v}
        base={PASTEL.peach}
        pattern="waves"
        ink="#F2CCBC"
        tilt={-4}
        decor={<PieceSticker piece="heart" color="#FF7A6B" x={v === "avatar" ? 830 : 880} y={v === "avatar" ? 270 : 190} w={88} rotate={14} shadow="#D9A898" />}
      >
        <BowlFace mood="happy" />
      </BowlScene>
    ),
  },
  {
    id: "pip-pal",
    title: "Bowl + Pip",
    description: "Pip sticker peeking in front of the bowl.",
    background: PASTEL.butter,
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene v={v} base={PASTEL.butter} pattern="dots" ink="#F5D46A" tilt={6} width={620} cx={600} cy={500} shadow="#C99A2E" />
        <MascotSticker name="pip" view="wave" cx={300} cy={720} width={340} tilt={-8} shadow="#C99A2E" z={5} />
      </>
    ),
  },
  {
    id: "sticker-sheet",
    title: "Sticker sheet",
    description: "Bowl with little Dig, Clover and heart stickers.",
    background: G.cream,
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene v={v} base={G.cream} pattern="grid" ink="#E8DCCB" patternSize={72} tilt={-6} width={580} cx={520} cy={500} shadow="#D9C7AE" />
        <MascotSticker name="dig" view="happy" cx={800} cy={790} width={240} tilt={8} shadow="#D9C7AE" z={5} />
        <MascotSticker name="clover" view="excited" cx={820} cy={250} width={170} tilt={10} shadow="#D9C7AE" z={5} />
        <PieceSticker piece="heart" color="#FF7A6B" x={240} y={810} w={90} rotate={-12} shadow="#D9C7AE" z={5} />
        <PieceSticker piece="star" color={G.butter} x={250} y={250} w={80} rotate={10} shadow="#D9C7AE" z={5} />
      </>
    ),
  },
];

export const EVERYDAY_MARKS = marksFromScenes("everyday", EVERYDAY);
