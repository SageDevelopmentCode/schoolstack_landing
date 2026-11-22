import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { CLAMP, EXPO_IN, EXPO_OUT } from "../theme";
import { DREAM_FONT } from "./look";
import type { WordStyle } from "./edl";

const WHITE = "#FBF7F0";
const SHADOW = "0 2px 28px rgba(0,0,0,0.45), 0 0 2px rgba(0,0,0,0.25)";
// Vertical anchor (fraction of height). Kept above the platform caption/CTA zone.
const TOP = { c: 0.45, high: 0.3, low: 0.6 } as const;

const base: React.CSSProperties = {
  fontFamily: DREAM_FONT.serif,
  fontWeight: 500,
  color: WHITE,
  textShadow: SHADOW,
  letterSpacing: "-0.02em",
  whiteSpace: "nowrap",
};

// One word (or, for the hook, one short line) at a time, centered over the shot.
export const WordCut: React.FC<{ text: string; frames: number; style?: WordStyle; pos?: keyof typeof TOP }> = ({
  text,
  frames,
  style = "plain",
  pos = "c",
}) => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 3], [0, 1], CLAMP);
  const blur = (1 - enter) * 8;

  let body: React.ReactNode;
  if (style === "scatter") {
    // Letters arrive from scattered positions and settle into the word.
    const settle = interpolate(f, [0, Math.min(16, frames * 0.5)], [0, 1], { ...CLAMP, easing: EXPO_OUT });
    body = (
      <div style={{ ...base, fontSize: 118, display: "flex" }}>
        {text.split("").map((ch, i) => {
          const dx = (random(`${text}-dx-${i}`) - 0.5) * 620;
          const dy = (random(`${text}-dy-${i}`) - 0.5) * 760;
          const rot = (random(`${text}-r-${i}`) - 0.5) * 70;
          const k = 1 - settle;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `translate(${dx * k}px, ${dy * k}px) rotate(${rot * k}deg)`,
                opacity: interpolate(f, [0, 2], [0, 1], CLAMP),
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          );
        })}
      </div>
    );
  } else if (style === "glitch") {
    // RGB split that jitters for the first few frames, then locks.
    const g = interpolate(f, [0, 9], [1, 0], CLAMP);
    const j = Math.floor(f / 1.5);
    const ox = (random(`${text}-gx-${j}`) - 0.5) * 40 * g;
    const oy = (random(`${text}-gy-${j}`) - 0.5) * 14 * g;
    const layer = (color: string, x: number, y: number, blend: React.CSSProperties["mixBlendMode"]) => (
      <div style={{ ...base, fontSize: 112, position: "absolute", color, textShadow: "none", transform: `translate(${x}px, ${y}px)`, mixBlendMode: blend }}>
        {text}
      </div>
    );
    body = (
      <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
        <div style={{ ...base, fontSize: 112, opacity: g > 0.05 ? 0 : 1 }}>{text}</div>
        {g > 0.05 ? (
          <>
            {layer("rgba(255,60,60,0.85)", ox, oy, "screen")}
            {layer("rgba(60,220,255,0.85)", -ox, -oy, "screen")}
            {layer(WHITE, ox * 0.2, 0, "normal")}
          </>
        ) : null}
      </div>
    );
  } else if (style === "scale") {
    // Grows toward full frame, accelerating, like the "second" blow-up.
    const s = interpolate(f, [0, frames], [1, 3.4], { ...CLAMP, easing: EXPO_IN });
    body = <div style={{ ...base, fontSize: 124, transform: `scale(${s})`, filter: `blur(${blur}px)` }}>{text}</div>;
  } else {
    const isLine = style === "line";
    const s = interpolate(f, [0, frames], [1.03, 1], CLAMP);
    body = (
      <div
        style={{
          ...base,
          fontSize: isLine ? 80 : 112,
          whiteSpace: isLine ? "normal" : "nowrap",
          maxWidth: isLine ? 900 : undefined,
          textAlign: "center",
          lineHeight: 1.12,
          transform: `scale(${s})`,
          filter: `blur(${blur}px)`,
          opacity: interpolate(enter, [0, 1], [0.2, 1]),
        }}
      >
        {text}
      </div>
    );
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${TOP[pos] * 100}%`,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Soft dark scrim so white type holds up on bright footage. */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 1000,
            height: style === "line" ? 420 : 340,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(closest-side, rgba(10,8,6,0.42), rgba(10,8,6,0.18) 55%, transparent)",
            opacity: style === "scale" ? interpolate(f, [0, frames * 0.6], [1, 0], CLAMP) : 1,
          }}
        />
        <div style={{ position: "relative" }}>{body}</div>
      </div>
    </AbsoluteFill>
  );
};

// "\ tag \" in Fragment Mono, typed on character by character.
export const MonoTag: React.FC<{ tag: string; frames: number }> = ({ tag, frames }) => {
  const f = useCurrentFrame();
  const full = `\\ ${tag} \\`;
  const shown = Math.ceil(interpolate(f, [0, Math.min(8, frames * 0.6)], [2, full.length], CLAMP));
  const fade = interpolate(f, [frames - 3, frames], [1, 0.6], CLAMP);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: "47%",
          textAlign: "center",
          fontFamily: DREAM_FONT.mono,
          fontSize: 36,
          letterSpacing: "0.01em",
          color: WHITE,
          opacity: fade,
          textShadow: "0 1px 14px rgba(0,0,0,0.6)",
          whiteSpace: "nowrap",
        }}
      >
        {full.slice(0, shown)}
        <span style={{ opacity: shown < full.length ? 1 : 0 }}>▍</span>
      </div>
    </AbsoluteFill>
  );
};

// Hard-cut product flash: a few frames of the real app, full bleed.
export const ProductFlash: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  // A hint of overexposure on the first frame, like a projector flash.
  const flash = f === 0 ? 1.35 : 1;
  return <AbsoluteFill style={{ backgroundColor: "#F7F1E7", filter: `brightness(${flash})` }}>{children}</AbsoluteFill>;
};
