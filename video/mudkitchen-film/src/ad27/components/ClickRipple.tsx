import React from "react";
import { interpolate } from "remotion";
import { CLAMP, EXPO_OUT } from "../../theme";
import { STORY } from "../../demo/tokens";

// Brief tap ripple at a click point (canvas px): expands from the cursor and fades.
export const ClickRipple: React.FC<{ f: number; at: number; x: number; y: number; size: number }> = ({ f, at, x, y, size }) => {
  const t = interpolate(f, [at, at + 12], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  if (f < at || t >= 1) return null;
  const d = size * (0.4 + t * 1.6);
  return (
    <div
      style={{
        position: "absolute",
        left: x - d / 2,
        top: y - d / 2,
        width: d,
        height: d,
        borderRadius: "50%",
        border: `2px solid ${STORY.primary}`,
        backgroundColor: "rgba(46,74,60,0.12)",
        opacity: 0.55 * (1 - t),
        pointerEvents: "none",
      }}
    />
  );
};
