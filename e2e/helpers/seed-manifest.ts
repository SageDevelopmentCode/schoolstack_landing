import fs from "node:fs";
import path from "node:path";
import type { E2eSeedManifest } from "../fixtures/seed";

const SEED_MANIFEST_PATH = path.join(process.cwd(), "e2e/.seed-manifest.json");

export function getSeedManifest(): E2eSeedManifest {
  if (!fs.existsSync(SEED_MANIFEST_PATH)) {
    throw new Error(
      `E2E seed manifest not found at ${SEED_MANIFEST_PATH}. Run npm run test:e2e (globalSetup seeds the database first).`,
    );
  }

  const raw = fs.readFileSync(SEED_MANIFEST_PATH, "utf8");
  const manifest = JSON.parse(raw) as E2eSeedManifest;

  if (!manifest.applications?.alphaChild || !manifest.applications?.betaChild) {
    throw new Error(
      `E2E seed manifest at ${SEED_MANIFEST_PATH} is missing application IDs.`,
    );
  }

  return manifest;
}
