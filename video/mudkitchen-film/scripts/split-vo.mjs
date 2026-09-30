// Cuts one continuous VO read into the 16 cue-locked clips (public/audio/vo/NN.wav).
// Speech segments are found with ffmpeg silencedetect, then grouped per clip.
// Usage: node scripts/split-vo.mjs [path/to/full-read.mp3]
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(process.argv[2] ?? join(here, "../audio-source/vo-full-v2.mp3"));
const outDir = resolve(here, "../public/audio/vo");
const { VO_LINES } = await import("../src/captions.ts");

// Spoken segments per clip, in script order. 09, 13 and 16 contain a pause.
const SEGMENTS_PER_CLIP = [1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 3, 1, 1, 2];
// Pitch-preserving speed-ups for reads that run past their slot.
const TEMPO = { "03": 1.2, "04": 1.12, "05": 1.18, "06": 1.15, "09": 1.03 };
// Longest pause kept inside a clip (seconds); longer internal pauses are shortened.
// 13 keeps "email" on the Gmail thud (f1362).
const MAX_INNER_PAUSE = { "09": 0.2, "13": 0.25, "16": 0.15 };
const PAD_IN = 0.02;
const PAD_OUT = 0.04;
const FPS = 30;

const probeDuration = (file) =>
  Number.parseFloat(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).trim(),
  );

const total = probeDuration(src);
const detect = spawnSync("ffmpeg", ["-hide_banner", "-i", src, "-af", "silencedetect=n=-35dB:d=0.25", "-f", "null", "-"], {
  encoding: "utf8",
});
const log = detect.stderr ?? "";
const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));

// Speech = gaps between silences.
const segments = [];
let cursor = 0;
starts.forEach((s, i) => {
  if (s - cursor > 0.05) segments.push({ start: cursor, end: s });
  cursor = ends[i] ?? total;
});
if (total - cursor > 0.05) segments.push({ start: cursor, end: total });

const expected = SEGMENTS_PER_CLIP.reduce((a, b) => a + b, 0);
if (segments.length !== expected) {
  console.error(`[split-vo] expected ${expected} spoken segments, found ${segments.length}:`);
  segments.forEach((s, i) => console.error(`  ${i + 1}: ${s.start.toFixed(2)}-${s.end.toFixed(2)}`));
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
let si = 0;
const rows = [];
SEGMENTS_PER_CLIP.forEach((count, ci) => {
  const clip = VO_LINES[ci];
  const parts = segments.slice(si, si + count);
  si += count;
  const maxPause = MAX_INNER_PAUSE[clip.id];
  const pieces = [];
  parts.forEach((p, k) => {
    const a = Math.max(0, p.start - (k === 0 ? PAD_IN : 0));
    const b = Math.min(total, p.end + (k === parts.length - 1 ? PAD_OUT : 0));
    if (k > 0) {
      const gap = p.start - parts[k - 1].end;
      pieces.push({ silence: maxPause !== undefined ? Math.min(gap, maxPause) : gap });
    }
    pieces.push({ a, b });
  });
  const chains = [];
  const labels = [];
  pieces.forEach((pc, k) => {
    const label = `p${k}`;
    chains.push(
      "silence" in pc
        ? `anullsrc=r=44100:cl=mono,atrim=0:${pc.silence.toFixed(3)}[${label}]`
        : `[0:a]atrim=${pc.a.toFixed(3)}:${pc.b.toFixed(3)},asetpts=PTS-STARTPTS[${label}]`,
    );
    labels.push(`[${label}]`);
  });
  const tempo = TEMPO[clip.id];
  chains.push(`${labels.join("")}concat=n=${labels.length}:v=0:a=1${tempo ? `,atempo=${tempo}` : ""}[out]`);
  // WAV, not MP3: MP3 encoder padding adds ~50ms that the tight intro slots can't spare.
  const out = join(outDir, `${clip.id}.wav`);
  rmSync(join(outDir, `${clip.id}.mp3`), { force: true });
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", src, "-filter_complex", chains.join(";"), "-map", "[out]", "-ac", "1", "-c:a", "pcm_s16le", out]);
  const dur = probeDuration(out);
  const max = (clip.to - clip.from) / FPS;
  rows.push({ clip, dur, max, tempo });
});

console.log(`[split-vo] ${src}`);
for (const { clip, dur, max, tempo } of rows) {
  const status = dur > max ? `TOO LONG by ${(dur - max).toFixed(2)}s` : "ok";
  console.log(
    `  ${clip.id}  @f${String(clip.from).padEnd(5)} ${dur.toFixed(2)}s / ${max.toFixed(2)}s  ${status.padEnd(20)} ${tempo ? `(x${tempo}) ` : ""}${clip.text}`,
  );
}
