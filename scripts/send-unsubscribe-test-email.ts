/**
 * Send one marketing-style test email with the production unsubscribe footer.
 *
 *   npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/send-unsubscribe-test-email.ts
 *
 * Optional: TEST_EMAIL_TO=you@example.com
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const to = process.env.TEST_EMAIL_TO?.trim() || "juliuscecilia33@gmail.com";

async function main() {
  if (!process.env.EMAIL_UNSUBSCRIBE_SECRET) {
    console.error("EMAIL_UNSUBSCRIBE_SECRET is not set in .env.local");
    process.exit(1);
  }

  const { isZohoConfigured } = await import("../src/lib/zoho");
  if (!(await isZohoConfigured())) {
    console.error("Zoho outbound email is not configured");
    process.exit(1);
  }

  const { sendBulletinPublishedEmail } = await import("../src/lib/emails");

  const result = await sendBulletinPublishedEmail({
    to,
    schoolName: "Rooted Meadows (test)",
    postTitle: "Unsubscribe footer test",
    audienceLabel: "All families",
    excerpt:
      "This is a one-off test email so you can confirm the unsubscribe link at the bottom of MudKitchen emails.",
    attachmentCount: 0,
    portalUrl: "https://trymudkitchen.com/school/rooted-meadows/parent/bulletin",
    publisherName: "MudKitchen",
  });

  if (!result.ok) {
    console.error("Send failed (check Zoho SMTP logs)");
    process.exit(1);
  }

  console.log(`Test email sent to ${to}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
