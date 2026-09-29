import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Solid brand field + vignette + optional drifting depth fog.
export const Backdrop: React.FC<{
  color: string;
  vignette?: number;
  fog?: string;
  fogOpacity?: number;
  light?: boolean;
}> = ({ color, vignette = 0.35, fog, fogOpacity = 0.35, light = false }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 600], [0, 120]);
  return (
    <AbsoluteFill style={{ backgroundColor: color }}>
      {fog ? (
        <>
          <AbsoluteFill
            style={{
              background: `radial-gradient(40% 55% at ${30 + drift * 0.05}% 35%, ${fog}, transparent 70%)`,
              opacity: fogOpacity,
              filter: "blur(40px)",
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(35% 45% at ${75 - drift * 0.04}% 70%, ${fog}, transparent 70%)`,
              opacity: fogOpacity * 0.8,
              filter: "blur(60px)",
            }}
          />
        </>
      ) : null}
      <AbsoluteFill
        style={{
          background: light
            ? `radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(46,74,60,${vignette * 0.25}) 100%)`
            : `radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
