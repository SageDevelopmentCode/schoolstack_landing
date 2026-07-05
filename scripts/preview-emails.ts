import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildDemoBookingConfirmationHtml,
  buildDemoFeedbackConfirmationHtml,
  buildHomepageQuestionConfirmationHtml,
} from "../src/lib/emails";
import {
  buildSupabaseConfirmSignupOtpHtml,
  buildSupabaseMagicLinkOtpHtml,
  SUPABASE_CONFIRM_SIGNUP_SUBJECT,
  SUPABASE_MAGIC_LINK_SUBJECT,
} from "../src/lib/supabase-auth-emails";

const outDir = join(process.cwd(), ".email-previews");
const supabaseTemplatesDir = join(process.cwd(), "supabase/email-templates");

mkdirSync(outDir, { recursive: true });
mkdirSync(supabaseTemplatesDir, { recursive: true });

const sampleToken = "482916";

const supabaseMagicLinkExport = buildSupabaseMagicLinkOtpHtml();
const supabaseConfirmSignupExport = buildSupabaseConfirmSignupOtpHtml();

writeFileSync(
  join(supabaseTemplatesDir, "magic-link.html"),
  supabaseMagicLinkExport,
  "utf8",
);
writeFileSync(
  join(supabaseTemplatesDir, "confirm-signup.html"),
  supabaseConfirmSignupExport,
  "utf8",
);

writeFileSync(
  join(supabaseTemplatesDir, "subjects.txt"),
  [
    "Supabase email template subjects (paste into dashboard Subject field)",
    "",
    "Magic Link:",
    SUPABASE_MAGIC_LINK_SUBJECT,
    "",
    "Confirm signup:",
    SUPABASE_CONFIRM_SIGNUP_SUBJECT,
    "",
  ].join("\n"),
  "utf8",
);

const previews = [
  {
    filename: "demo-booking.html",
    html: buildDemoBookingConfirmationHtml({
      name: "Jane Smith",
      schoolName: "Oak Grove Microschool",
      scheduledDate: "2026-06-20",
      scheduledTime: "10:00 AM",
    }),
    checks: ["Demo Confirmed", "You're all set", "Visit MudKitchen", "trymudkitchen.com/images/Logo.png"],
  },
  {
    filename: "homepage-question.html",
    html: buildHomepageQuestionConfirmationHtml({ name: "Alex Rivera" }),
    checks: ["Message Received", "Thanks for reaching out", "Explore MudKitchen"],
  },
  {
    filename: "demo-feedback.html",
    html: buildDemoFeedbackConfirmationHtml({
      name: "Sam Chen",
      schoolName: "Athena Microacademy",
    }),
    checks: ["Feedback Received", "We appreciate your input", "Book a Demo", "/get-started"],
  },
  {
    filename: "supabase-magic-link-otp.html",
    html: buildSupabaseMagicLinkOtpHtml(sampleToken),
    checks: ["Sign In", "Your sign-in code", sampleToken, "trymudkitchen.com/images/Logo.png"],
  },
  {
    filename: "supabase-confirm-signup-otp.html",
    html: buildSupabaseConfirmSignupOtpHtml(sampleToken),
    checks: ["Verify Email", "Confirm your email", sampleToken, "trymudkitchen.com/images/Logo.png"],
  },
];

for (const preview of previews) {
  writeFileSync(join(outDir, preview.filename), preview.html, "utf8");

  for (const check of preview.checks) {
    if (!preview.html.includes(check)) {
      throw new Error(`${preview.filename} missing expected content: ${check}`);
    }
  }

  console.log(`✓ ${preview.filename}`);
}

if (!supabaseMagicLinkExport.includes("{{ .Token }}")) {
  throw new Error("magic-link.html export missing {{ .Token }}");
}
if (!supabaseConfirmSignupExport.includes("{{ .Token }}")) {
  throw new Error("confirm-signup.html export missing {{ .Token }}");
}

console.log("✓ supabase/email-templates/magic-link.html");
console.log("✓ supabase/email-templates/confirm-signup.html");
console.log("✓ supabase/email-templates/subjects.txt");
console.log(`\nPreview files written to ${outDir}`);
