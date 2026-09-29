import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

// Rendered at quarter resolution and scaled up: cheap, and the softness reads as film.
export const FilmGrain: React.FC<{ opacity?: number; blend?: "overlay" | "soft-light" | "multiply" }> = ({
  opacity = 0.09,
  blend = "overlay",
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 12;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: blend, opacity, overflow: "hidden" }}>
      <svg
        width="25%"
        height="25%"
        viewBox="0 0 480 480"
        preserveAspectRatio="none"
        style={{ transform: "scale(4)", transformOrigin: "0 0" }}
      >
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="480" height="480" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
