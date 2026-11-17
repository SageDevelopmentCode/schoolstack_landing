"use client";

import type { CSSProperties, ReactNode } from "react";
import { gardenFontVariables } from "@/components/garden/fonts";
import SlideCanvas, { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/components/admin/marketing/slide-frame";
import { CarouselLaptopWindow, type CarouselDemoCrop } from "@/components/admin/marketing/carousels/carousel-product-slide";
import { Mascot, type MascotName, type MascotView } from "@/components/admin/marketing/mascot/Mascot";

/** Garden palette for the storybook crew carousels. */
export const G = {
  cream: "#F7F1E7",
  paper: "#FFFAF4",
  ink: "#2B241D",
  soft: "#6D6257",
  clay: "#A05C45",
  clayDeep: "#7E4533",
  forest: "#2E4A3C",
  forestDeep: "#1F3329",
  butter: "#FFE58A",
  mint: "#DDEBD5",
  sky: "#E3EDFB",
  lav: "#ECE2F3",
  peach: "#F8DDCF",
  moss: "#A6B89A",
} as const;

export const FONT = {
  display: "var(--font-sf-display), 'Bricolage Grotesque', 'Avenir Next', sans-serif",
  body: "var(--font-sf-body), Nunito, Avenir, sans-serif",
  hand: "var(--font-sf-hand), 'Gochi Hand', 'Comic Sans MS', cursive",
} as const;

export const SITE_LABEL = "trymudkitchen.com";


export type Placed = { x: number; y: number; rotate?: number; z?: number };
const placed = ({ x, y, rotate = 0, z = 3 }: Placed): CSSProperties => ({
  position: "absolute",
  left: x,
  top: y,
  transform: rotate ? `rotate(${rotate}deg)` : undefined,
  zIndex: z,
});

// ---------------------------------------------------------------- frame

/**
 * Flat paper slide with Garden fonts. `logo="none"` hides the corner pill.
 * (No page grain: it made html-to-image exports very slow; the characters carry their own texture.)
 */
export function MascotSlide({
  background = G.cream,
  logo = "corner",
  children,
}: {
  background?: string;
  logo?: "corner" | "none";
  children: ReactNode;
}) {
  return (
    <SlideCanvas background={background} logo={logo}>
      <div
        className={gardenFontVariables}
        style={{ position: "absolute", inset: 0, fontFamily: FONT.body, color: G.ink }}
      >
        {children}
      </div>
    </SlideCanvas>
  );
}

// ---------------------------------------------------------------- type

export function Kicker({ children, bg = G.peach, color = G.clayDeep, style }: { children: ReactNode; bg?: string; color?: string; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "12px 24px",
        borderRadius: 999,
        background: bg,
        color,
        fontFamily: FONT.body,
        fontWeight: 800,
        fontSize: 24,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Headline({ children, size = 84, color = G.ink, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return (
    <h1
      style={{
        margin: 0,
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: "-0.025em",
        color,
        textWrap: "balance",
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

/** Accent span inside a Headline. */
export function Accent({ children, color = G.clay }: { children: ReactNode; color?: string }) {
  return <span style={{ color }}>{children}</span>;
}

export function Hand({ children, size = 40, color = G.forest, rotate = -4, style }: { children: ReactNode; size?: number; color?: string; rotate?: number; style?: CSSProperties }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: FONT.hand,
        fontSize: size,
        lineHeight: 1.1,
        color,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function SwipeHint({ text = "swipe →", color = G.forest, style }: { text?: string; color?: string; style?: CSSProperties }) {
  return (
    <Hand size={44} color={color} rotate={-6} style={{ position: "absolute", right: 64, bottom: 54, zIndex: 8, whiteSpace: "nowrap", ...style }}>
      {text}
    </Hand>
  );
}

// ---------------------------------------------------------------- objects

export function Tape({ color = "rgba(242, 217, 138, 0.85)", width = 150, rotate = -4, style }: { color?: string; width?: number; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        width,
        height: 36,
        background: color,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 1px 0 rgba(255,255,255,.4) inset",
        zIndex: 6,
        ...style,
      }}
    />
  );
}

export function StickyNote({
  children,
  color = G.butter,
  width = 360,
  rotate = -3,
  tape = true,
  style,
}: {
  children: ReactNode;
  color?: string;
  width?: number;
  rotate?: number;
  tape?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: "relative",
        width,
        boxSizing: "border-box",
        padding: "34px 30px 30px",
        background: color,
        borderRadius: "4px 4px 4px 28px",
        boxShadow: "0 14px 26px rgba(43,36,29,.18)",
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {tape ? <Tape width={130} rotate={rotate > 0 ? -6 : 5} style={{ top: -18, left: "50%", marginLeft: -65 }} /> : null}
      {children}
    </div>
  );
}

/** Real-copy callout: a sticky note with a small "here's how" label. */
export function RealCopyNote({ children, label = "here's how", color = G.butter, width = 400, rotate = 3 }: { children: ReactNode; label?: string; color?: string; width?: number; rotate?: number }) {
  return (
    <StickyNote color={color} width={width} rotate={rotate}>
      <Hand size={30} color={G.forest} rotate={0} style={{ marginBottom: 8 }}>
        {label}
      </Hand>
      <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 700, fontSize: 30, lineHeight: 1.25, color: G.ink }}>{children}</p>
    </StickyNote>
  );
}

export function SpeechBubble({
  children,
  tail = "bottom-left",
  bg = "#FFFFFF",
  size = 40,
  width,
  style,
}: {
  children: ReactNode;
  tail?: "bottom-left" | "bottom-right" | "left" | "right" | "none";
  bg?: string;
  size?: number;
  width?: number;
  style?: CSSProperties;
}) {
  const tailStyle: Record<string, CSSProperties> = {
    "bottom-left": { left: 70, bottom: -26, transform: "rotate(45deg)" },
    "bottom-right": { right: 70, bottom: -26, transform: "rotate(45deg)" },
    left: { left: -26, top: "50%", marginTop: -22, transform: "rotate(45deg)" },
    right: { right: -26, top: "50%", marginTop: -22, transform: "rotate(45deg)" },
  };
  return (
    <div
      style={{
        position: "relative",
        width,
        boxSizing: "border-box",
        padding: "26px 34px",
        background: bg,
        border: `4px solid ${G.ink}`,
        borderRadius: 36,
        boxShadow: `0 8px 0 ${G.ink}`,
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: "-0.015em",
        color: G.ink,
        ...style,
      }}
    >
      {children}
      {tail !== "none" ? (
        <span
          aria-hidden
          style={{
            position: "absolute",
            width: 44,
            height: 44,
            background: bg,
            borderRight: `4px solid ${G.ink}`,
            borderBottom: `4px solid ${G.ink}`,
            ...tailStyle[tail],
          }}
        />
      ) : null}
    </div>
  );
}

/** A loose sheet of paper (forms, scripts) with ruled lines and an optional label. */
export function PaperSheet({ label, width = 170, rotate = 0, lines = 4, tint = "#FFFFFF", style }: { label?: string; width?: number; rotate?: number; lines?: number; tint?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height: width * 1.28,
        boxSizing: "border-box",
        padding: 16,
        background: tint,
        border: `3px solid ${G.ink}`,
        borderRadius: 10,
        boxShadow: "0 10px 18px rgba(43,36,29,.16)",
        transform: `rotate(${rotate}deg)`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        ...style,
      }}
    >
      {label ? (
        <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: Math.round(width / 9), color: G.clayDeep, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      ) : null}
      {Array.from({ length: lines }).map((_, i) => (
        <span key={i} style={{ height: 8, width: `${92 - (i % 3) * 18}%`, borderRadius: 4, background: "#D8CBB8" }} />
      ))}
      <span style={{ marginTop: "auto", height: 3, width: "70%", background: "#B9A68A" }} />
    </div>
  );
}

/** Browser tab shaped label (for "47 tabs open"). */
export function BrowserTab({ label, tint = "#FFFFFF", rotate = 0, style }: { label: string; tint?: string; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 22px 16px 18px",
        background: tint,
        border: `3px solid ${G.ink}`,
        borderRadius: "18px 18px 6px 6px",
        boxShadow: "0 8px 14px rgba(43,36,29,.16)",
        transform: `rotate(${rotate}deg)`,
        fontFamily: FONT.body,
        fontWeight: 800,
        fontSize: 26,
        color: G.ink,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span style={{ width: 18, height: 18, borderRadius: 5, background: G.clay, flexShrink: 0 }} />
      {label}
      <span style={{ marginLeft: 6, color: G.soft, fontSize: 24 }}>×</span>
    </div>
  );
}

/** Phone-style notification (real sample notifications from the site). */
export function NotificationCard({ title, sub, color, rotate = 0, style }: { title: string; sub: string; color: string; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        width: 470,
        boxSizing: "border-box",
        padding: "20px 26px",
        background: "#FFFFFF",
        border: "2px solid #E6DACB",
        borderRadius: 28,
        boxShadow: "0 16px 30px rgba(43,36,29,.16)",
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      <span style={{ width: 58, height: 58, borderRadius: 999, background: color, flexShrink: 0, display: "grid", placeItems: "center" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: G.ink }}>{title}</span>
        <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 24, color: G.soft }}>{sub}</span>
      </span>
    </div>
  );
}

export function CtaButton({ children = "Book a demo", bg = G.clay, color = "#FFFFFF", shadow = G.clayDeep }: { children?: ReactNode; bg?: string; color?: string; shadow?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "24px 48px",
        borderRadius: 999,
        background: bg,
        color,
        fontFamily: FONT.body,
        fontWeight: 800,
        fontSize: 34,
        boxShadow: `0 8px 0 ${shadow}`,
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------- placed character

export function PlacedMascot({ name, view, width, flip, ground = true, ...pos }: { name: MascotName; view: MascotView; width: number; flip?: boolean; ground?: boolean } & Placed) {
  return (
    <div style={placed(pos)}>
      <Mascot name={name} view={view} width={width} flip={flip} ground={ground} />
    </div>
  );
}

export function At({ children, ...pos }: { children: ReactNode } & Placed) {
  return <div style={placed(pos)}>{children}</div>;
}

// ---------------------------------------------------------------- product slide

/** Width of the column kept clear for the character in lane layouts. */
export const LANE_WIDTH = 290;
const LANE_MASCOT_WIDTH = 320;
/** The art box has ~22/260 of empty space under the feet; sink it so the ground patch meets the slide edge. */
const groundedTop = (width: number) => SLIDE_HEIGHT - Math.round((width * 260) / 240) + Math.round((width * 20) / 260);

type LaneSide = "left" | "right";
type SlideMascot = { name: MascotName; view: MascotView; width?: number; flip?: boolean } & Partial<Placed>;

/** Character standing at the bottom of a lane, with an optional speech-bubble tip above it. */
function LaneGuide({ side, mascot, tip, laneWidth = LANE_WIDTH }: { side: LaneSide; mascot: SlideMascot; tip?: ReactNode; laneWidth?: number }) {
  const width = mascot.width ?? LANE_MASCOT_WIDTH;
  const top = groundedTop(width);
  const laneLeft = side === "left" ? 0 : SLIDE_WIDTH - laneWidth;
  const x = laneLeft + Math.round((laneWidth - width) / 2);
  return (
    <>
      {tip ? (
        <div style={{ position: "absolute", left: laneLeft + 18, width: laneWidth - 36, bottom: SLIDE_HEIGHT - top + 34, zIndex: 7 }}>
          <SpeechBubble size={30} tail={side === "left" ? "bottom-left" : "bottom-right"} style={{ padding: "20px 22px", borderRadius: 28 }}>
            {tip}
          </SpeechBubble>
        </div>
      ) : null}
      <PlacedMascot name={mascot.name} view={mascot.view} flip={mascot.flip} width={width} x={mascot.x ?? x} y={mascot.y ?? top} z={8} />
    </>
  );
}

/** Kicker + headline + plain body + optional hand-written aside. */
function CopyBlock({ kicker, title, body, aside, size = 64, maxWidth = 900 }: { kicker?: string; title: ReactNode; body?: string; aside?: ReactNode; size?: number; maxWidth?: number }) {
  return (
    <>
      {kicker ? <Kicker style={{ alignSelf: "flex-start" }}>{kicker}</Kicker> : null}
      <Headline size={size} style={{ marginTop: kicker ? 22 : 0, maxWidth }}>
        {title}
      </Headline>
      {body ? (
        <p style={{ margin: "18px 0 0", maxWidth, fontFamily: FONT.body, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: G.soft, textWrap: "pretty" }}>{body}</p>
      ) : null}
      {aside ? (
        <Hand size={34} color={G.forest} rotate={-2} style={{ marginTop: 14, maxWidth }}>
          {aside}
        </Hand>
      ) : null}
    </>
  );
}

/**
 * Real product slide: headline on top, the real demo app in a laptop window, the character and a sticky note.
 * With `lane`, a column on that side is kept clear for the character (and an optional `tip` bubble),
 * so it never covers the app; the window bleeds off the other edge.
 */
export function MascotProductSlide({
  kicker,
  title,
  body,
  aside,
  note,
  noteLabel,
  mascot,
  noteAt = { x: 610, y: 330 },
  lane,
  tip,
  background = G.cream,
  windowTop,
  contentHeight = 920,
  crop,
  overlay,
  children,
}: {
  kicker: string;
  title: ReactNode;
  body?: string;
  aside?: ReactNode;
  /** Extra slide-positioned content above the window (e.g. a callout card). */
  overlay?: ReactNode;
  note?: string;
  noteLabel?: string;
  mascot: SlideMascot;
  noteAt?: Placed & { width?: number };
  lane?: LaneSide;
  tip?: ReactNode;
  background?: string;
  windowTop?: number;
  contentHeight?: number;
  crop?: CarouselDemoCrop;
  children: ReactNode;
}) {
  // Lane slides flow: the window starts right under the copy, whatever its length.
  const flow = Boolean(lane) && windowTop === undefined;
  const top = windowTop ?? 420;
  const left = lane === "left" ? LANE_WIDTH : lane === "right" ? 44 : 48;
  const right = lane === "right" ? LANE_WIDTH : -100;
  const bodyWidth = SLIDE_WIDTH - left - right;
  const laptop = (
    <CarouselLaptopWindow
      contentHeight={contentHeight}
      cropFocus="top"
      crop={crop}
      defaultBodyWidth={bodyWidth}
      defaultBodyHeight={SLIDE_HEIGHT - (flow ? 560 : top)}
    >
      {children}
    </CarouselLaptopWindow>
  );
  return (
    <MascotSlide background={background}>
      {flow ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, bottom: -72, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0 72px", flexShrink: 0, zIndex: 4 }}>
            <CopyBlock kicker={kicker} title={title} body={body} aside={aside} />
          </div>
          <div style={{ position: "relative", flex: 1, minHeight: 0, marginTop: 44, marginLeft: left, marginRight: right, zIndex: 2 }}>{laptop}</div>
        </div>
      ) : (
        <>
          <div style={{ position: "absolute", left: 72, right: 72, top: 120, zIndex: 4 }}>
            <CopyBlock kicker={kicker} title={title} body={body} aside={aside} />
          </div>
          <div style={{ position: "absolute", left, right, top, bottom: -72, zIndex: 2 }}>{laptop}</div>
        </>
      )}
      {overlay}
      {note ? (
        <At {...noteAt} z={7}>
          <RealCopyNote label={noteLabel} width={noteAt.width ?? 400} rotate={noteAt.rotate ?? 3}>
            {note}
          </RealCopyNote>
        </At>
      ) : null}
      {lane ? (
        <LaneGuide side={lane} mascot={mascot} tip={tip} />
      ) : (
        <PlacedMascot name={mascot.name} view={mascot.view} flip={mascot.flip} width={mascot.width ?? 380} x={mascot.x ?? 0} y={mascot.y ?? 900} z={8} />
      )}
    </MascotSlide>
  );
}

export type ListRow = { label: ReactNode; detail?: ReactNode };
const LIST_LANE_WIDTH = 340;

/**
 * Checklist / steps slide: copy and numbered rows on one side, the character standing in the
 * other lane with an optional tip bubble. Pass `children` instead of `rows` for a custom card.
 */
export function MascotListSlide({
  kicker,
  title,
  body,
  aside,
  rows,
  mascot,
  tip,
  lane = "right",
  background = G.cream,
  headlineSize = 64,
  children,
}: {
  kicker?: string;
  title: ReactNode;
  body?: string;
  aside?: ReactNode;
  rows?: ListRow[];
  mascot: SlideMascot;
  tip?: ReactNode;
  lane?: LaneSide;
  background?: string;
  headlineSize?: number;
  children?: ReactNode;
}) {
  const columnWidth = SLIDE_WIDTH - 72 - LIST_LANE_WIDTH;
  return (
    <MascotSlide background={background}>
      <div
        style={{
          position: "absolute",
          top: 120,
          bottom: 64,
          left: lane === "right" ? 72 : LIST_LANE_WIDTH,
          right: lane === "right" ? 72 : 72,
          display: "flex",
          flexDirection: "column",
          zIndex: 4,
        }}
      >
        <CopyBlock kicker={kicker} title={title} body={body} aside={aside} size={headlineSize} maxWidth={lane === "right" ? 936 : 668} />
        <div style={{ marginTop: 34, width: columnWidth, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {children ??
            rows?.map((row, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  maxHeight: (rows?.length ?? 0) <= 3 ? 210 : 150,
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  boxSizing: "border-box",
                  padding: "18px 26px",
                  background: G.paper,
                  border: "2px solid #E6DACB",
                  borderRadius: 26,
                  boxShadow: "0 8px 16px rgba(43,36,29,.07)",
                }}
              >
                <span
                  style={{
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                    borderRadius: 999,
                    background: ROW_TINTS[i % ROW_TINTS.length],
                    border: `3px solid ${G.ink}`,
                    display: "grid",
                    placeItems: "center",
                    fontFamily: FONT.display,
                    fontWeight: 800,
                    fontSize: 26,
                    color: G.ink,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 38, lineHeight: 1.1, letterSpacing: "-0.015em", color: G.ink }}>{row.label}</span>
                  {row.detail ? <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 27, lineHeight: 1.3, color: G.soft }}>{row.detail}</span> : null}
                </span>
              </div>
            ))}
        </div>
      </div>
      <LaneGuide side={lane} mascot={{ width: 340, ...mascot }} tip={tip} laneWidth={LIST_LANE_WIDTH} />
    </MascotSlide>
  );
}

