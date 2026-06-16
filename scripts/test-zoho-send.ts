import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { buildHomepageQuestionConfirmationHtml } = await import("../src/lib/emails");
  const { isZohoConfigured, sendZohoEmail } = await import("../src/lib/zoho");

  if (!(await isZohoConfigured())) {
    throw new Error("Zoho is not configured in .env.local");
  }

  const toAddress = "juliuscecilia33@gmail.com";
  const content = buildHomepageQuestionConfirmationHtml({ name: "Julius" });

  const result = await sendZohoEmail({
    toAddress,
    subject: "MudKitchen test email",
    content,
  });

  if (!result.success) {
    throw new Error(result.error ?? "Failed to send test email");
  }

  console.log(`Test email sent to ${toAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
