import { useVideoConfig } from "remotion";

export type Layout = {
  vertical: boolean;
  W: number;
  H: number;
  cx: number;
  cy: number;
  // Multiplier for UI type/sizes: 9:16 gets larger UI to read on a phone.
  u: number;
  // Vertical platform-UI safe zone (px from top / bottom).
  safeTop: number;
  safeBottom: number;
};

export function useLayout(): Layout {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return {
    vertical,
    W: width,
    H: height,
    cx: width / 2,
    cy: height / 2,
    u: vertical ? 1.25 : 1,
    safeTop: vertical ? 220 : 60,
    safeBottom: vertical ? 380 : 60,
  };
}
