/**
 * Builds the round social icons used in prospect emails (email clients block SVG).
 * Output: public/images/email/{instagram,facebook}.png, 96px for sharp 24px display.
 *
 *   npx tsx scripts/build-email-social-icons.ts
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { siFacebook, siInstagram } from "simple-icons";

const SIZE = 96;
const GLYPH = 52;
const OFFSET = (SIZE - GLYPH) / 2;
const outDir = join(process.cwd(), "public/images/email");

const ICONS = [
  { file: "instagram.png", icon: siInstagram },
  { file: "facebook.png", icon: siFacebook },
];

async function main() {
  mkdirSync(outDir, { recursive: true });

  for (const { file, icon } of ICONS) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="#${icon.hex}"/>
  <g transform="translate(${OFFSET} ${OFFSET}) scale(${GLYPH / 24})">
    <path d="${icon.path}" fill="#FFFFFF"/>
  </g>
</svg>`;
    await sharp(Buffer.from(svg)).png().toFile(join(outDir, file));
    console.log(`wrote public/images/email/${file}`);
  }
}

void main();
