"use client";

import type { ReactNode } from "react";
import { G } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import { BowlFace, INK, PASTEL, StickerTag } from "@/components/admin/marketing/brand-marks/mark-kit";
import { bowlVectorMono } from "@/components/admin/marketing/brand-marks/bowl-vector";
import {
  ArcText,
  CLAY,
  CLAY_DEEP,
  DieCut,
  Edge,
  LOOK,
  SHAPE,
  Shape,
  VectorBowl,
  WordArt,
} from "@/components/admin/marketing/brand-marks/logo-kit";
import { LOGO_SCALE, type BrandMark, type LogoSection } from "@/components/admin/marketing/brand-marks/types";

// Transparent, die-cut logo stickers for print (Logos tab). Square designs are drawn on a 1080 stage,
// the bumper on 1620×540; all export at 3×. Keep everything (border included) at least ~40 units in
// from the stage edge so nothing is clipped.

type LogoDesign = {
  id: string;
  title: string;
  description: string;
  section: LogoSection;
  stage?: { w: number; h: number };
  draw: () => ReactNode;
};

function logoMarks(designs: LogoDesign[]): BrandMark[] {
  return designs.map(({ id, title, description, section, stage = { w: 1080, h: 1080 }, draw }) => ({
    id: `logo-${id}`,
    title,
    description,
    kind: "logo",
    group: "everyday",
    section,
    background: "transparent",
    fileName: `${id}.png`,
    width: stage.w * LOGO_SCALE,
    height: stage.h * LOGO_SCALE,
    stage,
    render: draw,
  }));
}

const MONO_INK = bowlVectorMono(INK);
const MONO_FOREST = bowlVectorMono(G.forest);
const MONO_CREAM = bowlVectorMono(G.paper);

// ---------------------------------------------------------------- bowl only

