import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public/images");

const TARGET_DIRS = ["illustrations", "stock"];
const STUDENT_THUMB_DIR = "people/students";
const STUDENT_THUMB_SIZE = 128;

async function convertFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) return;

  const outPath = filePath.replace(/\.(png|jpe?g)$/i, ".webp");
  const stat = await fs.stat(filePath);
  if (stat.size < 50_000) return;

  const image = sharp(filePath);
  const meta = await image.metadata();
  const maxWidth = ext === ".png" ? 1200 : 1600;

  let pipeline = image.rotate();
  if (meta.width && meta.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  await pipeline.webp({ quality: 78, effort: 4 }).toFile(outPath);

  const outStat = await fs.stat(outPath);
  console.log(
    `${path.relative(ROOT, filePath)} -> ${path.relative(ROOT, outPath)} (${(stat.size / 1024).toFixed(0)}KB -> ${(outStat.size / 1024).toFixed(0)}KB)`,
  );
}

async function walk(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    await convertFile(fullPath);
  }
}

async function convertStudentThumbs() {
  const studentsDir = path.join(ROOT, STUDENT_THUMB_DIR);
  const entries = await fs.readdir(studentsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;

    const filePath = path.join(studentsDir, entry.name);
    const baseName = entry.name.replace(/\.(png|jpe?g)$/i, "");
    const outPath = path.join(studentsDir, `${baseName}-thumb.webp`);
    const stat = await fs.stat(filePath);

    await sharp(filePath)
      .rotate()
      .resize(STUDENT_THUMB_SIZE, STUDENT_THUMB_SIZE, {
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: 80, effort: 4 })
      .toFile(outPath);

    const outStat = await fs.stat(outPath);
    console.log(
      `${path.relative(ROOT, filePath)} -> ${path.relative(ROOT, outPath)} (${(stat.size / 1024).toFixed(0)}KB -> ${(outStat.size / 1024).toFixed(0)}KB)`,
    );
  }
}

async function convertLogo() {
  const logoPath = path.join(ROOT, "Logo.png");
  const outPath = path.join(ROOT, "Logo.webp");
  await sharp(logoPath)
    .resize({ width: 280, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outPath);
  const stat = await fs.stat(logoPath);
  const outStat = await fs.stat(outPath);
  console.log(`Logo.png -> Logo.webp (${(stat.size / 1024).toFixed(0)}KB -> ${(outStat.size / 1024).toFixed(0)}KB)`);
}

async function main() {
  for (const dir of TARGET_DIRS) {
    await walk(path.join(ROOT, dir));
  }
  await convertStudentThumbs();
  await convertLogo();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
