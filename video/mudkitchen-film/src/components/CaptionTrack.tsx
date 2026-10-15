import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CUES, type Cue } from "../captions";
import { SHOTS } from "../timeline";
import { CLAMP, FONT } from "../theme";
import { useLayout } from "./layout";

// Where the VO is already set as on-screen type, the caption would just duplicate it.
const SUPPRESS: [number, number][] = [
  [0, 90],
  [240, 360],
  [1658, 1800],
];

const filmOnLight = (frame: number) => SHOTS.find((s) => frame >= s.from && frame < s.to)?.color === "cream";

export type CaptionSpec = {
  cues: Cue[];
  suppress: [number, number][];
  onLight: (frame: number) => boolean;
  // Distance from the bottom edge to the caption pill.
  bottom: { vertical: number; horizontal: number };
  // Lifts the cream pill off white product UI.
  shadowOnLight?: boolean;
};

const FILM_SPEC: CaptionSpec = {
  cues: CUES,
  suppress: SUPPRESS,
  onLight: filmOnLight,
  bottom: { vertical: 250, horizontal: 54 },
};

export const CaptionTrack: React.FC<{ spec?: CaptionSpec }> = ({ spec = FILM_SPEC }) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  if (spec.suppress.some(([a, b]) => frame >= a && frame < b)) return null;
  const cue = spec.cues.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;
  const onLight = spec.onLight(frame);
  const p = interpolate(frame, [cue.from, cue.from + 5, cue.to - 4, cue.to], [0, 1, 1, 0], CLAMP);
  const size = L.vertical ? 46 : 36;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: L.vertical ? spec.bottom.vertical : spec.bottom.horizontal,
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
          boxShadow:
            onLight && spec.shadowOnLight
              ? "0 0 0 1px rgba(31,51,41,0.08), 0 6px 18px rgba(31,51,41,0.14)"
              : "none",
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