/**
 * Closing promo: forest slide, centred headline + CTA, a narrower laptop window in the middle,
 * and one or two characters standing in the corner lanes beside it.
 */
export function MascotPromoSlide({
  title,
  body,
  cast,
  contentHeight = 920,
  crop,
  children,
}: {
  title: ReactNode;
  body?: string;
  cast: [SlideMascot] | [SlideMascot, SlideMascot];
  contentHeight?: number;
  crop?: CarouselDemoCrop;
  children: ReactNode;
}) {
  const windowTop = 640;
  const side = 230;
  const [first, second] = cast;
  const castWidth = 240;
  return (
    <MascotSlide background={G.forest}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 130, zIndex: 4, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Headline size={76} color={G.cream} style={{ maxWidth: 900 }}>
          {title}
        </Headline>
        {body ? (
          <p style={{ margin: "20px 0 0", maxWidth: 820, fontFamily: FONT.body, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: "rgba(247,241,231,.82)", textWrap: "pretty" }}>{body}</p>
        ) : null}
        <div style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 28 }}>
          <CtaButton bg={G.butter} color={G.forestDeep} shadow="#1A2C22" />
          <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 28, color: G.mint }}>{SITE_LABEL}</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: side, right: side, top: windowTop, bottom: -72, zIndex: 2 }}>
        <CarouselLaptopWindow
          contentHeight={contentHeight}
          cropFocus="top"
          crop={crop}
          defaultBodyWidth={SLIDE_WIDTH - side * 2}
          defaultBodyHeight={SLIDE_HEIGHT - windowTop}
        >
          {children}
        </CarouselLaptopWindow>
      </div>
      <LaneGuide side="left" mascot={{ width: castWidth, ...first }} laneWidth={side + 20} />
      {second ? <LaneGuide side="right" mascot={{ width: castWidth, ...second }} laneWidth={side + 20} /> : null}
    </MascotSlide>
  );
}

