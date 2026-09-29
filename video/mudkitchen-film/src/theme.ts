import { Easing, spring, type SpringConfig } from "remotion";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const lora = loadLora("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
loadLora("italic", { weights: ["400", "500"], subsets: ["latin"] });
const poppins = loadPoppins("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const geist = loadGeist("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const fraunces = loadFraunces("normal", { weights: ["600"], subsets: ["latin"] });
const dmSans = loadDMSans("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
const inter = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

export const FONT = {
  display: `${lora.fontFamily}, Georgia, serif`,
  ui: `${poppins.fontFamily}, system-ui, sans-serif`,
  body: `${geist.fontFamily}, system-ui, sans-serif`,
  // Product fonts: the portals and mobile app use Fraunces + DM Sans; the admin demo uses Inter.
  story: `${fraunces.fontFamily}, Georgia, serif`,
  storyBody: `${dmSans.fontFamily}, system-ui, sans-serif`,
  admin: `${inter.fontFamily}, system-ui, sans-serif`,
};

// Strict palette from the brief + site tokens (globals.css --color-accent etc.)
export const C = {
  forest: "#2E4A3C",
  forestDeep: "#1a3327",
  sage: "#A6B89A",
  sageLight: "#C5D5B8",
  clay: "#A05C45",
  clayHighlight: "#E8D5C8",
  cream: "#F7F1E7",
  badge: "#E2EDD9",
  white: "#FFFFFF",
  clayFill: "rgba(160,92,69,0.18)",
  clayBorder: "rgba(160,92,69,0.38)",
  creamMuted: "rgba(247,241,231,0.72)",
  creamFaint: "rgba(247,241,231,0.12)",
  forestMuted: "rgba(46,74,60,0.62)",
} as const;

// Same curve the site uses for entrances ([0.16, 1, 0.3, 1]).
export const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EXPO_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EXPO_IN_OUT = Easing.bezier(0.87, 0, 0.13, 1);
export const SOFT_IN_OUT = Easing.bezier(0.45, 0, 0.55, 1);
// Overshoot for the kinetic hook only.
export const BACK_OUT = Easing.bezier(0.34, 1.56, 0.64, 1);

export const UI_SPRING: Partial<SpringConfig> = { damping: 18, stiffness: 220, mass: 1 };
export const SLAM_SPRING: Partial<SpringConfig> = { damping: 11, stiffness: 260, mass: 0.9 };

export const uiSpring = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: UI_SPRING });

export const slamSpring = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: SLAM_SPRING });

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
