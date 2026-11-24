/**
 * Shrinks the link-preview cards in public/og/ (exported from the Marketing Studio's
 * "Link previews" tab) so chat apps load them: WhatsApp skips preview images much over ~300 KB.
 * Usage: node scripts/optimize-og-images.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const dir = join(process.cwd(), "public/og");
const files = (await readdir(dir)).filter((f) => f.endsWith(".png"));

for (const file of files) {
  const path = join(dir, file);
  const input = await readFile(path);
  const { width, height } = await sharp(input).metadata();
  if (width !== 1200 || height !== 630) throw new Error(`${file} is ${width}×${height}, expected 1200×630`);
  const output = await sharp(input)
    .png({ palette: true, quality: 92, effort: 10, compressionLevel: 9, dither: 0.6 })
    .toBuffer();
  if (output.length < input.length) await writeFile(path, output);
  const kb = (n) => `${Math.round(n / 1024)} KB`;
  console.log(`${file}: ${kb(input.length)} → ${kb(Math.min(input.length, output.length))}`);
}
