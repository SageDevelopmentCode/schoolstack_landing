"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import type { CSSProperties, ReactNode } from "react";
import { FONT, G, useAdStage } from "@/components/admin/marketing/ads/ad-kit";
import { SLIDE_HEIGHT } from "@/components/admin/marketing/slide-frame";
import { crewMember } from "@/components/admin/marketing/brand-marks/crew";
import { Mascot, type MascotName, type MascotView } from "@/components/admin/marketing/mascot/Mascot";

// Crew-chat kit: soft, airy pieces for the "the crew messages you" ads and posts.
// One huge friendly character, short chat exchanges, an app-icon tile, floating task pills and ringed portraits.
// Soft shadows instead of ink outlines so these read lighter than the Garden sticker sets.

const art = (width: number) => Math.round((width * 260) / 240);

/** Crew faces sit about 55% down the art box. Drawn at 1.2× the circle, lifting by 0.2× centres the face. */
const FACE_LIFT = 0.2;

export const SOFT_SHADOW = "0 18px 40px rgba(43,36,29,.14), 0 4px 10px rgba(43,36,29,.08)";

/** Airy pastel backgrounds for this set (flat, with a soft glow from `AiryGlow`). */
export const AIRY = {
  sky: "#EAF2FC",
  mint: "#EAF4E6",
  peach: "#FBEDE5",
  butter: "#FFF6D6",
  lav: "#F2ECF8",
  blush: "#FCEDEA",
} as const;

/** Soft white glow behind the middle of the slide. CSS gradient only (no filters), so exports stay fast. */
export function AiryGlow({ x = "50%", y = "55%", size = 1100, opacity = 0.85 }: { x?: string; y?: string; size?: number; opacity?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,0) 68%)`,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

// ---------------------------------------------------------------- avatar + chat

/** A crew member's head and shoulders in a soft circle, with a white name chip below. */
export function CrewAvatar({
  name,
  view = "happy",
  size = 120,
  bg,
  label,
  chip = true,
  style,
}: {
  name: MascotName;
  view?: MascotView;
  size?: number;
  bg?: string;
  label?: string;
  chip?: boolean;
  style?: CSSProperties;
}) {
  const member = crewMember(name);
  const mascotWidth = Math.round(size * 1.2);
  return (
    <div style={{ position: "relative", width: size, height: size + (chip ? Math.round(size * 0.18) : 0), flexShrink: 0, ...style }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          background: bg ?? member.base,
          border: `${Math.max(4, Math.round(size / 22))}px solid #FFFFFF`,
          boxSizing: "border-box",
          boxShadow: SOFT_SHADOW,
        }}
      >
        <Mascot
          name={name}
          view={view}
          width={mascotWidth}
          ground={false}
          sticker={false}
          style={{ position: "absolute", left: "50%", top: -Math.round(size * FACE_LIFT), marginLeft: -mascotWidth / 2, maxWidth: "none" }}
        />
      </div>
      {chip ? (
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%)",
            padding: `${Math.round(size * 0.05)}px ${Math.round(size * 0.13)}px`,
            borderRadius: 999,
            background: "#FFFFFF",
            boxShadow: "0 6px 14px rgba(43,36,29,.14)",
            fontFamily: FONT.body,
            fontWeight: 800,
            fontSize: Math.max(18, Math.round(size * 0.17)),
            lineHeight: 1.15,
            color: G.ink,
            whiteSpace: "nowrap",
          }}
        >
          {label ?? member.label}
        </span>
      ) : null}
    </div>
  );
}

export const BUBBLE = {
  crew: "#EFEDEA",
  you: "#D5E6FB",
} as const;

/** One chat message. `from="crew"` is grey on the left, `from="you"` is light sky on the right. */
export function ChatBubble({
  from,
  children,
  reaction,
  size = 40,
  maxWidth = 680,
  style,
}: {
  from: "crew" | "you";
  children: ReactNode;
  /** Small reaction badge on the bubble's corner (e.g. "👍"). */
  reaction?: string;
  size?: number;
  maxWidth?: number;
  style?: CSSProperties;
}) {
  const crew = from === "crew";
  const r = Math.round(size * 1.05);
  const tail = Math.round(size * 0.3);
  return (
    <div style={{ position: "relative", alignSelf: crew ? "flex-start" : "flex-end", maxWidth, ...style }}>
      <div
        style={{
          boxSizing: "border-box",
          padding: `${Math.round(size * 0.55)}px ${Math.round(size * 0.78)}px`,
          borderRadius: crew ? `${tail}px ${r}px ${r}px ${r}px` : `${r}px ${tail}px ${r}px ${r}px`,
          background: crew ? BUBBLE.crew : BUBBLE.you,
          boxShadow: "0 10px 24px rgba(43,36,29,.08)",
          fontFamily: FONT.body,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.22,
          color: G.ink,
          textWrap: "pretty",
        }}
      >
        {children}
      </div>
      {reaction ? (
        <span
          aria-hidden
          style={{
            position: "absolute",
            [crew ? "right" : "left"]: -Math.round(size * 0.5),
            bottom: -Math.round(size * 0.55),
            width: Math.round(size * 1.55),
            height: Math.round(size * 1.55),
            borderRadius: "50%",
            background: "#FFFFFF",
            boxShadow: "0 8px 18px rgba(43,36,29,.16)",
            display: "grid",
            placeItems: "center",
            fontSize: Math.round(size * 0.8),
            lineHeight: 1,
          }}
        >
          {reaction}
        </span>
      ) : null}
    </div>
  );
}

