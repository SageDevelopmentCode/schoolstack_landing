"use client";

import { G } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  ART,
  Art,
  ArtSticker,
  BERRY,
  BOWL,
  BowlFace,
  CENTER,
  CHALK,
  HandLabel,
  INK,
  LEAF_COLORS,
  MascotSticker,
  NAVY,
  NIGHT,
  PASTEL,
  PIECE,
  PieceSticker,
  PINE,
  ROSE,
  Scatter,
  StickerBadge,
  StickerTag,
} from "@/components/admin/marketing/brand-marks/mark-kit";
import { BowlScene, marksFromScenes, Sparkles, type Variant } from "@/components/admin/marketing/brand-marks/marks-everyday";

/** The year a just-ended or upcoming New Year / graduation refers to, as seen from today. */
function upcomingYear(rolloverMonth: number) {
  const now = new Date();
  return now.getMonth() + 1 >= rolloverMonth ? now.getFullYear() + 1 : now.getFullYear();
}

const inCrop = (v: Variant) => (v === "avatar" ? 500 : undefined);

/** Spoon-tip hat, in bowl units, leaning with the spoon. */
function SpoonHat({ svg, w, h, dx = 0, dy = 0, rotate = BOWL.spoonAngle }: { svg: string; w: number; h?: number; dx?: number; dy?: number; rotate?: number }) {
  return <Art svg={svg} x={BOWL.spoonTip.x + dx} y={BOWL.spoonTip.y + dy} w={w} h={h} rotate={rotate} z={4} />;
}

/** Hat scenes: a slightly smaller bowl, lower, so the hat stays inside the crop. */
const HAT = { avatar: { width: 640, cy: 610 }, icon: { width: 660, cy: 600 } } as const;
/** Scenes with a text tag at the bottom (avatar only). */
const TAGGED = { width: 620, cy: 490, tagY: 880 } as const;

