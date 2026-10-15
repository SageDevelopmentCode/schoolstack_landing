// Bundles once and renders review stills at the film's key frames.
// Usage: npm run stills -- [16x9|9x16|ad27-9x16|ad27-16x9] [frame,frame,...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const KEY_FRAMES = [
  30, 70, 150, 157, 200, 262, 320, 380, 400, 470, 500, 548, 575, 590, 625,
  655, 700, 770, 840, 910, 952, 990, 1010, 1060, 1150, 1250, 1300, 1356, 1368,
  1420, 1480, 1540, 1600, 1640, 1720, 1790,
];

// Ad27: every scene boundary plus the key product beats.
const AD_KEY_FRAMES = [
  4, 60, 118, 124, 166, 172, 205, 214, 220, 230, 250, 290, 310, 326, 340, 356, 372, 388, 396, 420, 428, 440, 460, 476,
  490, 506, 516, 530, 544, 550, 600, 650, 664, 700, 760, 805,
];

const ratio = process.argv[2] ?? "16x9";
const isAd = ratio.startsWith("ad27-");
const frames = process.argv[3] ? process.argv[3].split(",").map(Number) : isAd ? AD_KEY_FRAMES : KEY_FRAMES;
const id = isAd
  ? `MudKitchenAd27-${ratio.slice(5)}`
  : ratio === "9x16"
    ? "MudKitchenFilm9x16"
    : "MudKitchenFilm16x9";

const serveUrl = await bundle({ entryPoint: resolve(root, "src/index.ts"), publicDir: resolve(root, "public") });
const composition = await selectComposition({ serveUrl, id });
const outDir = resolve(root, "out/stills", ratio);
mkdirSync(outDir, { recursive: true });

for (const frame of frames) {
  const output = resolve(outDir, `f${String(frame).padStart(4, "0")}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 80, scale: 0.5 });
  console.log(`still ${frame} -> ${output}`);
}
