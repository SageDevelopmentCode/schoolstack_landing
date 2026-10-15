import { useCurrentFrame } from "remotion";
import type { Layout } from "../components/layout";
import type { AdminWindowGeom } from "../scenes/AdminAct";

// Scenes are mounted in <Sequence from={x}>; this returns the absolute ad frame.
export const useAdFrame = (from: number) => useCurrentFrame() + from;

export type Rect = { left: number; top: number; w: number; h: number };

// Product frames stay above the caption band (9:16 captions sit ~1480-1560).
export const adminGeom = (L: Layout): AdminWindowGeom & Rect =>
  L.vertical
    ? { left: 40, top: 330, w: 1000, h: 1100, dw: 700, collapsed: true }
    : { left: 310, top: 96, w: 1300, h: 800, dw: 880, collapsed: false };

export const phoneGeom = (L: Layout): Rect => {
  const w = L.vertical ? 520 : 390;
  const h = w * 2.048;
  return { left: L.cx - w / 2, top: L.vertical ? 270 : 92, w, h };
};

export const editorGeom = (L: Layout): Rect & { dw: number } =>
  L.vertical ? { left: 40, top: 330, w: 1000, h: 1080, dw: 760 } : { left: 310, top: 96, w: 1300, h: 800, dw: 940 };

// Scale a rect's local design point to canvas px.
export const toCanvas = (r: Rect, designWidth: number, p: { x: number; y: number }) => {
  const s = r.w / designWidth;
  return { x: r.left + p.x * s, y: r.top + p.y * s };
};