// ---------------------------------------------------------------- reusable story slides

/** Slide 1: kicker + big joke headline, scene props (children), the character, an aside and "swipe →". */
export function MascotHookSlide({
  kicker,
  headline,
  name,
  view,
  background = G.cream,
  aside,
  mascot = { x: 270, y: 640, width: 540 },
  headlineSize = 78,
  children,
}: {
  kicker?: string;
  headline: ReactNode;
  name: MascotName;
  view: MascotView;
  background?: string;
  aside?: ReactNode;
  mascot?: Placed & { width: number; flip?: boolean };
  headlineSize?: number;
  children?: ReactNode;
}) {
  return (
    <MascotSlide background={background}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 128, zIndex: 5 }}>
        {kicker ? <Kicker bg={G.paper}>{kicker}</Kicker> : null}
        <Headline size={headlineSize} style={{ marginTop: kicker ? 22 : 0 }}>
          {headline}
        </Headline>
      </div>
      {children}
      <PlacedMascot name={name} view={view} {...mascot} z={4} />
      {aside ? (
        <Hand size={42} color={G.clayDeep} rotate={-4} style={{ position: "absolute", left: 70, bottom: 64, right: 360, zIndex: 6 }}>
          {aside}
        </Hand>
      ) : null}
      <SwipeHint />
    </MascotSlide>
  );
}

