import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  buildE2eWebServerEnv,
  loadE2eDotenv,
  resolveE2eBaseUrl,
  resolveE2eWebServerPort,
} from "../e2e/web-server-env";

loadE2eDotenv();

const baseURL = resolveE2eBaseUrl();
const port = resolveE2eWebServerPort(baseURL);
const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");

if (!fs.existsSync(buildIdPath)) {
  console.error("Missing production build. Run: npm run test:e2e:build");
  process.exit(1);
}

const webServerEnv = buildE2eWebServerEnv(baseURL);

const child = spawn("npx", ["next", "start", "-p", String(port)], {
  stdio: "inherit",
  env: {
    ...process.env,
    ...webServerEnv,
  },
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
