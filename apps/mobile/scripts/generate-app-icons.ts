import fs from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const MOBILE_ROOT = process.cwd();
const IMAGES_DIR = path.join(MOBILE_ROOT, 'assets/images');
const LOGO_SOURCE = path.join(IMAGES_DIR, 'logo.png');

const BRAND_BG = { r: 247, g: 241, b: 231 };
const ICON_SIZE = 1024;
const FAVICON_SIZE = 48;

async function writeWithSizeLog(label: string, outPath: string) {
  const stat = await fs.stat(outPath);
  console.log(`${label}: ${(stat.size / 1024).toFixed(1)}KB -> ${path.relative(MOBILE_ROOT, outPath)}`);
}

async function resizeLogo(
  source: sharp.Sharp,
  size: number,
  background: { r: number; g: number; b: number; alpha: number },
) {
  return source
    .clone()
    .resize(size, size, { fit: 'contain', background })
    .png()
    .toBuffer();
}

async function compositeCentered(
  canvasSize: number,
  background: { r: number; g: number; b: number; alpha?: number },
  logoBuffer: Buffer,
) {
  const channels = background.alpha === undefined ? 3 : 4;

  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels,
      background,
    },
  })
    .composite([{ input: logoBuffer, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function makeWhiteGlyph(logoBuffer: Buffer) {
  const image = sharp(logoBuffer).ensureAlpha();
  const metadata = await image.metadata();
  const width = metadata.width ?? ICON_SIZE;
  const height = metadata.height ?? ICON_SIZE;
  const alpha = await image.clone().extractChannel('alpha').toBuffer();

  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .joinChannel(alpha)
    .png()
    .toBuffer();
}

async function generateAppIcons() {
  const source = sharp(LOGO_SOURCE).rotate();

  const appIconLogo = await resizeLogo(source, Math.round(ICON_SIZE * 0.72), {
    r: 0,
    g: 0,
    b: 0,
    alpha: 0,
  });
  const appIconPath = path.join(IMAGES_DIR, 'icon.png');
  await sharp(
    await compositeCentered(ICON_SIZE, BRAND_BG, appIconLogo),
  ).toFile(appIconPath);
  await writeWithSizeLog('icon.png', appIconPath);

  const androidForegroundLogo = await resizeLogo(source, Math.round(ICON_SIZE * 0.6), {
    r: 0,
    g: 0,
    b: 0,
    alpha: 0,
  });
  const androidForegroundPath = path.join(IMAGES_DIR, 'android-icon-foreground.png');
  await sharp(
    await compositeCentered(ICON_SIZE, { ...BRAND_BG, alpha: 0 }, androidForegroundLogo),
  ).toFile(androidForegroundPath);
  await writeWithSizeLog('android-icon-foreground.png', androidForegroundPath);

  const androidBackgroundPath = path.join(IMAGES_DIR, 'android-icon-background.png');
  await sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 3,
      background: BRAND_BG,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(androidBackgroundPath);
  await writeWithSizeLog('android-icon-background.png', androidBackgroundPath);

  const monochromeLogo = await resizeLogo(source, Math.round(ICON_SIZE * 0.6), {
    r: 0,
    g: 0,
    b: 0,
    alpha: 0,
  });
  const whiteGlyph = await makeWhiteGlyph(monochromeLogo);
  const androidMonochromePath = path.join(IMAGES_DIR, 'android-icon-monochrome.png');
  await sharp(
    await compositeCentered(ICON_SIZE, { r: 0, g: 0, b: 0, alpha: 0 }, whiteGlyph),
  ).toFile(androidMonochromePath);
  await writeWithSizeLog('android-icon-monochrome.png', androidMonochromePath);

  const faviconLogo = await resizeLogo(source, Math.round(FAVICON_SIZE * 0.72), {
    r: 0,
    g: 0,
    b: 0,
    alpha: 0,
  });
  const faviconPath = path.join(IMAGES_DIR, 'favicon.png');
  await sharp(
    await compositeCentered(FAVICON_SIZE, BRAND_BG, faviconLogo),
  ).toFile(faviconPath);
  await writeWithSizeLog('favicon.png', faviconPath);
}

generateAppIcons().catch((error) => {
  console.error(error);
  process.exit(1);
});