/** Crew asks, you answer: avatar + grey bubble, then your sky bubble with a reaction. */
export function ChatExchange({
  name,
  view = "happy",
  ask,
  reply,
  reaction = "👍",
  size = 40,
  avatar = 116,
  maxWidth = 640,
  style,
}: {
  name: MascotName;
  view?: MascotView;
  ask: ReactNode;
  reply: ReactNode;
  reaction?: string;
  size?: number;
  avatar?: number;
  maxWidth?: number;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: Math.round(size * 0.75), ...style }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
        <CrewAvatar name={name} view={view} size={avatar} />
        <ChatBubble from="crew" size={size} maxWidth={maxWidth} style={{ marginTop: Math.round(avatar * 0.12) }}>
          {ask}
        </ChatBubble>
      </div>
      <ChatBubble from="you" size={size} reaction={reaction}>
        {reply}
      </ChatBubble>
    </div>
  );
}

// ---------------------------------------------------------------- app icon

/** The MudKitchen bowl in a rounded white app-icon tile with a soft shadow. */
export function AppIconTile({ size = 180, rotate = 0, style }: { size?: number; rotate?: number; style?: CSSProperties }) {
  // Logo.png is 512px with its art in x 102–410, y 94–406: scale so the art fills ~76% of the tile.
  const img = Math.round((size * 0.76 * 512) / 308);
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.23),
        background: "#FFFFFF",
        boxShadow: "0 22px 44px rgba(43,36,29,.18), 0 4px 10px rgba(43,36,29,.08)",
        overflow: "hidden",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        ...style,
      }}
    >
      <img
        src="/images/Logo.png"
        alt=""
        style={{ position: "absolute", left: "50%", top: "50%", width: img, height: img, marginLeft: -img / 2, marginTop: -img / 2, display: "block" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------- task pills

/** A tilted white pill with a coloured dot: one job on the founder's plate. */
export function TaskPill({
  children,
  color = G.butter,
  rotate = 0,
  size = 36,
  depth = 1,
  style,
}: {
  children: ReactNode;
  color?: string;
  rotate?: number;
  size?: number;
  /** 1 = front, smaller values sit further back (smaller, softer). */
  depth?: number;
  style?: CSSProperties;
}) {
  const s = Math.round(size * (0.82 + 0.18 * depth));
  const dot = Math.round(s * 0.62);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(s * 0.42),
        padding: `${Math.round(s * 0.46)}px ${Math.round(s * 0.8)}px ${Math.round(s * 0.46)}px ${Math.round(s * 0.5)}px`,
        borderRadius: 999,
        background: "#FFFFFF",
        boxShadow: `0 ${Math.round(14 * depth + 4)}px ${Math.round(30 * depth + 8)}px rgba(43,36,29,${(0.08 + 0.1 * depth).toFixed(2)}), 0 3px 0 rgba(43,36,29,.06)`,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        opacity: 0.72 + 0.28 * depth,
        fontFamily: FONT.body,
        fontWeight: 800,
        fontSize: s,
        lineHeight: 1.1,
        color: G.ink,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span aria-hidden style={{ width: dot, height: dot, borderRadius: "50%", background: color, boxShadow: `inset 0 -3px 0 rgba(43,36,29,.12)`, flexShrink: 0 }} />
      {children}
    </span>
  );
}

const PILL_COLORS = [G.peach, G.butter, "#CFE3F7", G.mint, G.lav, "#F6D9D2"];

/** Spots for up to 6 pills, as fractions of the cloud box. `side` says which edge the x is measured from. */
const CLOUD_SPOTS: Array<{ x: number; y: number; side: "left" | "right"; rotate: number; depth: number }> = [
  { x: 0.0, y: 0.02, side: "left", rotate: -5, depth: 1 },
  { x: 0.02, y: 0.12, side: "right", rotate: 4, depth: 0.7 },
  { x: 0.1, y: 0.36, side: "left", rotate: 3, depth: 0.8 },
  { x: 0.0, y: 0.5, side: "right", rotate: -4, depth: 1 },
  { x: 0.02, y: 0.74, side: "left", rotate: -2, depth: 0.9 },
  { x: 0.06, y: 0.84, side: "right", rotate: 5, depth: 0.75 },
];

/** Floating cloud of task pills. Fills its parent (position it like a Scene child). */
export function TaskCloud({ items, size = 38, style }: { items: string[]; size?: number; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", inset: 0, ...style }}>
      {items.slice(0, CLOUD_SPOTS.length).map((label, i) => {
        const spot = CLOUD_SPOTS[i];
        return (
          <div key={label} style={{ position: "absolute", top: `${spot.y * 100}%`, [spot.side]: `${spot.x * 100}%`, zIndex: Math.round(spot.depth * 10) }}>
            <TaskPill color={PILL_COLORS[i % PILL_COLORS.length]} rotate={spot.rotate} size={size} depth={spot.depth}>
              {label}
            </TaskPill>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- big characters

/**
 * One huge crew member whose body runs off the bottom of the slide.
 * Place it as a direct child of `AdFrame` (it positions against the stage). `top` is in stage pixels.
 * Story slides scale it up (or use `storyWidth`) so the same share of the character shows.
 */
export function BigCrew({
  name,
  view = "wave",
  top,
  width = 860,
  storyWidth,
  x = 0,
  flip,
  z = 1,
}: {
  name: MascotName;
  view?: MascotView;
  top: number;
  width?: number;
  storyWidth?: number;
  /** Horizontal offset of the character's centre from the slide centre. */
  x?: number;
  flip?: boolean;
  z?: number;
}) {
  const { isStory, height, top: stageTop } = useAdStage();
  // The stage is the containing block; reach down to the slide's bottom edge and clip there.
  const below = height - stageTop - top;
  // Story canvases are taller: grow the character (up to 1.35×) so a similar share of it shows above the bottom edge.
  const w = isStory ? (storyWidth ?? Math.round(width * Math.min(1.35, below / (SLIDE_HEIGHT - top)))) : width;
  return (
    <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top, height: below, overflow: "hidden", zIndex: z, pointerEvents: "none" }}>
      <Mascot name={name} view={view} width={w} flip={flip} ground={false} style={{ position: "absolute", left: "50%", top: 0, marginLeft: -w / 2 + x, maxWidth: "none" }} />
    </div>
  );
}

/** A crew member's face in a soft circle with concentric rings around it. */
export function RingPortrait({
  name,
  view = "happy",
  size = 220,
  ring,
  bg,
  label,
  style,
}: {
  name: MascotName;
  view?: MascotView;
  size?: number;
  ring?: string;
  bg?: string;
  /** Name chip under the portrait. `false` hides it. */
  label?: string | false;
  style?: CSSProperties;
}) {
  const member = crewMember(name);
  const tint = ring ?? member.base;
  const mascotWidth = Math.round(size * 1.2);
  const gap1 = Math.round(size * 0.09);
  const gap2 = Math.round(size * 0.2);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, ...style }}>
      <span aria-hidden style={{ position: "absolute", inset: -gap2, borderRadius: "50%", border: `3px solid ${tint}`, opacity: 0.9 }} />
      <span aria-hidden style={{ position: "absolute", inset: -gap1, borderRadius: "50%", background: tint, opacity: 0.55 }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: bg ?? "#FFFFFF", boxShadow: SOFT_SHADOW, border: `${Math.round(size / 28)}px solid #FFFFFF`, boxSizing: "border-box" }}>
        <Mascot name={name} view={view} width={mascotWidth} ground={false} sticker={false} style={{ position: "absolute", left: "50%", top: -Math.round(size * FACE_LIFT), marginLeft: -mascotWidth / 2, maxWidth: "none" }} />
      </div>
      {label === false ? null : (
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: -Math.round(size * 0.1),
            transform: "translateX(-50%)",
            padding: "6px 18px",
            borderRadius: 999,
            background: "#FFFFFF",
            boxShadow: "0 6px 14px rgba(43,36,29,.14)",
            fontFamily: FONT.body,
            fontWeight: 800,
            fontSize: Math.max(20, Math.round(size * 0.12)),
            color: G.ink,
            whiteSpace: "nowrap",
            zIndex: 2,
          }}
        >
          {label ?? member.label}
        </span>
      )}
    </div>
  );
}

/** Height a crew member takes at a given width (240×260 art box). */
export const crewHeight = art;
