#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEMO_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/demo",
);

const KEEP_FOLDERS = new Set(["rootedmeadows", "sagefield", "shared", "mobile"]);

let deleted = 0;

for (const folder of fs.readdirSync(DEMO_DIR)) {
  if (KEEP_FOLDERS.has(folder)) continue;
  const dir = path.join(DEMO_DIR, folder);
  if (!fs.statSync(dir).isDirectory()) continue;

  for (const file of fs.readdirSync(dir)) {
    if (
      file.endsWith("AdminDashboardDemo.tsx") ||
      file.endsWith("ParentDashboardDemo.tsx") ||
      file.endsWith("TeacherDashboardDemo.tsx") ||
      (file.startsWith("lazy") && file.endsWith("Demos.tsx"))
    ) {
      fs.unlinkSync(path.join(dir, file));
      deleted++;
    }
  }
}

console.log(`Deleted ${deleted} duplicated demo files`);
