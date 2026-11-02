import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const SRC_ROOT = path.join(process.cwd(), "src");

function walkTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkTsFiles(full));
      continue;
    }
    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) {
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

describe("fonts", () => {
  it("does not import next/font/google (build must not fetch Google Fonts)", () => {
    const offenders: string[] = [];
    for (const file of walkTsFiles(SRC_ROOT)) {
      const text = fs.readFileSync(file, "utf8");
      if (text.includes('from "next/font/google"') || text.includes("from 'next/font/google'")) {
        offenders.push(path.relative(process.cwd(), file));
      }
    }
    assert.equal(
      offenders.length,
      0,
      `Remove next/font/google imports:\n${offenders.join("\n")}`,
    );
  });
});
