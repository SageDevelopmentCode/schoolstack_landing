import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EXPO_IN, SOFT_IN_OUT } from "../../theme";
import { AD_FPS, type FocusKey, type FootageShotSpec } from "../timeline";

// Proxies are 3416x1920 (sources are 1366x768, same aspect).
const SRC_ASPECT = 1366 / 768;

const focusAt = (keys: FocusKey[], f: number) => {
  const i = keys.findIndex((k) => k.at >= f);
  if (i <= 0) return i === 0 ? keys[0] : keys[keys.length - 1];
  const a = keys[i - 1];
  const b = keys[i];
  const easing = b.ease === "in" ? EXPO_IN : SOFT_IN_OUT;
  const t = interpolate(f, [a.at, b.at], [0, 1], { ...CLAMP, easing });
  return { at: f, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, zoom: a.zoom + (b.zoom - a.zoom) * t };
};

// Place the source so the focus point sits at the canvas center, clamped so the
// frame edges never show. Returns the video box in canvas px.
export const footageBox = (spec: FootageShotSpec, f: number, W: number, H: number) => {
  const keys = H > W ? spec.vertical : spec.horizontal;
  const k = focusAt(keys, f);
  const cover = Math.max(W / SRC_ASPECT, H);
  const vh = cover * k.zoom;
  const vw = vh * SRC_ASPECT;
  const left = Math.min(0, Math.max(W - vw, W / 2 - k.x * vw));
  const top = Math.min(0, Math.max(H - vh, H / 2 - k.y * vh));
  return { left, top, width: vw, height: vh };
};

// `blur` maps the shot's local frame to a blur radius (px), for the push-through.
export const FootageShot: React.FC<{ spec: FootageShotSpec; blur?: (f: number) => number }> = ({ spec, blur }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const box = footageBox(spec, f, W, H);
  const b = blur ? blur(f) : 0;
  const filter = b > 0.05 ? `blur(${b}px)` : undefined;
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a3327", overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(`footage/${spec.src}.mp4`)}
        trimBefore={Math.round(spec.srcIn * AD_FPS)}
        muted
        style={{ position: "absolute", ...box, filter }}
      />
    </AbsoluteFill>
  );
};