export type ReactionRow = { label: ReactNode; aside?: ReactNode; view: MascotView; tag?: string };
const ROW_TINTS = ["#FFF3CF", "#E3EDFB", "#F8DDCF", "#ECE2F3", "#DDEBD5"];

/** Slide 2: meme list ("the 5 stages of…") — alternating tinted rows, one reaction face each. */
export function ReactionListSlide({
  title,
  name,
  rows,
  background = G.cream,
  tagPrefix,
}: {
  title: ReactNode;
  name: MascotName;
  rows: ReactionRow[];
  background?: string;
  tagPrefix?: string;
}) {
  return (
    <MascotSlide background={background}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 110 }}>
        <Headline size={60}>{title}</Headline>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 290, display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              height: 186,
              padding: "0 28px 0 12px",
              background: ROW_TINTS[i % ROW_TINTS.length],
              borderRadius: 30,
              transform: `rotate(${i % 2 ? 0.8 : -0.8}deg)`,
              flexDirection: i % 2 ? "row-reverse" : "row",
            }}
          >
            <Mascot name={name} view={r.view} width={164} ground={false} />
            <div style={{ flex: 1, minWidth: 0, textAlign: i % 2 ? "right" : "left" }}>
              {r.tag || tagPrefix ? (
                <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: G.clayDeep, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {r.tag ?? `${tagPrefix} ${i + 1}`}
                </p>
              ) : null}
              <Headline size={44} style={{ marginTop: 4 }}>
                {r.label}
              </Headline>
              {r.aside ? (
                <Hand size={31} color={G.soft} rotate={0} style={{ marginTop: 6 }}>
                  {r.aside}
                </Hand>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </MascotSlide>
  );
}

