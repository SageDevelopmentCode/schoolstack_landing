// Turns downloaded / generated clips into edit-ready proxies for the Dream ad.
//
//   1. Name each file after its shot id (see DREAM_SHOTLIST.md), any extension:
//        footage-source/dream/d-mud-kitchen.mov   (photos work too: .jpg/.png become 4s stills)
//   2. npm run conform:dream            (all new or changed clips)
//      npm run conform:dream d-kneel    (just these)
//
// Output: public/footage/dream/<id>.mp4, no audio, at least 1920px on the long
// side so 9:16 crops stay sharp. Aspect is kept: the edit crops with the shot's
// focus point. Slow-motion shots (rate < 1) keep up to 60fps so they stay smooth.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, "../footage-source/dream");
const outDir = resolve(here, "../public/footage/dream");
const { SHOTS } = await import("../src/dream/shots.ts");
const byId = new Map(SHOTS.map((s) => [s.id, s]));

mkdirSync(srcDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const only = new Set(process.argv.slice(2));
const isStill = (f) => /\.(jpe?g|png|webp)$/i.test(f);
const files = readdirSync(srcDir).filter((f) => /\.(mp4|mov|m4v|webm|mkv)$/i.test(f) || isStill(f));

const probe = (file) => {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  ).trim();
  const [w, h, rate] = out.split(",");
  const [n, d] = rate.split("/").map(Number);
  return { w: Number(w), h: Number(h), fps: d ? n / d : n };
};

let done = 0;
for (const file of files) {
  const id = basename(file, extname(file));
  if (only.size && !only.has(id)) continue;
  const spec = byId.get(id);
  if (!spec) {
    console.warn(`[conform] ${file}: no shot "${id}" in src/dream/shots.ts, skipped`);
    continue;
  }
  const from = join(srcDir, file);
  const to = join(outDir, `${id}.mp4`);
  if (!only.size && existsSync(to) && statSync(to).mtimeMs > statSync(from).mtimeMs) continue;

  const { w, h, fps: srcFps } = probe(from);
  // A photo becomes a 4s still clip; the edit's slow push gives it motion.
  const still = isStill(file);
  const fps = still ? 30 : srcFps;
  const slow = (spec.rate ?? 1) < 1;
  const outFps = slow ? Math.min(60, Math.round(fps)) : 30;
  // Short side to 1080 (portrait) or long side 1920 tall (landscape), whichever covers 1080x1920.
  const scale = w / h > 1080 / 1920 ? "scale=-2:1920:flags=lanczos" : "scale=1080:-2:flags=lanczos";
  execFileSync("ffmpeg", [
    "-v", "error", "-y", ...(still ? ["-loop", "1", "-t", "4"] : []), "-i", from,
    "-vf", `${scale},fps=${outFps}`,
    "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", to,
  ]);
  console.log(`[conform] ${id}: ${w}x${h}@${fps.toFixed(2)} -> ${outFps}fps`);
  done += 1;
}

const missing = SHOTS.filter((s) => !existsSync(join(outDir, `${s.id}.mp4`))).map((s) => s.id);
console.log(`[conform] ${done} clip(s) conformed. ${SHOTS.length - missing.length}/${SHOTS.length} shots have footage.`);
if (missing.length) console.log(`[conform] still slates: ${missing.join(", ")}`);
// Refresh the manifests so the edit picks the new clips up.
execFileSync("node", [join(here, "sync-assets.mjs")], { stdio: "inherit" });