export const SEASONAL_MARKS = marksFromScenes("seasonal", [
  // ------------------------------------------------------------ fall
  {
    id: "first-fall",
    title: "First day of fall",
    description: "Pumpkin and acorn stickers on warm sand.",
    background: PASTEL.sand,
    season: { label: "First day of fall", from: "09-18", to: "09-25" },
    draw: (v) => (
      <BowlScene
        v={v}
        base={PASTEL.sand}
        pattern="gingham"
        ink="#E9CFA9"
        patternSize={110}
        tilt={-5}
        cy={540}
        decor={
          <>
            <ArtSticker svg={ART.pumpkin} x={v === "avatar" ? 250 : 200} y={v === "avatar" ? 790 : 830} w={170} h={156} rotate={-8} shadow="#C9A77E" z={5} />
            <ArtSticker svg={ART.acorn} x={v === "avatar" ? 840 : 880} y={v === "avatar" ? 790 : 830} w={110} h={132} rotate={14} shadow="#C9A77E" z={5} />
          </>
        }
      >
        <Art svg={PIECE.maple(LEAF_COLORS[0])} x={BOWL.rimRight.x - 20} y={BOWL.rimRight.y - 6} w={70} rotate={24} z={4} />
      </BowlScene>
    ),
  },
  {
    id: "fall",
    title: "Fall leaves",
    description: "Leaf stickers tumbling around the bowl.",
    background: PASTEL.apricot,
    season: { label: "Fall", from: "09-15", to: "11-15" },
    draw: (v) => (
      <BowlScene
        v={v}
        base={PASTEL.apricot}
        pattern="dots"
        tilt={-6}
        decor={<Scatter pieces={["maple", "leaf"]} colors={LEAF_COLORS} count={9} seed={3} clear={420} within={inCrop(v)} size={[66, 104]} sticker="#D9B48C" />}
      >
        <Art svg={PIECE.maple(LEAF_COLORS[0])} x={BOWL.rimRight.x - 22} y={BOWL.rimRight.y - 4} w={70} rotate={24} z={4} />
        <Art svg={PIECE.leaf(LEAF_COLORS[2])} x={BOWL.rimLeft.x + 30} y={BOWL.rimLeft.y + 2} w={52} rotate={-50} z={4} />
      </BowlScene>
    ),
  },
  {
    id: "grandparents",
    title: "Grandparents Day",
    description: "Love-struck bowl saying hi to grandma & grandpa.",
    background: PASTEL.lav,
    season: { label: "Grandparents Day", from: "09-01", to: "09-10" },
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene v={v} base={PASTEL.lav} pattern="hearts" ink="#DCCBEA" tilt={-5} width={TAGGED.width} cy={TAGGED.cy}>
          <BowlFace mood="love" />
        </BowlScene>
        <PieceSticker piece="heart" color="#FF7A6B" x={830} y={250} w={90} rotate={14} shadow="#B9A3CF" />
        <StickerTag y={TAGGED.tagY} size={56} bg={G.clay} shadow={G.clayDeep}>hi grandma &amp; grandpa!</StickerTag>
      </>
    ),
  },
  {
    id: "picture-day",
    title: "Picture day",
    description: "Say cheese! Camera sticker and flash sparkles.",
    background: PASTEL.butter,
    season: { label: "Picture day", from: "09-15", to: "10-15" },
    draw: (v) => (
      <BowlScene
        v={v}
        base={PASTEL.butter}
        pattern="dots"
        ink="#F5D46A"
        tilt={5}
        cy={590}
        width={v === "avatar" ? 660 : 690}
        shadow="#C99A2E"
        decor={
          <>
            <ArtSticker svg={ART.camera} x={v === "avatar" ? 290 : 220} y={v === "avatar" ? 270 : 200} w={230} h={178} rotate={-12} shadow="#C99A2E" z={5} />
            <Art svg={PIECE.sparkle("#FFFFFF")} x={v === "avatar" ? 450 : 380} y={v === "avatar" ? 170 : 110} w={70} z={6} />
            <Art svg={PIECE.sparkle("#FFFFFF")} x={v === "avatar" ? 500 : 440} y={v === "avatar" ? 250 : 190} w={40} z={6} />
          </>
        }
      >
        <BowlFace mood="wink" />
      </BowlScene>
    ),
  },
  {
    id: "teachers-day",
    title: "World Teachers' Day",
    description: "Globe and apple stickers with a thank-you tag.",
    background: PASTEL.butter,
    season: { label: "World Teachers' Day", from: "10-01", to: "10-05" },
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene v={v} base={PASTEL.butter} pattern="stripes" ink="#F5D46A" patternSize={70} tilt={-5} width={TAGGED.width} cy={TAGGED.cy} shadow="#C99A2E">
          <Art svg={ART.apple} x={BOWL.rimLeft.x + 28} y={BOWL.rimLeft.y - 26} w={86} h={94} rotate={-12} z={4} />
        </BowlScene>
        <ArtSticker svg={ART.globe} x={820} y={250} w={150} rotate={12} shadow="#C99A2E" />
        <StickerTag y={TAGGED.tagY} size={60} bg={G.forest} shadow={G.forestDeep}>happy teachers&apos; day!</StickerTag>
      </>
    ),
  },
  {
    id: "halloween",
    title: "Halloween",
    description: "Jack-o'-lantern bowl, bats and a moon.",
    background: NIGHT,
    season: { label: "Halloween", from: "10-01", to: "10-31" },
    draw: (v) => (
      <BowlScene
        v={v}
        base={NIGHT}
        pattern="stars"
        ink="#3A3150"
        tilt={4}
        cy={600}
        width={v === "avatar" ? 680 : 710}
        shadow="#16121F"
        outlineColor={G.paper}
        decor={
          <>
            <ArtSticker svg={ART.moon} x={v === "avatar" ? 800 : 860} y={v === "avatar" ? 240 : 180} w={150} shadow="#16121F" outlineColor={G.paper} />
            <ArtSticker svg={ART.bat} x={v === "avatar" ? 260 : 200} y={v === "avatar" ? 290 : 220} w={160} h={102} rotate={-10} shadow="#16121F" outlineColor={G.paper} />
            <ArtSticker svg={ART.bat} x={v === "avatar" ? 420 : 380} y={v === "avatar" ? 170 : 110} w={100} h={64} rotate={8} shadow="#16121F" outlineColor={G.paper} />
          </>
        }
      >
        <BowlFace mood="jack" />
      </BowlScene>
    ),
  },
  {
    id: "thanksgiving",
    title: "Thanksgiving",
    description: "Leaf stickers and a “thankful” tag.",
    background: G.cream,
    season: { label: "Thanksgiving", from: "11-01", to: "11-30" },
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene
          v={v}
          base={G.cream}
          pattern="gingham"
          ink="#EBD6BE"
          patternSize={110}
          tilt={-5}
          width={TAGGED.width}
          cy={TAGGED.cy}
          shadow="#D2B894"
          decor={<Scatter pieces={["maple", "leaf"]} colors={LEAF_COLORS} count={7} seed={21} clear={400} within={470} size={[66, 96]} sticker="#D2B894" avoid={[{ x: 280, y: 820, w: 520, h: 120 }]} />}
        >
          <BowlFace mood="happy" />
        </BowlScene>
        <StickerTag y={TAGGED.tagY} size={80} bg={G.clay} shadow={G.clayDeep}>thankful</StickerTag>
      </>
    ),
  },
  // ------------------------------------------------------------ winter
  {
    id: "winter",
    title: "Winter holidays",
    description: "Santa hat, scarf and snow on forest.",
    background: G.forest,
    season: { label: "Winter holidays", from: "12-01", to: "12-31" },
    draw: (v) => (
      <BowlScene
        v={v}
        base={G.forest}
        pattern="dots"
        ink="#4A6858"
        tilt={-4}
        width={HAT[v].width}
        cy={HAT[v].cy}
        shadow={G.forestDeep}
        decor={<Scatter pieces={["flake"]} colors={["#FFFFFF"]} count={9} seed={7} clear={420} within={inCrop(v)} size={[40, 70]} opacity={0.85} />}
      >
        <Art svg={ART.scarf} x={156} y={246} w={300} h={150} z={3} />
        <SpoonHat svg={ART.santaHat} w={150} dx={-6} dy={4} />
      </BowlScene>
    ),
  },
  {
    id: "new-year",
    title: "New Year",
    description: "Party hat on the spoon and confetti.",
    background: "#1E2A44",
    season: { label: "New Year", from: "12-26", to: "01-10" },
    draw: (v) => (
      <>
        <BowlScene
          v={v}
          base="#1E2A44"
          pattern="sprinkles"
          patternSize={140}
          tilt={-5}
          width={v === "avatar" ? 600 : HAT.icon.width}
          cy={v === "avatar" ? 560 : HAT.icon.cy}
          shadow="#101828"
          decor={<Scatter pieces={["star"]} colors={[G.butter, "#FF7A6B"]} count={5} seed={5} clear={420} within={inCrop(v)} size={[50, 76]} sticker="#101828" />}
        >
          <SpoonHat svg={ART.partyHat} w={104} h={136} dx={-4} dy={-26} />
        </BowlScene>
        {v === "avatar" ? <StickerTag y={890} size={66} bg={G.butter} color={INK} shadow="#101828">{`hello ${upcomingYear(7)}`}</StickerTag> : null}
      </>
    ),
  },
  {
    id: "snow-day",
    title: "Snow day",
    description: "Beanie on the spoon, mittens on the rim.",
    background: PASTEL.winter,
    season: { label: "Snow day", from: "01-05", to: "02-28" },
    draw: (v) => (
      <BowlScene
        v={v}
        base={PASTEL.winter}
        pattern="dots"
        ink="#FFFFFF"
        tilt={5}
        width={HAT[v].width}
        cy={HAT[v].cy}
        shadow="#A9BFD8"
        decor={<Scatter pieces={["flake"]} colors={["#A9C4E0"]} count={8} seed={19} clear={430} within={inCrop(v)} size={[40, 70]} />}
      >
        <Art svg={ART.mitten} x={-4} y={164} w={74} h={89} rotate={-24} z={4} />
        <Art svg={ART.mitten} x={312} y={164} w={74} h={89} rotate={24} flip z={4} />
        <SpoonHat svg={ART.beanie} w={140} h={126} dx={-2} dy={-14} rotate={14} />
      </BowlScene>
    ),
  },
  {
    id: "enrollment",
    title: "Enrollment season",
    description: "Pip waving with a “now enrolling” tag.",
    background: PASTEL.peach,
    season: { label: "Enrollment season", from: "01-10", to: "03-15" },
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene v={v} base={PASTEL.peach} pattern="gingham" ink="#F2C4AE" patternSize={110} tilt={6} width={560} cx={610} cy={460} />
        <MascotSticker name="pip" view="wave" cx={310} cy={640} width={320} tilt={-8} shadow="#D9A898" z={5} />
        <StickerTag y={TAGGED.tagY} size={70} bg={G.clay} shadow={G.clayDeep} rotate={-3}>now enrolling!</StickerTag>
      </>
    ),
  },
  {
    id: "hundred-days",
    title: "100th day of school",
    description: "A big “100” badge and star stickers.",
    background: PASTEL.sky,
    season: { label: "100th day of school", from: "02-01", to: "02-15" },
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene v={v} base={PASTEL.sky} pattern="sprinkles" patternSize={140} tilt={6} width={600} cx={590} cy={600} shadow="#A9BFD8" />
        <StickerBadge x={300} y={300} d={280} rotate={-12} shadow="#A9BFD8" sub="days!">100</StickerBadge>
        <PieceSticker piece="star" color={G.butter} x={830} y={260} w={90} rotate={14} shadow="#A9BFD8" />
        <PieceSticker piece="star" color="#FF7A6B" x={210} y={720} w={70} rotate={-10} shadow="#A9BFD8" />
      </>
    ),
  },
  {
    id: "valentines",
    title: "Valentine's",
    description: "Love-struck bowl with floating hearts.",
    background: ROSE,
    season: { label: "Valentine's Day", from: "02-01", to: "02-14" },
    draw: (v) => (
      <BowlScene
        v={v}
        base={ROSE}
        pattern="hearts"
        ink="#EDB3AC"
        tilt={-5}
        cy={600}
        width={v === "avatar" ? 660 : 690}
        decor={<Sparkles v={v} seed={14} />}
      >
        <BowlFace mood="love" />
        <Art svg={PIECE.heart(BERRY)} x={160} y={-34} w={50} rotate={-10} z={4} />
        <Art svg={PIECE.heart("#FF7A6B")} x={210} y={-90} w={40} rotate={12} z={4} />
        <Art svg={PIECE.heart(BERRY)} x={150} y={-124} w={30} rotate={-6} z={4} />
      </BowlScene>
    ),
  },
  // ------------------------------------------------------------ spring
  {
    id: "read-across",
    title: "Read Across America",
    description: "The bowl sitting on a stack of books.",
    background: PASTEL.lav,
    season: { label: "Read Across America", from: "03-01", to: "03-07" },
    draw: (v) => (
      <>
        <BowlScene
          v={v}
          base={PASTEL.lav}
          pattern="stripes"
          ink="#E2D5EE"
          patternSize={70}
          tilt={-3}
          width={v === "avatar" ? 560 : 600}
          cy={v === "avatar" ? 470 : 450}
          shadow="#B9A3CF"
          around={<Art svg={ART.books} x={CENTER} y={v === "avatar" ? 790 : 800} w={v === "avatar" ? 560 : 620} h={v === "avatar" ? 280 : 310} z={1} />}
        />
        {v === "avatar" ? <HandLabel y={110} size={60} color={NAVY} rotate={-3}>let&apos;s read!</HandLabel> : null}
      </>
    ),
  },
  {
    id: "st-patricks",
    title: "St. Patrick's",
    description: "Shamrock and gold-coin stickers.",
    background: "#DDEFD8",
    season: { label: "St. Patrick's Day", from: "03-10", to: "03-17" },
    draw: (v) => (
      <BowlScene
        v={v}
        base="#DDEFD8"
        pattern="checker"
        ink="#CFE6C8"
        patternSize={120}
        tilt={6}
        decor={
          <>
            <Scatter pieces={["shamrock"]} colors={["#5FAE5A", "#7BC47F"]} count={6} seed={33} clear={430} within={inCrop(v)} size={[70, 100]} sticker="#9DC495" />
            <PieceSticker piece="coin" color="#F6C443" x={v === "avatar" ? 820 : 870} y={v === "avatar" ? 820 : 860} w={80} shadow="#9DC495" z={5} />
            <PieceSticker piece="coin" color="#F6C443" x={v === "avatar" ? 760 : 800} y={v === "avatar" ? 880 : 930} w={64} shadow="#9DC495" z={5} />
          </>
        }
      >
        <Art svg={PIECE.shamrock("#5FAE5A")} x={BOWL.rimRight.x - 16} y={BOWL.rimRight.y - 8} w={74} rotate={18} z={4} />
      </BowlScene>
    ),
  },
  {
    id: "spring",
    title: "Spring",
    description: "Blossoms on the sprout and around.",
    background: PASTEL.mint,
    season: { label: "Spring", from: "03-15", to: "05-15" },
    draw: (v) => (
      <BowlScene
        v={v}
        base={PASTEL.mint}
        pattern="waves"
        ink="#CDE2C4"
        tilt={6}
        cy={580}
        decor={<Scatter pieces={["blossom"]} colors={["#FFFFFF", ROSE, G.butter, "#C9B6E4"]} count={7} seed={8} clear={430} within={inCrop(v)} size={[64, 96]} sticker="#A8C79C" />}
      >
        <Art svg={PIECE.blossom("#FFFFFF")} x={BOWL.sproutTop.x + 4} y={BOWL.sproutTop.y + 6} w={58} z={4} />
        <Art svg={PIECE.blossom(ROSE)} x={BOWL.sproutTop.x + 52} y={BOWL.sproutTop.y + 44} w={42} z={4} />
        <Art svg={PIECE.blossom(G.butter)} x={BOWL.sproutTop.x - 40} y={BOWL.sproutTop.y + 50} w={38} z={4} />
      </BowlScene>
    ),
  },
  {
    id: "spring-eggs",
    title: "Spring eggs",
    description: "Pastel eggs in the bowl.",
    background: "#FCEFD9",
    season: { label: "Spring eggs", from: "03-20", to: "04-20" },
    draw: (v) => (
      <BowlScene
        v={v}
        base="#FCEFD9"
        pattern="polka"
        ink="#F7E2BF"
        patternSize={150}
        tilt={-5}
        cy={590}
        decor={
          <>
            <PieceSticker piece="egg" color="#B9D8F5" x={v === "avatar" ? 240 : 180} y={v === "avatar" ? 300 : 220} w={110} rotate={-16} shadow="#DCC39A" />
            <PieceSticker piece="egg" color="#F7B8C4" x={v === "avatar" ? 850 : 900} y={v === "avatar" ? 330 : 250} w={96} rotate={14} shadow="#DCC39A" />
          </>
        }
      >
        <Art svg={PIECE.egg("#C9B6E4")} x={120} y={112} w={58} rotate={-14} z={4} />
        <Art svg={PIECE.egg(G.butter)} x={168} y={104} w={64} rotate={6} z={4} />
        <Art svg={PIECE.egg("#9ED39B")} x={212} y={116} w={54} rotate={18} z={4} />
      </BowlScene>
    ),
  },
  {
    id: "earth-day",
    title: "Earth Day",
    description: "Globe sticker with “love your planet”.",
    background: PASTEL.sky,
    season: { label: "Earth Day", from: "04-15", to: "04-22" },
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene v={v} base={PASTEL.sky} pattern="dots" ink="#D3E2F7" tilt={5} width={TAGGED.width} cy={TAGGED.cy} shadow="#A9BFD8">
          <Art svg={PIECE.leaf("#7BC47F")} x={BOWL.rimLeft.x + 24} y={BOWL.rimLeft.y - 6} w={56} rotate={-40} z={4} />
        </BowlScene>
        <ArtSticker svg={ART.globe} x={260} y={260} w={170} rotate={-10} shadow="#A9BFD8" />
        <StickerTag y={TAGGED.tagY} size={62} bg={PINE} shadow="#24402F">love your planet</StickerTag>
      </>
    ),
  },
  {
    id: "teacher-week",
    title: "Teacher Appreciation",
    description: "An apple for the teacher, with a thank-you tag.",
    background: PASTEL.butter,
    season: { label: "Teacher Appreciation Week", from: "05-01", to: "05-10" },
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene v={v} base={PASTEL.butter} pattern="gingham" ink="#F2C75C" patternSize={110} tilt={-5} width={TAGGED.width} cy={TAGGED.cy} shadow="#C99A2E">
          <BowlFace mood="happy" />
          <Art svg={ART.apple} x={BOWL.rimLeft.x + 26} y={BOWL.rimLeft.y - 24} w={86} h={94} rotate={-12} z={4} />
        </BowlScene>
        <StickerTag y={TAGGED.tagY} size={58} bg={G.clay} shadow={G.clayDeep}>thank you, teachers!</StickerTag>
      </>
    ),
  },
  {
    id: "mothers-day",
    title: "Mother's Day",
    description: "A tulip bouquet growing from the bowl.",
    background: ROSE,
    season: { label: "Mother's Day", from: "05-01", to: "05-11" },
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene v={v} base={ROSE} pattern="dots" ink="#FBE0DC" tilt={-4} width={560} cy={560} shadow="#D79A92">
          <Art svg={ART.tulips} x={120} y={10} w={200} h={236} z={1} />
        </BowlScene>
        <StickerTag y={TAGGED.tagY} size={66} bg={BERRY} shadow="#8E3B2A">love you, mom!</StickerTag>
      </>
    ),
  },
  {
    id: "field-day",
    title: "Field day",
    description: "First-place rosette and picnic gingham.",
    background: PASTEL.mint,
    season: { label: "Field day", from: "05-15", to: "06-10" },
    draw: (v) => (
      <BowlScene v={v} base={PASTEL.mint} pattern="gingham" ink="#BFD9B4" patternSize={110} tilt={-6} decor={<Sparkles v={v} seed={41} />}>
        <BowlFace mood="happy" />
        <Art svg={ART.rosette} x={262} y={232} w={84} h={116} rotate={12} z={4} />
      </BowlScene>
    ),
  },
  {
    id: "graduation",
    title: "Graduation",
    description: "Grad cap on the spoon and a class-of tag.",
    background: G.forest,
    season: { label: "Graduation", from: "05-15", to: "06-20" },
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene
          v={v}
          base={G.forest}
          pattern="stars"
          ink="#3D5C4C"
          tilt={-5}
          width={580}
          cy={540}
          shadow={G.forestDeep}
          decor={<Scatter pieces={["star"]} colors={[G.butter]} count={5} seed={17} clear={410} within={470} size={[50, 76]} sticker={G.forestDeep} avoid={[{ x: 280, y: 820, w: 520, h: 120 }]} />}
        >
          <SpoonHat svg={ART.gradCap} w={170} h={135} dx={-6} dy={-4} />
        </BowlScene>
        <StickerTag y={890} size={64} bg={G.butter} color={INK} shadow={G.forestDeep}>{`class of ${upcomingYear(9)}`}</StickerTag>
      </>
    ),
  },
  {
    id: "fathers-day",
    title: "Father's Day",
    description: "Bow tie on the bowl and a “hi dad!” tag.",
    background: PASTEL.sky,
    season: { label: "Father's Day", from: "06-08", to: "06-21" },
    kinds: ["avatar"],
    draw: (v) => (
      <>
        <BowlScene v={v} base={PASTEL.sky} pattern="stripes" ink="#D3E2F7" patternSize={70} tilt={5} width={TAGGED.width} cy={TAGGED.cy} shadow="#A9BFD8">
          <BowlFace mood="happy" />
          <Art svg={ART.bowtie} x={154} y={270} w={100} h={50} z={4} />
        </BowlScene>
        <StickerTag y={TAGGED.tagY} size={72} bg={NAVY} shadow="#26497F">hi dad!</StickerTag>
      </>
    ),
  },
  // ------------------------------------------------------------ summer
  {
    id: "summer",
    title: "Summer",
    description: "Sunglasses on, sun out.",
    background: PASTEL.sky,
    season: { label: "Summer", from: "06-15", to: "08-15" },
    draw: (v) => (
      <BowlScene
        v={v}
        base={PASTEL.sky}
        pattern="waves"
        ink="#D3E2F7"
        tilt={6}
        cy={590}
        width={v === "avatar" ? 680 : 710}
        shadow="#A9BFD8"
        decor={<ArtSticker svg={ART.sun} x={v === "avatar" ? 270 : 200} y={v === "avatar" ? 270 : 200} w={230} shadow="#A9BFD8" />}
      >
        <BowlFace mood="happy" />
        <Art svg={ART.sunglasses} x={BOWL.face.x} y={BOWL.face.y - 10} w={156} h={57} z={4} />
      </BowlScene>
    ),
  },
  {
    id: "fourth-july",
    title: "4th of July",
    description: "Bunting and firework bursts.",
    background: G.cream,
    season: { label: "4th of July", from: "06-25", to: "07-05" },
    draw: (v) => (
      <BowlScene
        v={v}
        base={G.cream}
        pattern="stars"
        ink="#E6DAC6"
        tilt={-4}
        width={v === "avatar" ? 640 : 680}
        cy={620}
        shadow="#D2BE9E"
        decor={
          <>
            <ArtSticker svg={ART.bunting} x={CENTER} y={v === "avatar" ? 230 : 170} w={v === "avatar" ? 780 : 1000} h={v === "avatar" ? 176 : 225} shadow="#D2BE9E" z={2} />
            <Art svg={PIECE.firework(BERRY)} x={v === "avatar" ? 200 : 130} y={v === "avatar" ? 520 : 470} w={130} z={1} />
            <Art svg={PIECE.firework(NAVY)} x={v === "avatar" ? 880 : 950} y={v === "avatar" ? 540 : 480} w={110} z={1} />
          </>
        }
      />
    ),
  },
  {
    id: "back-to-school",
    title: "Back to school",
    description: "Chalkboard, apple and pencil stickers.",
    background: CHALK,
    season: { label: "Back to school", from: "08-01", to: "09-15" },
    draw: (v) => (
      <>
        <BowlScene
          v={v}
          base={CHALK}
          pattern="grid"
          ink="#2E4639"
          patternSize={80}
          tilt={-4}
          width={v === "avatar" ? 600 : 640}
          cy={v === "avatar" ? 560 : 520}
          shadow="#132219"
          outlineColor={G.paper}
          around={<Art svg={ART.pencil} x={CENTER} y={v === "avatar" ? 860 : 880} w={420} h={92} rotate={-4} z={4} />}
        >
          <Art svg={ART.apple} x={BOWL.rimLeft.x + 30} y={BOWL.rimLeft.y - 26} w={88} h={96} rotate={-12} z={4} />
        </BowlScene>
        {v === "avatar" ? <HandLabel y={150} size={78} color="#F4EFE6" rotate={-3}>back to school!</HandLabel> : null}
        <HandLabel x={v === "avatar" ? 230 : 190} y={v === "avatar" ? 330 : 170} size={60} color="#F4EFE6" rotate={-10}>ABC</HandLabel>
        <HandLabel x={v === "avatar" ? 850 : 880} y={v === "avatar" ? 330 : 170} size={52} color="#F4EFE6" rotate={8}>1+2=3</HandLabel>
      </>
    ),
  },
]);
