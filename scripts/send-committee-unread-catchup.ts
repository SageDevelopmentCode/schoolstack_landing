/**
 * One-time unread committee message catch-up emails for active members.
 *
 * Usage:
 *   ORGANIZATION_ID=8adbfe08-b25b-4626-b3ac-23424a1a0a3b \
 *   COMMITTEE_ID=<optional-committee-uuid> \
 *   npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/send-committee-unread-catchup.ts
 *
 * Dry run (no send, no activity_events):
 *   DRY_RUN=1 ORGANIZATION_ID=... npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/send-committee-unread-catchup.ts
 */

import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

const PRODUCTION_SITE_URL = "https://trymudkitchen.com";

function log(message: string) {
  console.log(`[send-committee-unread-catchup] ${message}`);
}

function ensureProductionSiteUrl(): string {
  const current = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (!current || current.includes("localhost")) {
    process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_SITE_URL;
  }
  return process.env.NEXT_PUBLIC_SITE_URL!;
}

function isDryRun(): boolean {
  const value = process.env.DRY_RUN?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function isZohoReady(): boolean {
  const disabled =
    process.env.DISABLE_OUTBOUND_EMAIL === "1" ||
    process.env.DISABLE_OUTBOUND_EMAIL === "true";
  if (disabled) return false;

  return !!(
    process.env.ZOHO_CLIENT_ID &&
    process.env.ZOHO_CLIENT_SECRET &&
    process.env.ZOHO_REDIRECT_URI &&
    process.env.ZOHO_REFRESH_TOKEN
  );
}

function parseOrganizationId(): string {
  const organizationId = process.env.ORGANIZATION_ID?.trim();
  if (!organizationId) {
    throw new Error("ORGANIZATION_ID is required");
  }
  return organizationId;
}

function parseCommitteeIds(): string[] | undefined {
  const single = process.env.COMMITTEE_ID?.trim();
  const list = process.env.COMMITTEE_IDS?.trim();
  if (list) {
    return list
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }
  if (single) return [single];
  return undefined;
}

async function main() {
  const siteUrl = ensureProductionSiteUrl();
  log(`Using site URL: ${siteUrl}`);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error(
      "[send-committee-unread-catchup] Supabase credentials not configured in .env.local",
    );
    process.exit(1);
  }

  const organizationId = parseOrganizationId();
  const committeeIds = parseCommitteeIds();
  const dryRun = isDryRun();

  if (dryRun) {
    log("DRY_RUN enabled — will not send emails or write activity_events");
  } else if (!isZohoReady()) {
    console.error(
      "[send-committee-unread-catchup] Zoho email is not configured — emails would not send",
    );
    process.exit(1);
  }

  const { createAdminClient } = await import("@/utils/supabase/admin");
  const { sendCommitteeUnreadMessageCatchUpForOrganization } = await import(
    "@/lib/committees/unread-message-catchup"
  );

  const admin = createAdminClient();

  const result = await sendCommitteeUnreadMessageCatchUpForOrganization(
    admin,
    organizationId,
    {
      committeeIds,
      dryRun,
    },
  );

  log(
    JSON.stringify(
      {
        organizationId,
        committeeIds: committeeIds ?? null,
        ...result,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("[send-committee-unread-catchup] Failed:", error);
  process.exit(1);
});