const BOWL_ONLY: LogoDesign[] = [
  {
    id: "bowl-classic",
    title: "Classic bowl",
    description: "The bowl, thick white die-cut border.",
    section: "bowl",
    draw: () => (
      <DieCut tilt={-6}>
        <VectorBowl cy={552} width={820} />
      </DieCut>
    ),
  },
  {
    id: "bowl-straight",
    title: "Straight bowl",
    description: "Level, no tilt. The safest everyday sticker.",
    section: "bowl",
    draw: () => (
      <DieCut>
        <VectorBowl cy={548} width={840} />
      </DieCut>
    ),
  },
  {
    id: "bowl-cream-edge",
    title: "Cream edge",
    description: "Warm cream border instead of white.",
    section: "bowl",
    draw: () => (
      <DieCut tilt={5} color={G.paper}>
        <VectorBowl cy={552} width={820} />
      </DieCut>
    ),
  },
  {
    id: "bowl-thin",
    title: "Thin border",
    description: "Slim border that hugs the bowl.",
    section: "bowl",
    draw: () => (
      <DieCut border={18}>
        <VectorBowl cy={548} width={900} />
      </DieCut>
    ),
  },
  {
    id: "bowl-happy",
    title: "Happy bowl",
    description: "The bowl with a little smile.",
    section: "bowl",
    draw: () => (
      <DieCut tilt={-4}>
        <VectorBowl cy={552} width={820}>
          <BowlFace mood="happy" />
        </VectorBowl>
      </DieCut>
    ),
  },
  {
    id: "bowl-love",
    title: "Heart eyes",
    description: "Heart-eyed bowl with two floating hearts.",
    section: "bowl",
    draw: () => (
      <DieCut tilt={-5}>
        <VectorBowl cy={590} width={760}>
          <BowlFace mood="love" />
        </VectorBowl>
        <Shape svg={SHAPE.heart("#FF7A6B")} x={200} y={210} w={150} rotate={-14} />
        <Shape svg={SHAPE.heart("#F4A6A0")} x={880} y={250} w={110} rotate={16} />
      </DieCut>
    ),
  },
  {
    id: "bowl-wink",
    title: "Wink",
    description: "A cheeky wink.",
    section: "bowl",
    draw: () => (
      <DieCut tilt={6}>
        <VectorBowl cy={552} width={820}>
          <BowlFace mood="wink" />
        </VectorBowl>
      </DieCut>
    ),
  },
  {
    id: "bowl-sparkles",
    title: "Sparkle bowl",
    description: "Bowl with butter sparkles, all one sticker.",
    section: "bowl",
    draw: () => (
      <DieCut tilt={-6}>
        <VectorBowl cy={590} width={740} />
        <Shape svg={SHAPE.sparkle(G.butter)} x={190} y={230} w={170} />
        <Shape svg={SHAPE.sparkle("#FFCF3F")} x={300} y={120} w={90} />
        <Shape svg={SHAPE.star(G.butter)} x={900} y={200} w={120} rotate={14} />
      </DieCut>
    ),
  },
  {
    id: "bowl-mint-disc",
    title: "Mint circle",
    description: "Round sticker: the bowl on mint with a dashed ring.",
    section: "bowl",
    draw: () => (
      <DieCut border={30}>
        <Shape svg={SHAPE.disc(PASTEL.mint, { color: "#FFFFFF", width: 10, inset: 44, dash: "2 26" })} w={960} />
        <VectorBowl cy={548} width={620} />
      </DieCut>
    ),
  },
  {
    id: "bowl-forest-disc",
    title: "Forest circle",
    description: "Round dark sticker, bowl with a cream edge.",
    section: "bowl",
    draw: () => (
      <DieCut border={30} color={G.paper}>
        <Shape svg={SHAPE.disc(G.forest, { color: "#3D5C4C", width: 14, inset: 40 })} w={960} />
        <Shape svg={SHAPE.sparkle(G.butter)} x={250} y={290} w={70} />
        <Shape svg={SHAPE.sparkle(G.butter)} x={830} y={300} w={50} />
        <Shape svg={SHAPE.sparkle(G.butter)} x={800} y={790} w={60} />
        <Edge border={14} color={G.paper}>
          <VectorBowl cy={552} width={600} />
        </Edge>
      </DieCut>
    ),
  },
  {
    id: "bowl-butter-square",
    title: "Butter square",
    description: "Rounded-square sticker on dotted butter.",
    section: "bowl",
    draw: () => (
      <DieCut border={30}>
        <Shape svg={SHAPE.squircle(G.butter, "#F2CF5C")} w={940} />
        <VectorBowl cy={548} width={640} />
      </DieCut>
    ),
  },
  {
    id: "bowl-peach-blob",
    title: "Peach splash",
    description: "The bowl on a soft peach blob.",
    section: "bowl",
    draw: () => (
      <DieCut tilt={-4}>
        <Shape svg={SHAPE.blob(G.peach)} w={940} />
        <VectorBowl cy={560} width={660} />
      </DieCut>
    ),
  },
  {
    id: "bowl-one-ink",
    title: "One colour · ink",
    description: "Flat ink bowl. Good for one-colour or vinyl prints.",
    section: "bowl",
    draw: () => (
      <DieCut>
        <VectorBowl cy={548} width={840} svg={MONO_INK} />
      </DieCut>
    ),
  },
  {
    id: "bowl-one-forest",
    title: "One colour · forest",
    description: "Flat forest-green bowl.",
    section: "bowl",
    draw: () => (
      <DieCut tilt={-6}>
        <VectorBowl cy={552} width={820} svg={MONO_FOREST} />
      </DieCut>
    ),
  },
];

// ---------------------------------------------------------------- bowl + MudKitchen

