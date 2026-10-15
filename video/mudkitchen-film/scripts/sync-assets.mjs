// Copies brand assets from the website's public/ folder so the film always
// uses the same logos and illustrations as trymudkitchen.com.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteImages = resolve(here, "../../../public/images");
const filmPublic = resolve(here, "../public");

const FILES = [
  "Logo.png",
  "Logo.webp",
  "schoolstack-logo.png",
  "people/students/cristina-anne-costello-i8n-TbgzSUE-unsplash-thumb.webp",
  "people/students/ibrahim-guetar-NUkjka_RqUE-unsplash-thumb.webp",
  "people/students/vitaly-gariev-_z2Ii760I38-unsplash-thumb.webp",
  "people/students/izzy-park-8hBY-30cEqI-unsplash-thumb.webp",
  "people/students/aditya-sethia-y9se00qtzd4-unsplash-thumb.webp",
  "people/students/patrick-hauth-K6p0llhyvP8-unsplash-thumb.webp",
  "people/students/ben-mullins-je240KkJIuA-unsplash-thumb.webp",
  "people/students/thomas-park-qnFFfsrxzIk-unsplash-thumb.webp",
  "competitors/GoogleForms.png",
  "competitors/Venmo.png",
  "competitors/Paypal.svg",
  "competitors/Gmail.png",
  "competitors/DocuSign.png",
  "competitors/Calendly.webp",
  "competitors/GoogleDrive.png",
  "competitors/GoogleDocs.png",
  "competitors/GoogleSheets.png",
  "competitors/Wix.png",
  "illustrations/HeroLeft.webp",
  "illustrations/HeroRight.webp",
  "illustrations/Plant.webp",
  "illustrations/Acorns.webp",
  // Newsletter editor demo (ad27 communication scene).
  "stock/ImageOne.webp",
  "stock/ImageThree.webp",
  "stock/ImageFive.webp",
  "stock/ImageSeven.webp",
  "people/staff/andre-styles-pq9npYMirk8-unsplash.jpg",
  "people/staff/clay-elliot-mpDV4xaFP8c-unsplash.jpg",
  "people/staff/tony-luginsland-OswNOXPNU1k-unsplash.jpg",
  "people/staff/linkedin-sales-solutions-pAtA8xe_iVM-unsplash.jpg",
];

// Live-action footage for the 27s ad (public/videos on the site). Source clips are
// 1366x768; proxies are Lanczos-upscaled to 1920px tall so 9:16 crops stay crisp.
const siteVideos = resolve(here, "../../../public/videos");
const FOOTAGE = [
  { prefix: "Photorealistic observational documentary", name: "classroom-help" },
  { prefix: "A photorealistic live-action commercial shot", name: "founder-desk" },
  { prefix: "Photorealistic live-action scene in a warm", name: "student-share" },
];

let copied = 0;
for (const file of FILES) {
  const from = join(siteImages, file);
  const to = join(filmPublic, "brand", file);
  if (!existsSync(from)) {
    console.warn(`[sync-assets] missing ${from}`);
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  // Staff photos are full-size Unsplash originals (up to 6000px) shown as small
  // avatars; headless Chrome intermittently fails to decode them mid-render.
  if (file.startsWith("people/staff/")) {
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", from, "-vf", "scale=320:-2:flags=lanczos", "-q:v", "3", to]);
  } else {
    copyFileSync(from, to);
  }
  copied += 1;
}

const footageDir = join(filmPublic, "footage");
mkdirSync(footageDir, { recursive: true });
const videoNames = existsSync(siteVideos) ? readdirSync(siteVideos) : [];
let footage = 0;
for (const { prefix, name } of FOOTAGE) {
  const src = videoNames.find((n) => n.startsWith(prefix) && n.endsWith(".mp4"));
  if (!src) {
    console.warn(`[sync-assets] missing footage "${prefix}..." in ${siteVideos}`);
    continue;
  }
  const from = join(siteVideos, src);
  const to = join(footageDir, `${name}.mp4`);
  if (!existsSync(to) || statSync(to).mtimeMs < statSync(from).mtimeMs) {
    execFileSync("ffmpeg", [
      "-v", "error", "-y", "-i", from,
      "-vf", "scale=-2:1920:flags=lanczos,unsharp=5:5:0.45:5:5:0",
      "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", to,
    ]);
  }
  footage += 1;
}
console.log(`[sync-assets] footage proxies ${footage}/${FOOTAGE.length}`);

// The film only mounts audio files that exist (see src/components/Soundtrack.tsx).
const audioDir = join(filmPublic, "audio");
mkdirSync(join(audioDir, "sfx"), { recursive: true });
mkdirSync(join(audioDir, "vo"), { recursive: true });
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
const audio = walk(audioDir)
  .map((f) => relative(audioDir, f).split("\\").join("/"))
  .filter((f) => /\.(wav|mp3|m4a|aac)$/i.test(f));
writeFileSync(join(audioDir, "manifest.json"), JSON.stringify(audio, null, 2));

console.log(`[sync-assets] copied ${copied}/${FILES.length} brand assets, ${audio.length} audio files found`);

// VO clips: each file must fit its window (clip start -> window end) or it will
// talk over the next beat.
const { VO_LINES } = await import("../src/captions.ts");
const { AD_VO_LINES } = await import("../src/ad27/captions.ts");
const FPS = 30;
const probe = (file) => {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file],
      { encoding: "utf8" },
    );
    return Number.parseFloat(out.trim());
  } catch {
    return Number.NaN;
  }
};
const reportVo = (name, lines, dir) => {
  const voRows = lines.map((v) => {
    const rel = ["wav", "mp3", "m4a"].map((e) => `${dir}vo/${v.id}.${e}`).find((f) => audio.includes(f));
    const max = (v.to - v.from) / FPS;
    const dur = rel ? probe(join(audioDir, rel)) : Number.NaN;
    return { v, rel, max, dur };
  });
  const found = voRows.filter((r) => r.rel);
  if (found.length === 0) return;
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`[sync-assets] ${name} VO clips (${found.length}/${lines.length}):`);
  let over = 0;
  for (const { v, rel, max, dur } of voRows) {
    const status = !rel ? "missing" : Number.isNaN(dur) ? "unreadable" : dur > max ? `TOO LONG by ${(dur - max).toFixed(2)}s` : "ok";
    if (status.startsWith("TOO LONG")) over += 1;
    const len = Number.isNaN(dur) ? "-" : `${dur.toFixed(2)}s`;
    console.log(`  ${pad(v.id, 3)} ${pad(`@${(v.from / FPS).toFixed(2)}s`, 9)} ${pad(len, 7)} / ${pad(`${max.toFixed(2)}s`, 7)} ${pad(status, 22)} ${v.text}`);
  }
  if (over > 0) console.warn(`[sync-assets] ${over} ${name} VO clip(s) run past their window: tighten the read or trim silence.`);
};
reportVo("film", VO_LINES, "");
reportVo("ad27", AD_VO_LINES, "ad27/");
