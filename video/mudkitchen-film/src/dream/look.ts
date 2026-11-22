import { loadFont as loadFragmentMono } from "@remotion/google-fonts/FragmentMono";
import { FONT } from "../theme";

const mono = loadFragmentMono("normal", { weights: ["400"], subsets: ["latin"] });

export const DREAM_FONT = {
  // Lora, as on the site: the word cuts and end card.
  serif: FONT.display,
  ui: FONT.ui,
  // Fragment Mono, as on the site: the proof tags.
  mono: `${mono.fontFamily}, ui-monospace, monospace`,
};

// One grade on every clip, whatever its source, so stock and AI read as one film:
// slightly lifted contrast, pulled saturation, a touch of warmth.
export const GRADE = "contrast(1.07) saturate(0.86) sepia(0.14) brightness(0.97)";

// Paper cream from globals.css (--color-bg) and the site palette.
export const PAPER = "#F7F1E7";
export const PAPER_SHADE = "#EDE0CE";
export const INK = "#2B241D";
export const FOREST = "#2E4A3C";
export const CLAY = "#A05C45";

// Slate colors per act, so the animatic shows the structure at a glance.
export const SLATE_COLOR: Record<string, string> = {
  hook: "#2a1f1a",
  dream: "#1f3328",
  breath: "#3d4a33",
  proof: "#3a2620",
};