const WORDMARK: LogoDesign[] = [
  {
    id: "word-puffy",
    title: "Puffy stack",
    description: "Bowl over chunky clay letters with an ink 3D edge.",
    section: "wordmark",
    draw: () => (
      <DieCut tilt={-4}>
        <VectorBowl cy={380} width={600} />
        <WordArt text="MudKitchen" y={790} {...LOOK.puffy(148)} />
      </DieCut>
    ),
  },
  {
    id: "word-retro",
    title: "Retro 3D",
    description: "Butter block letters, deep clay 3D, two lines.",
    section: "wordmark",
    draw: () => (
      <DieCut tilt={-5}>
        <VectorBowl cx={770} cy={300} width={360} rotate={10} />
        <WordArt text="Mud" x={390} y={490} {...LOOK.retro(220)} />
        <WordArt text="Kitchen" x={510} y={730} {...LOOK.retro(196)} />
      </DieCut>
    ),
  },
  {
    id: "word-bubble",
    title: "Glossy bubble",
    description: "Shiny peach-to-clay bubble letters.",
    section: "wordmark",
    draw: () => (
      <DieCut tilt={4}>
        <VectorBowl cy={390} width={580} />
        <WordArt text="MudKitchen" y={800} {...LOOK.bubble(146)} />
      </DieCut>
    ),
  },
  {
    id: "word-confetti",
    title: "Confetti letters",
    description: "Every letter a different bright colour.",
    section: "wordmark",
    draw: () => (
      <DieCut tilt={-3}>
        <VectorBowl cy={385} width={590}>
          <BowlFace mood="happy" />
        </VectorBowl>
        <WordArt text="MudKitchen" y={800} {...LOOK.confetti(148)} />
      </DieCut>
    ),
  },
  {
    id: "word-hand",
    title: "Handwritten",
    description: "Hand-lettered MudKitchen with a clay swoosh.",
    section: "wordmark",
    draw: () => (
      <DieCut tilt={-4}>
        <VectorBowl cy={380} width={600} />
        <WordArt text="MudKitchen" y={770} rotate={-4} {...LOOK.hand(176)} />
        <Shape svg={SHAPE.swoosh(CLAY)} x={560} y={900} w={640} h={86} rotate={-4} />
      </DieCut>
    ),
  },
  {
    id: "word-arch",
    title: "Arched",
    description: "MudKitchen curving over the bowl.",
    section: "wordmark",
    draw: () => (
      <DieCut>
        <ArcText text="MudKitchen" cy={640} r={370} {...LOOK.puffy(150)} />
        <VectorBowl cy={660} width={620} />
      </DieCut>
    ),
  },
  {
    id: "word-bumper",
    title: "Bumper lockup",
    description: "Wide bowl + MudKitchen side by side (3:1).",
    section: "wordmark",
    stage: { w: 1620, h: 540 },
    draw: () => (
      <DieCut cx={810} cy={270}>
        <VectorBowl cx={280} cy={262} width={390} rotate={-6} />
        <WordArt text="MudKitchen" x={1040} y={282} w={1620} h={540} {...LOOK.plain(166)} />
      </DieCut>
    ),
  },
  {
    id: "word-bumper-puffy",
    title: "Bumper · puffy",
    description: "Wide lockup with the puffy clay letters.",
    section: "wordmark",
    stage: { w: 1620, h: 540 },
    draw: () => (
      <DieCut cx={810} cy={270} tilt={-2}>
        <VectorBowl cx={285} cy={260} width={380} />
        <WordArt text="MudKitchen" x={1020} y={262} w={1620} h={540} {...LOOK.puffy(156)} />
      </DieCut>
    ),
  },
  {
    id: "word-ribbon",
    title: "Ribbon banner",
    description: "Bowl over a clay ribbon that reads MudKitchen.",
    section: "wordmark",
    draw: () => (
      <DieCut>
        <VectorBowl cy={420} width={700} />
        <Shape svg={SHAPE.ribbon(CLAY, CLAY_DEEP)} y={800} w={920} h={239} />
        <WordArt text="MudKitchen" y={784} {...LOOK.chalk(110)} />
      </DieCut>
    ),
  },
  {
    id: "word-bubble-speech",
    title: "Speech bubble",
    description: "The bowl says MudKitchen!",
    section: "wordmark",
    draw: () => (
      <DieCut>
        <Shape svg={SHAPE.bubble("#FFFFFF", INK)} x={610} y={300} w={720} h={480} rotate={4} />
        <WordArt text="MudKitchen!" x={620} y={280} rotate={4} {...LOOK.hand(120, CLAY_DEEP)} />
        <VectorBowl cx={350} cy={760} width={520} rotate={-6}>
          <BowlFace mood="happy" />
        </VectorBowl>
      </DieCut>
    ),
  },
  {
    id: "word-pill",
    title: "Name tag",
    description: "Clay pill tag across the bowl's foot.",
    section: "wordmark",
    draw: () => (
      <DieCut tilt={-5}>
        <VectorBowl cy={480} width={780} />
        <StickerTag y={860} size={104} bg={CLAY} shadow={INK} edge="#FFFFFF" rotate={-2} z={6}>
          MudKitchen
        </StickerTag>
      </DieCut>
    ),
  },
];

