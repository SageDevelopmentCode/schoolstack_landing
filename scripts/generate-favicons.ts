import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public/images");
const LOGO_SOURCE = path.join(ROOT, "Logo.png");

async function writeWithSizeLog(label: string, outPath: string) {
  const stat = await fs.stat(outPath);
  console.log(`${label}: ${(stat.size / 1024).toFixed(1)}KB -> ${path.relative(ROOT, outPath)}`);
}

async function generateFavicons() {
  const source = sharp(LOGO_SOURCE).rotate();

  await source
    .clone()
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, "favicon-32.png"));
  await writeWithSizeLog("favicon-32.png", path.join(ROOT, "favicon-32.png"));

  await source
    .clone()
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, "apple-touch-icon.png"));
  await writeWithSizeLog("apple-touch-icon.png", path.join(ROOT, "apple-touch-icon.png"));

  await source
    .clone()
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85 })
    .toFile(path.join(ROOT, "icon-192.webp"));
  await writeWithSizeLog("icon-192.webp", path.join(ROOT, "icon-192.webp"));

  await source
    .clone()
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85 })
    .toFile(path.join(ROOT, "icon-512.webp"));
  await writeWithSizeLog("icon-512.webp", path.join(ROOT, "icon-512.webp"));

  const compressedLogoPath = path.join(ROOT, "Logo.png");
  const compressedLogoTempPath = path.join(ROOT, "Logo.compressed.png");
  const beforeStat = await fs.stat(compressedLogoPath);
  await source
    .clone()
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(compressedLogoTempPath);
  await fs.rename(compressedLogoTempPath, compressedLogoPath);
  const afterStat = await fs.stat(compressedLogoPath);
  console.log(
    `Logo.png: ${(beforeStat.size / 1024).toFixed(0)}KB -> ${(afterStat.size / 1024).toFixed(1)}KB`,
  );

  const logoWebpPath = path.join(ROOT, "Logo.webp");
  await source
    .clone()
    .resize({ width: 280, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(logoWebpPath);
  await writeWithSizeLog("Logo.webp", logoWebpPath);
}

generateFavicons().catch((error) => {
  console.error(error);
  process.exit(1);
});
