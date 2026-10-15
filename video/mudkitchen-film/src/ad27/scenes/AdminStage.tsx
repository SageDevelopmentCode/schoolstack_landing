import React from "react";
import { interpolate } from "remotion";
import { CLAMP, EXPO_IN, EXPO_OUT } from "../../theme";
import { useLayout } from "../../components/layout";
import { AdminWindow, adminHotspots } from "../../scenes/AdminAct";
import { ClickRipple } from "../components/ClickRipple";
import { ADMIN_CLOCK, HIT } from "../timeline";
import { adminGeom, toCanvas, useAdFrame } from "../stage";

const adFrameOfAct = (act: number) => Math.round(interpolate(act, ADMIN_CLOCK.act, ADMIN_CLOCK.ad, CLAMP));

// Dashboard reveal, then admissions (Rivera -> Enrolled) and My Students
// (Emma assigned to Oak Room) on the demo's own nav clicks.
export const AdminStage: React.FC<{ from: number }> = ({ from }) => {
  const f = useAdFrame(from);
  const L = useLayout();
  const g = adminGeom(L);
  const s = g.w / g.dw;
  const act = interpolate(f, ADMIN_CLOCK.ad, ADMIN_CLOCK.act, CLAMP);
  const hot = adminHotspots(g, L.vertical);

  // Scale out of the laptop: starts small at canvas center, lands on the window rect.
  const p = interpolate(f, [HIT.revealStart, HIT.revealLand], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const fade = interpolate(f, [HIT.revealStart, HIT.revealStart + 6], [0, 1], CLAMP);
  const wcx = g.left + g.w / 2;
  const wcy = g.top + g.h / 2;
  const revealT = `translate(${(L.cx - wcx) * (1 - p)}px, ${(L.cy - wcy) * (1 - p)}px) scale(${0.14 + 0.86 * p})`;

  const taps = [
    { at: adFrameOfAct(hot.riveraClick), pt: toCanvas(g, g.dw, hot.riveraStatus) },
    { at: adFrameOfAct(hot.pingA), pt: toCanvas(g, g.dw, hot.emmaClassroom) },
    { at: adFrameOfAct(hot.pingB), pt: toCanvas(g, g.dw, hot.emmaTeacher) },
  ];

  const exit = interpolate(f, [HIT.adminOut, HIT.adminOut + 14], [0, 1], { ...CLAMP, easing: EXPO_IN });

  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${-exit * L.W * 1.1}px)` }}>
      <div
        style={{
          position: "absolute",
          left: g.left,
          top: g.top,
          opacity: fade,
          transform: revealT,
          transformOrigin: "center center",
        }}
      >
        <AdminWindow f={act} g={g} vertical={L.vertical} />
      </div>
      {taps.map((t) => (
        <ClickRipple key={t.at} f={f} at={t.at} x={t.pt.x} y={t.pt.y} size={36 * s} />
      ))}
    </div>
  );
};
