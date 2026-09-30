import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CUES } from "../captions";
import { SHOTS } from "../timeline";
import { CLAMP, FONT } from "../theme";
import { useLayout } from "./layout";

// Where the VO is already set as on-screen type, the caption would just duplicate it.
const SUPPRESS: [number, number][] = [
  [0, 90],
  [240, 360],
  [1658, 1800],
];

export const CaptionTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useLayout();
  if (SUPPRESS.some(([a, b]) => frame >= a && frame < b)) return null;
  const cue = CUES.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;
  const shot = SHOTS.find((s) => frame >= s.from && frame < s.to);
  const onLight = shot?.color === "cream";
  const p = interpolate(frame, [cue.from, cue.from + 5, cue.to - 4, cue.to], [0, 1, 1, 0], CLAMP);
  const size = L.vertical ? 46 : 36;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: L.vertical ? 250 : 54,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: FONT.ui,
          fontWeight: 500,
          fontSize: size,
          lineHeight: 1.3,
          maxWidth: L.vertical ? 900 : 1320,
          textAlign: "center",
          color: onLight ? "#1f3329" : "#F7F1E7",
          backgroundColor: onLight ? "rgba(247,241,231,0.86)" : "rgba(16,32,24,0.55)",
          padding: `${size * 0.22}px ${size * 0.5}px`,
          borderRadius: size * 0.4,
          opacity: p,
          textShadow: onLight ? "none" : "0 1px 2px rgba(0,0,0,0.35)",
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
