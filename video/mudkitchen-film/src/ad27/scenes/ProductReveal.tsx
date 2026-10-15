import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CLAMP, EXPO_IN_OUT } from "../../theme";
import { Backdrop } from "../../components/Backdrop";
import { useLayout } from "../../components/layout";
import { SITE } from "../../demo/tokens";
import { HIT } from "../timeline";
import { useAdFrame } from "../stage";

// Cream iris that opens from the laptop (held at canvas center by the push-in).
export const RevealIris: React.FC<{ from: number }> = ({ from }) => {
  const f = useAdFrame(from);
  const L = useLayout();
  const diag = Math.hypot(L.W, L.H) / 2;
  const r = interpolate(f, [HIT.revealStart - 2, HIT.revealStart + 20], [0, diag], { ...CLAMP, easing: EXPO_IN_OUT });
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at 50% 50%)` }}>
      <Backdrop color={SITE.bg} light vignette={0.3} fog={SITE.bgAlt} fogOpacity={0.5} />
    </AbsoluteFill>
  );
};