/** Slide 3: the "what if…" turn — speech bubble, the character, an aside, "here's how →". */
export function MascotTurnSlide({
  name,
  view,
  bubble,
  aside,
  background = G.sky,
}: {
  name: MascotName;
  view: MascotView;
  bubble: ReactNode;
  aside?: ReactNode;
  background?: string;
}) {
  return (
    <MascotSlide background={background}>
      <At x={110} y={170} z={5}>
        <SpeechBubble tail="bottom-right" size={64} width={860}>
          {bubble}
        </SpeechBubble>
      </At>
      <PlacedMascot name={name} view={view} width={620} x={230} y={590} z={4} />
      {aside ? (
        <Hand size={40} color={G.forest} rotate={5} style={{ position: "absolute", left: 76, top: 600, maxWidth: 300, zIndex: 6 }}>
          {aside}
        </Hand>
      ) : null}
      <SwipeHint text="here's how →" />
    </MascotSlide>
  );
}

export type Notif = { title: string; sub: string; color: string };

/** Reaction slide: big line, the character, and real sample notifications from the site. */
export function NotificationReactionSlide({
  headline,
  aside,
  name,
  view,
  notifs,
  background = "#FBE6E2",
}: {
  headline: ReactNode;
  aside?: ReactNode;
  name: MascotName;
  view: MascotView;
  notifs: Notif[];
  background?: string;
}) {
  return (
    <MascotSlide background={background}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 130, zIndex: 5 }}>
        <Headline size={84}>{headline}</Headline>
        {aside ? (
          <Hand size={40} color={G.soft} rotate={-2} style={{ marginTop: 18 }}>
            {aside}
          </Hand>
        ) : null}
      </div>
      <PlacedMascot name={name} view={view} width={520} x={30} y={640} z={4} />
      {notifs.map((n, i) => (
        <At key={n.title} x={i % 2 ? 540 : 560} y={680 + i * 168} rotate={i % 2 ? 2 : -3} z={6}>
          <NotificationCard title={n.title} sub={n.sub} color={n.color} />
        </At>
      ))}
    </MascotSlide>
  );
}

