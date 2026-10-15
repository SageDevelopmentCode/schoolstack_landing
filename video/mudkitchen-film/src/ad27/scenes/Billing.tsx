import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { CLAMP, EXPO_IN, EXPO_OUT, SOFT_IN_OUT } from "../../theme";
import { useLayout } from "../../components/layout";
import { Phone, PHONE_DESIGN_WIDTH } from "../../components/Phone";
import { BILLING_PRESS, BillingScreen } from "../../scenes/ParentAct";
import { HIT } from "../timeline";
import { phoneGeom, useAdFrame } from "../stage";

// Next payment card / Pay button inside BillingScreen, in phone design points.
const PAY_POINT = { x: PHONE_DESIGN_WIDTH / 2, y: 320 };

// Parent billing in the MudKitchen app: slides in, Pay -> Paid, slides out.
export const Billing: React.FC<{ from: number }> = ({ from }) => {
  const f = useAdFrame(from);
  const { fps } = useVideoConfig();
  const L = useLayout();
  const g = phoneGeom(L);
  const lf = f - (HIT.billPress - BILLING_PRESS);

  const enter = interpolate(f, [HIT.phoneIn, HIT.phoneIn + 18], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const exit = interpolate(f, [HIT.commsIn - 6, HIT.commsIn + 8], [0, 1], { ...CLAMP, easing: EXPO_IN });
  const x = (1 - enter) * L.W * 0.9 - exit * L.W * 1.1;

  const bezel = g.w * 0.032;
  const ss = (g.w - bezel * 2) / PHONE_DESIGN_WIDTH;
  const ox = g.left + bezel + PAY_POINT.x * ss;
  const oy = g.top + bezel + PAY_POINT.y * ss;
  const zMax = L.vertical ? 1.14 : 1.12;
  const z = interpolate(f, [HIT.billPress - 18, HIT.billPress - 4], [1, zMax], { ...CLAMP, easing: SOFT_IN_OUT });

  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${x}px)` }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `scale(${z})` }}>
        <div style={{ position: "absolute", left: g.left, top: g.top }}>
          <Phone width={g.w} height={g.h}>
            <BillingScreen lf={lf} fps={fps} />
          </Phone>
        </div>
      </div>
    </div>
  );
};
