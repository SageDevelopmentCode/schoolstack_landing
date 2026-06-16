import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { buildHomepageQuestionConfirmationHtml } = await import("../src/lib/emails");
  const { isSmtpConfigured } = await import("../src/lib/zoho-smtp");
  const { isZohoConfigured, sendZohoEmail } = await import("../src/lib/zoho");

  if (!(await isZohoConfigured()) && !isSmtpConfigured()) {
    throw new Error(
      "Email is not configured. Set Zoho OAuth vars and/or ZOHO_SMTP_USER + ZOHO_SMTP_PASSWORD in .env.local"
    );
  }

  if (!isSmtpConfigured()) {
    console.warn(
      "Warning: ZOHO_SMTP_PASSWORD is not set — sending via REST API (display name may show as 'julius')."
    );
    console.warn("Add Zoho SMTP app password vars for correct From: Julius Cecilia <...> header.\n");
  } else {
    console.log("Sending via Zoho SMTP (display name should appear as Julius Cecilia)...\n");
  }

  const toAddress = process.argv[2] ?? "juliuscecilia33@gmail.com";
  const content = buildHomepageQuestionConfirmationHtml({ name: "Julius" });

  const result = await sendZohoEmail({
    toAddress,
    subject: "MudKitchen test email (SMTP)",
    content,
  });

  if (!result.success) {
    throw new Error(result.error ?? "Failed to send test email");
  }

  console.log(`Test email sent to ${toAddress}`);
  console.log("Check Gmail → Show original → From should include Julius Cecilia");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
