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

/**
 * Real product slide: joke headline on top, the real demo app in a laptop window,
 * the character interacting with it, and a sticky note carrying real site copy.
 */
export function MascotProductSlide({
  kicker,
  title,
  note,
  noteLabel,
  mascot,
  noteAt = { x: 610, y: 330 },
  background = G.cream,
  windowTop = 420,
  contentHeight = 920,
  crop,
  children,
}: {
  kicker: string;
  title: ReactNode;
  note: string;
  noteLabel?: string;
  mascot: { name: MascotName; view: MascotView; width: number; flip?: boolean } & Placed;
  noteAt?: Placed & { width?: number };
  background?: string;
  windowTop?: number;
  contentHeight?: number;
  crop?: CarouselDemoCrop;
  children: ReactNode;
}) {
  const left = 48;
  const right = -100;
  const bodyWidth = SLIDE_WIDTH - left - right;
  return (
    <MascotSlide background={background}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 120, zIndex: 4 }}>
        <Kicker>{kicker}</Kicker>
        <Headline size={64} style={{ marginTop: 22, maxWidth: 900 }}>
          {title}
        </Headline>
      </div>
      <div style={{ position: "absolute", left, right, top: windowTop, bottom: -72, zIndex: 2 }}>
        <CarouselLaptopWindow
          contentHeight={contentHeight}
          cropFocus="top"
          crop={crop}
          defaultBodyWidth={bodyWidth}
          defaultBodyHeight={SLIDE_HEIGHT - windowTop}
        >
          {children}
        </CarouselLaptopWindow>
      </div>
      <At {...noteAt} z={7}>
        <RealCopyNote label={noteLabel} width={noteAt.width ?? 400} rotate={noteAt.rotate ?? 3}>
          {note}
        </RealCopyNote>
      </At>
      <PlacedMascot {...mascot} z={8} />
    </MascotSlide>
  );
}

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
