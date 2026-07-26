#!/usr/bin/env node
/**
 * Upload legacy application PDF to storage, then run the SQL import script.
 *
 * Usage:
 *   node scripts/import-rooted-meadows-submission.mjs ritchie-olivia
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const value = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars already exported
  }
}

const IMPORTS = {
  "ritchie-olivia": {
    sqlFile: "supabase/migrations_manual/import_rooted_meadows_submission_ritchie_olivia.sql",
    pdfPath: "/Users/juliuscecilia/Downloads/26-27 Ritchie, Olivia Application.pdf",
    storagePath:
      "1085332b-aef4-4910-a35d-ccb2611d9b11/applications/a0f1b245-6d2e-7a8b-1c9d-4e5f6a7b8c93/f3e7b469d1a5/d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f90_26-27_Ritchie_Olivia_Application.pdf",
  },
  "calvert-arrow": {
    sqlFile: "supabase/migrations_manual/import_rooted_meadows_submission_calvert_arrow.sql",
    pdfPath: "/Users/juliuscecilia/Downloads/26-27 Calvert, Arrow application.pdf",
    storagePath:
      "8adbfe08-b25b-4626-b3ac-23424a1a0a3b/applications/d4e5f6a7-b8c9-4012-e345-6789abcdef01/f3e7b469d1a5/f6a7b8c9-d0e1-4234-a567-89abcdef0123_26-27_Calvert_Arrow_Application.pdf",
  },
  "edwards-eben": {
    sqlFile: "supabase/migrations_manual/import_rooted_meadows_submission_edwards_eben.sql",
    pdfPath: "/Users/juliuscecilia/Downloads/26-27 Edwards, Eben Application.pdf",
    storagePath:
      "8adbfe08-b25b-4626-b3ac-23424a1a0a3b/applications/c4d5e6f7-a8b9-4012-c345-6789abcdef01/f3e7b469d1a5/e6f7a8b9-c0d1-4234-e567-89abcdef0123_26-27_Edwards_Eben_Application.pdf",
  },
  "caballero-helene-clara": {
    sqlFile: "supabase/migrations_manual/import_rooted_meadows_submission_caballero_helene_clara.sql",
    pdfPath: "/Users/juliuscecilia/Downloads/26-27 Caballero, Helene & Clara Application.pdf",
    storagePath:
      "8adbfe08-b25b-4626-b3ac-23424a1a0a3b/applications/d4e5f6a7-b8c9-4012-d345-6789abcdef01/f3e7b469d1a5/29c0d1e2-f3a4-4456-c789-abcdef012345_26-27_Caballero_Helene_Clara_Application.pdf",
  },
  "patterson-eli": {
    sqlFile: "supabase/migrations_manual/import_rooted_meadows_submission_patterson_eli.sql",
    pdfPath: "/Users/juliuscecilia/Downloads/26-27 Patterson, Eli Application.pdf",
    storagePath:
      "8adbfe08-b25b-4626-b3ac-23424a1a0a3b/applications/f4a5b6c7-d8e9-4012-f345-6789abcdef02/f3e7b469d1a5/b6c7d8e9-f0a1-4234-b567-89abcdef0124_26-27_Patterson_Eli_Application.pdf",
  },
  "sekyere-claire-olivia-georgie": {
    sqlFile:
      "supabase/migrations_manual/import_rooted_meadows_submission_sekyere_claire_olivia_georgie.sql",
    pdfPath: "/Users/juliuscecilia/Downloads/26-27 Sekyere Application.pdf",
    storagePath:
      "8adbfe08-b25b-4626-b3ac-23424a1a0a3b/applications/d5e6f7a8-b9c0-4123-d456-789abcdef012/f3e7b469d1a5/5da6e7f8-a9b0-4234-c567-89abcdef0123_26-27_Sekyere_Application.pdf",
  },
  "sparhawk-olivia-daniella": {
    sqlFile:
      "supabase/migrations_manual/import_rooted_meadows_submission_sparhawk_olivia_daniella.sql",
    pdfPath: "/Users/juliuscecilia/Downloads/26-27 Sparhawk, Olivia & Daniella Application.pdf",
    storagePath:
      "8adbfe08-b25b-4626-b3ac-23424a1a0a3b/applications/e4f5a6b7-c8d9-4012-e345-6789abcdef01/f3e7b469d1a5/39e0f1a2-b3c4-4567-d890-abcdef012347_26-27_Sparhawk_Olivia_Daniella_Application.pdf",
  },
  "thompson-nina-maggie": {
    sqlFile:
      "supabase/migrations_manual/import_rooted_meadows_submission_thompson_nina_maggie.sql",
    pdfPath: "/Users/juliuscecilia/Downloads/26-27 Thompson, Nina & Maggie application.pdf",
    storagePath:
      "8adbfe08-b25b-4626-b3ac-23424a1a0a3b/applications/f4a5b6c7-d8e9-4012-f456-789abcdef013/f3e7b469d1a5/49f0a1b2-c3d4-4567-e901-bcdef0123489_26-27_Thompson_Nina_Maggie_Application.pdf",
  },
};

async function main() {
  loadEnv();

  const key = process.argv[2];
  const config = IMPORTS[key];
  if (!config) {
    console.error(`Unknown import "${key}". Available: ${Object.keys(IMPORTS).join(", ")}`);
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const pdfBytes = readFileSync(config.pdfPath);
  console.log(`Uploading ${config.pdfPath} (${pdfBytes.length} bytes)...`);

  const { error: uploadError } = await supabase.storage
    .from("application-files")
    .upload(config.storagePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    console.error("Storage upload failed:", uploadError.message);
    process.exit(1);
  }

  console.log("Uploaded to application-files:", config.storagePath);

  const sql = readFileSync(resolve(root, config.sqlFile), "utf8");
  const { error: sqlError } = await supabase.rpc("exec_sql", { query: sql }).maybeSingle();

  if (sqlError) {
    // exec_sql RPC may not exist — print SQL path for manual run
    console.log("SQL RPC not available. Run this file in Supabase SQL Editor:");
    console.log(resolve(root, config.sqlFile));
    if (sqlError.message) console.error(sqlError.message);
    process.exit(0);
  }

  console.log("Import complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
