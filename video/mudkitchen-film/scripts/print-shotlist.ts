// Regenerates the shot list and VO timing tables inside TREATMENT.md from
// src/timeline.ts and src/captions.ts, so the doc always matches the render.
// Usage: npm run shotlist
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FPS, SHOTS, type ColorMode } from "../src/timeline.ts";
import { VO_LINES } from "../src/captions.ts";
import { AUDIO_CUES, VO_FALLBACK } from "../src/audioCues.ts";

const here = dirname(fileURLToPath(import.meta.url));
const doc = resolve(here, "../TREATMENT.md");

const tc = (frame: number) => {
  const s = frame / FPS;
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return `${m}:${rest.toFixed(1).padStart(4, "0")}`;
};

const COLOR: Record<ColorMode, string> = {
  forest: "Forest `#2E4A3C`",
  forestDeep: "Deep forest `#1a3327`",
  cream: "Site cream `#FFFAF4`",
  flash: "Flash (cream / clay / deep)",
  split: "Split (cream / deep / forest)",
};

const esc = (s: string) => s.replace(/\|/g, "\\|");

const shotTable = [
  "| Shot | Timecode | Frames | Title | Camera / motion | On-screen text | SFX / music | Color mode |",
  "|---|---|---|---|---|---|---|---|",
  ...SHOTS.map(
    (s) =>
      `| ${s.id} | ${tc(s.from)}-${tc(s.to)} | ${s.from}-${s.to} | ${esc(s.title)} | ${esc(s.camera)} | ${esc(s.text)} | ${esc(s.sound)} | ${COLOR[s.color]} |`,
  ),
].join("\n");

const voTable = [
  "| File (`public/audio/`) | Starts | Frames | Max length | Line (read exactly) |",
  "|---|---|---|---|---|",
  ...VO_LINES.map(
    (v) =>
      `| \`vo/${v.id}.wav\` | ${tc(v.from)} | ${v.from}-${v.to} | ${((v.to - v.from) / FPS).toFixed(1)}s | ${esc(v.read ?? v.text)} |`,
  ),
].join("\n");

const safeTable = [
  "| Shot | Title | 9:16 treatment |",
  "|---|---|---|",
  ...SHOTS.map((s) => `| ${s.id} | ${esc(s.title)} | ${s.center916 === "safe" ? "Center-safe as-is" : "Re-laid-out"} |`),
].join("\n");

const audioTable = [
  "| Timecode | Frame | File (`public/audio/`) | Cue | Gain |",
  "|---|---|---|---|---|",
  ...[VO_FALLBACK, ...AUDIO_CUES]
    .sort((a, b) => a.from - b.from)
    .map((c) => `| ${tc(c.from)} | ${c.from} | \`${c.file}\` | ${esc(c.label)} | ${c.volume ?? 1} |`),
].join("\n");

const replaceBlock = (src: string, name: string, body: string) => {
  const start = `<!-- ${name}:START -->`;
  const end = `<!-- ${name}:END -->`;
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!re.test(src)) throw new Error(`Missing ${start} / ${end} markers in TREATMENT.md`);
  return src.replace(re, `${start}\n${body}\n${end}`);
};

let md = readFileSync(doc, "utf8");
md = replaceBlock(md, "SHOTLIST", shotTable);
md = replaceBlock(md, "VO", voTable);
md = replaceBlock(md, "SAFE916", safeTable);
md = replaceBlock(md, "AUDIO", audioTable);
writeFileSync(doc, md);
console.log(`[shotlist] wrote ${SHOTS.length} shots, ${VO_LINES.length} VO lines to TREATMENT.md`);
