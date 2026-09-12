/**
 * Trigger regenerateFutureCharges for assignments (same as admin PATCH).
 *
 * Usage:
 *   npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/regenerate-tuition-assignments.ts
 *
 * Dry run:
 *   DRY_RUN=1 npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/regenerate-tuition-assignments.ts
 */

import { resolve } from "node:path";
import { config } from "dotenv";
import { updateAssignment } from "@/lib/tuition/assignments";
import { createAdminClient } from "@/utils/supabase/admin";

config({ path: resolve(process.cwd(), ".env.local") });

const ASSIGNMENTS = [
  {
    id: "d6dc604d-943c-4e79-a417-9f21caf3f636",
    family: "Evensen Family",
    paymentPlanId: "d71cbc99-6d74-4c57-b174-fa0bd8d6a164",
    effectiveStart: "2026-09-01",
  },
  {
    id: "fa3d745b-c239-460e-9446-969f0b239740",
    family: "Ritchie Family",
    paymentPlanId: "d71cbc99-6d74-4c57-b174-fa0bd8d6a164",
    effectiveStart: "2026-09-01",
  },
] as const;

function log(message: string) {
  console.log(`[regenerate-tuition-assignments] ${message}`);
}

async function main() {
  const dryRun = process.env.DRY_RUN?.trim().toLowerCase() === "1";

  if (dryRun) {
    for (const assignment of ASSIGNMENTS) {
      log(`DRY RUN: would regen ${assignment.family} (${assignment.id})`);
    }
    return;
  }

  const supabase = createAdminClient();

  for (const assignment of ASSIGNMENTS) {
    log(`Regenerating charges for ${assignment.family} (${assignment.id})...`);
    const updated = await updateAssignment(
      supabase,
      assignment.id,
      {
        paymentPlanId: assignment.paymentPlanId,
        effectiveStart: assignment.effectiveStart,
      },
      { skip: true },
    );
    log(
      `Done: ${assignment.family} effectiveStart=${updated.effectiveStart} paymentPlanId=${updated.paymentPlanId}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
