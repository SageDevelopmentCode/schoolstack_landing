// Bundles once and renders review stills at the film's key frames.
// Usage: npm run stills -- [16x9|9x16] [frame,frame,...]
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

const ratio = process.argv[2] ?? "16x9";
const frames = process.argv[3] ? process.argv[3].split(",").map(Number) : KEY_FRAMES;
const id = ratio === "9x16" ? "MudKitchenFilm9x16" : "MudKitchenFilm16x9";

const serveUrl = await bundle({ entryPoint: resolve(root, "src/index.ts"), publicDir: resolve(root, "public") });
const composition = await selectComposition({ serveUrl, id });
const outDir = resolve(root, "out/stills", ratio);
mkdirSync(outDir, { recursive: true });

for (const frame of frames) {
  const output = resolve(outDir, `f${String(frame).padStart(4, "0")}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 80, scale: 0.5 });
  console.log(`still ${frame} -> ${output}`);
}
