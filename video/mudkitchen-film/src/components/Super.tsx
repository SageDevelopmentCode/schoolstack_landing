import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, EXPO_IN, EXPO_OUT, FONT } from "../theme";

// On-screen super: display serif, max 6 words, expo-out rise with a blur-in.
// `emphasis` renders one word/phrase in italic clay (reserved for the hook and finale).
export const Super: React.FC<{
  text: string;
  from: number;
  to: number;
  size: number;
  color?: string;
  emphasis?: string;
  emphasisColor?: string;
  align?: "left" | "center";
  maxWidth?: number;
  style?: React.CSSProperties;
}> = ({ text, from, to, size, color = C.cream, emphasis, emphasisColor = C.clay, align = "left", maxWidth, style }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const inP = interpolate(frame, [from, from + 16], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const outP = interpolate(frame, [to - 8, to], [0, 1], { ...CLAMP, easing: EXPO_IN });
  const words = text.split(" ");
  return (
    <div
      style={{
        fontFamily: FONT.display,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: "-0.02em",
        color,
        textAlign: align,
        maxWidth,
        opacity: 1 - outP,
        transform: `translateY(${-outP * 12}px)`,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = interpolate(frame, [from + i * 2, from + i * 2 + 16], [0, 1], { ...CLAMP, easing: EXPO_OUT });
        const isEm = emphasis ? emphasis.split(" ").includes(w.replace(/[.,]/g, "")) : false;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.24em",
              opacity: p * inP,
              transform: `translateY(${(1 - p) * size * 0.5}px)`,
              filter: `blur(${(1 - p) * 8}px)`,
              fontStyle: isEm ? "italic" : "normal",
              color: isEm ? emphasisColor : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Kicker: React.FC<{
  text: string;
  size?: number;
  color?: string;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ text, size = 20, color = C.sage, opacity = 1, style }) => (
  <div
    style={{
      fontFamily: FONT.ui,
      fontWeight: 500,
      fontSize: size,
      letterSpacing: "0.32em",
      textTransform: "uppercase",
      color,
      opacity,
      ...style,
    }}
  >
    {text}
  </div>
);
