import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const FONTS_DIR = path.join(process.cwd(), "src", "lib", "fonts");
const ROOT_LAYOUT = path.join(process.cwd(), "src", "app", "layout.tsx");

/** The body font every page uses above the fold; everything else must not be preloaded. */
const PRELOADED_FONTS = new Set(["geist"]);

function localFontDeclarations(file: string): { name: string; body: string }[] {
  const text = fs.readFileSync(path.join(FONTS_DIR, file), "utf8");
  return [...text.matchAll(/export const (\w+) = localFont\(\{([\s\S]*?)\n\}\);/g)].map(
    (match) => ({ name: match[1], body: match[2] }),
  );
}

describe("font preloading", () => {
  it("only preloads the site-wide base fonts", () => {
    const offenders: string[] = [];
    for (const file of ["local.ts", "lora.ts", "google.ts", "great-vibes.ts"]) {
      for (const { name, body } of localFontDeclarations(file)) {
        if (PRELOADED_FONTS.has(name)) continue;
        if (!/preload:\s*false/.test(body)) offenders.push(`${file}: ${name}`);
      }
    }
    assert.equal(
      offenders.length,
      0,
      `Add \`preload: false\` so these fonts are not preloaded on every page:\n${offenders.join("\n")}`,
    );
  });

  it("root layout does not import the @/lib/fonts barrel", () => {
    const layout = fs.readFileSync(ROOT_LAYOUT, "utf8");
    assert.doesNotMatch(
      layout,
      /from ["']@\/lib\/fonts["']/,
      "Import from @/lib/fonts/google or @/lib/fonts/lora instead of the barrel.",
    );
  });
});