/** Real sample notifications (src/components/home/FloatingStickers.tsx). */
export const SAMPLE_NOTIFS = {
  tuitionPaid: { title: "Tuition paid", sub: "October · autopay", color: "#059669" },
  paymentReceived: { title: "Payment received", sub: "Paid on time", color: "#059669" },
  invoiceSent: { title: "Invoice sent", sub: "November tuition", color: "#7C3AED" },
  attendanceLogged: { title: "Attendance logged", sub: "14 of 15 present", color: "#10b981" },
  pickupConfirmed: { title: "Pickup confirmed", sub: "Authorized contact", color: "#4A6B52" },
  clockedIn: { title: "Clocked in", sub: "7:58 AM", color: "#10b981" },
  weeklyHours: { title: "Weekly hours", sub: "Ready for review", color: "#0D9488" },
  campaignSent: { title: "Campaign sent", sub: "Open house invite", color: "#f97316" },
  leadNurtured: { title: "Lead nurtured", sub: "Tour scheduled", color: "#A05C45" },
  tourBooked: { title: "Tour booked", sub: "From your website", color: "#A05C45" },
  newInquiry: { title: "New inquiry", sub: "Kindergarten", color: "#f97316" },
  newMessage: { title: "New message", sub: "From Ms. Rivera", color: "#0284C7" },
  parentReplied: { title: "Parent replied", sub: "Field trip form", color: "#0284C7" },
  packetSigned: { title: "Packet signed", sub: "Enrollment agreement", color: "#4F46E5" },
  checklistDone: { title: "Checklist done", sub: "Health + emergency", color: "#059669" },
} satisfies Record<string, Notif>;

/** Closing slide: forest panel, character, headline, CTA and site. */
export function MascotOutroSlide({
  name,
  view,
  lead,
  accent,
  aside,
}: {
  name: MascotName;
  view: MascotView;
  lead: ReactNode;
  accent: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <MascotSlide background={G.forest}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 150, zIndex: 4 }}>
        <Headline size={92} color={G.cream}>
          {lead}
          <br />
          <Accent color={G.butter}>{accent}</Accent>
        </Headline>
        {aside ? (
          <Hand size={42} color={G.mint} rotate={-3} style={{ marginTop: 26 }}>
            {aside}
          </Hand>
        ) : null}
      </div>
      <PlacedMascot name={name} view={view} width={560} x={260} y={560} z={3} />
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 70, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <CtaButton bg={G.butter} color={G.forestDeep} shadow="#1A2C22" />
        <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: G.mint }}>{SITE_LABEL}</span>
      </div>
    </MascotSlide>
  );
}
