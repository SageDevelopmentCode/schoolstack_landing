#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/data/school-demos");

for (const file of fs.readdirSync(DATA)) {
  if (!file.endsWith("-parent-demo.ts") && !file.endsWith("-teacher-demo.ts")) continue;
  const full = path.join(DATA, file);
  let src = fs.readFileSync(full, "utf8");
  const logoMatch = src.match(/logo: ([A-Z_]+_ADMIN_LOGO)/);
  if (!logoMatch) continue;
  const logoConst = logoMatch[1];
  if (src.includes(`import { ${logoConst}`)) continue;

  const adminFile = file.replace("-parent-demo.ts", "-admin-demo.ts").replace("-teacher-demo.ts", "-admin-demo.ts");
  if (!fs.existsSync(path.join(DATA, adminFile))) continue;

  const importLine = `import { ${logoConst} } from "./${adminFile.replace(".ts", "")}";\n`;
  if (!src.includes(importLine.trim())) {
    const configImport = src.indexOf('import type { School');
    if (configImport === -1) {
      src = importLine + src;
    } else {
      src = src.slice(0, configImport) + importLine + src.slice(configImport);
    }
    fs.writeFileSync(full, src);
    console.log("fixed", file);
  }
}