// ---------------------------------------------------------------- badges & seals

const BADGES: LogoDesign[] = [
  {
    id: "badge-seal",
    title: "Round seal",
    description: "Cream seal, MudKitchen over the top, site along the bottom.",
    section: "badge",
    draw: () => (
      <DieCut border={30}>
        <Shape svg={SHAPE.disc(G.cream, { color: CLAY, width: 16, inset: 160 })} w={960} />
        <ArcText text="MUDKITCHEN" r={400} size={104} tracking={0.08} layers={[{ fill: CLAY_DEEP }]} />
        <ArcText text="TRYMUDKITCHEN.COM" r={400} side="bottom" size={58} weight={700} tracking={0.12} layers={[{ fill: G.soft }]} />
        <Shape svg={SHAPE.star(G.butter)} x={135} y={540} w={64} />
        <Shape svg={SHAPE.star(G.butter)} x={945} y={540} w={64} />
        <VectorBowl cy={548} width={470} />
      </DieCut>
    ),
  },
  {
    id: "badge-scallop",
    title: "Scalloped seal",
    description: "Butter scalloped badge with MudKitchen under the bowl.",
    section: "badge",
    draw: () => (
      <DieCut border={28} tilt={-6}>
        <Shape svg={SHAPE.scallop(G.butter, 22, { color: "#FFFFFF", width: 10, inset: 50, dash: "2 24" })} w={960} />
        <VectorBowl cy={455} width={520} />
        <WordArt text="MudKitchen" y={770} {...LOOK.chalk(104, CLAY_DEEP)} />
      </DieCut>
    ),
  },
  {
    id: "badge-burst",
    title: "Starburst",
    description: "Peach starburst with arched MudKitchen.",
    section: "badge",
    draw: () => (
      <DieCut border={30} tilt={8}>
        <Shape svg={SHAPE.burst(G.peach, 20, 0.86)} w={960} />
        <Shape svg={SHAPE.disc("#FFF1EA")} w={700} />
        <VectorBowl cy={500} width={440} />
        <ArcText text="MudKitchen" r={300} side="bottom" cy={520} {...LOOK.puffy(96)} />
      </DieCut>
    ),
  },
  {
    id: "badge-stamp",
    title: "Postage stamp",
    description: "Perforated stamp, mint panel, bowl and name.",
    section: "badge",
    draw: () => (
      <DieCut border={26} tilt={-5}>
        <Shape svg={SHAPE.stamp("#FFFFFF", PASTEL.mint, G.forest)} w={700} h={875} />
        <VectorBowl cy={470} width={440} />
        <WordArt text="MudKitchen" y={790} size={84} tracking={-0.035} layers={[{ fill: G.forest }]} />
      </DieCut>
    ),
  },
  {
    id: "badge-forest",
    title: "Forest badge",
    description: "Dark round badge, cream ring text, one-colour cream bowl.",
    section: "badge",
    draw: () => (
      <DieCut border={30} color={G.paper}>
        <Shape svg={SHAPE.disc(G.forest, { color: "#4C6B5A", width: 8, inset: 150 })} w={960} />
        <ArcText text="MUDKITCHEN" r={400} size={100} tracking={0.1} layers={[{ fill: G.butter }]} />
        <ArcText text="★  ★  ★" r={400} side="bottom" size={60} tracking={0.2} layers={[{ fill: G.butter }]} />
        <VectorBowl cy={548} width={460} svg={MONO_CREAM} />
      </DieCut>
    ),
  },
  {
    id: "badge-peach-circle",
    title: "Peach circle",
    description: "Round peach sticker, bowl on top, MudKitchen below.",
    section: "badge",
    draw: () => (
      <DieCut border={30}>
        <Shape svg={SHAPE.disc(G.peach)} w={960} />
        <VectorBowl cy={430} width={560} />
        <WordArt text="MudKitchen" y={790} {...LOOK.puffy(118)} />
      </DieCut>
    ),
  },
];

export const LOGO_MARKS = logoMarks([...BOWL_ONLY, ...WORDMARK, ...BADGES]);
