#!/usr/bin/env node
/**
 * One-off helper: download latin woff2 files for fonts that used next/font/google.
 * Sources files from Fontsource on jsDelivr (same latin subset pattern as src/fonts/*).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src/fonts");
const BASE = "https://cdn.jsdelivr.net/fontsource/fonts";

/** @type {Array<{ dir: string; prefix: string; package: string; version: string; weights: string[] }>} */
const FAMILIES = [
  {
    dir: "geist",
    prefix: "geist",
    package: "geist@5.2.8",
    version: "",
    weights: ["400", "500", "600", "700"],
  },
  {
    dir: "fragment-mono",
    prefix: "fragment-mono",
    package: "fragment-mono@5.2.8",
    version: "",
    weights: ["400"],
  },
  {
    dir: "delicious-handrawn",
    prefix: "delicious-handrawn",
    package: "delicious-handrawn@5.2.8",
    version: "",
    weights: ["400"],
  },
  {
    dir: "poppins",
    prefix: "poppins",
    package: "poppins@5.2.7",
    version: "",
    weights: ["300", "400", "500", "600"],
  },
  {
    dir: "manrope",
    prefix: "manrope",
    package: "manrope@5.2.8",
    version: "",
    weights: ["400", "500", "600", "700", "800"],
  },
  {
    dir: "inter",
    prefix: "inter",
    package: "inter@5.2.8",
    version: "",
    weights: ["400", "500", "600", "700"],
  },
  {
    dir: "great-vibes",
    prefix: "great-vibes",
    package: "great-vibes@5.2.8",
    version: "",
    weights: ["400"],
  },
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024 || buf[0] !== 0x77 || buf[1] !== 0x4f) {
    throw new Error(`Not a woff2 file: ${url} (${buf.length} bytes)`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  console.log(`wrote ${dest} (${buf.length} bytes)`);
}

for (const family of FAMILIES) {
  for (const weight of family.weights) {
    const fileName = `${family.prefix}-latin-${weight}-normal.woff2`;
    const dest = path.join(ROOT, family.dir, fileName);
    const url = `${BASE}/${family.package}/latin-${weight}-normal.woff2`;
    await download(url, dest);
  }
}

console.log("Done.");
