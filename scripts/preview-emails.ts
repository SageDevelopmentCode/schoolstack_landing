import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildApplicationSubmittedConfirmationHtml,
  buildDemoBookingConfirmationHtml,
  buildDemoFeedbackConfirmationHtml,
  buildHomepageQuestionConfirmationHtml,
  buildPaymentReceiptConfirmationHtml,
  buildTuitionDueReminderHtml,
  buildTuitionLateFeeHtml,
  buildTuitionPaymentReceiptHtml,
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
    filename: "application-submitted.html",
    html: buildApplicationSubmittedConfirmationHtml({
      name: "Maria Lopez",
      schoolName: "Rooted Meadows",
      formTitle: "2026–27 Enrollment Application",
      applyDashboardUrl: "https://trymudkitchen.com/apply/rooted-meadows",
    }),
    checks: [
      "Application Received",
      "Thank you",
      "View apply dashboard",
      "Rooted Meadows",
    ],
  },
  {
    filename: "payment-receipt.html",
    html: buildPaymentReceiptConfirmationHtml({
      name: "David Kim",
      schoolName: "Rooted Meadows",
      label: "Application fee",
      amountCents: 7500,
      chargedAmountCents: 7725,
      processingFeeCents: 225,
      paymentMethodLabel: "Visa",
      paidAtLabel: "July 27, 2026 at 2:30 PM",
      applyDashboardUrl: "https://trymudkitchen.com/apply/rooted-meadows",
    }),
    checks: ["Payment Receipt", "Thank you", "$77.25", "View apply dashboard"],
  },
  {
    filename: "tuition-reminder.html",
    html: buildTuitionDueReminderHtml({
      familyName: "Nguyen",
      schoolName: "Rooted Meadows",
      dueDate: "August 1, 2026",
      totalDue: "$450.00",
      chargeLines: ["Tuition — August ($400.00)", "Materials fee ($50.00)"],
      billingUrl: "https://trymudkitchen.com/parent/billing",
    }),
    checks: ["Tuition Reminder", "Total due", "View billing", "Materials fee"],
  },
  {
    filename: "tuition-payment-receipt-standard.html",
    html: buildTuitionPaymentReceiptHtml({
      name: "Jon Cecilia",
      schoolName: "Rooted Meadows",
      billingUrl: "https://trymudkitchen.com/school/rooted-meadows/parent/billing",
      paidAtLabel: "August 8, 2026 at 2:30 PM",
      paymentMethodLabel: "Card",
      amountCents: 72000,
      chargedAmountCents: 74182,
      processingFeeCents: 2182,
      studentName: "Jon",
      chargeLabel: "Aug Tuition",
    }),
    checks: [
      "Payment Receipt",
      "Thank you",
      "Jon",
      "Aug Tuition",
      "$720.00",
      "$741.82",
      "View billing",
    ],
  },
  {
    filename: "tuition-payment-receipt-lump-sum.html",
    html: buildTuitionPaymentReceiptHtml({
      name: "Jon Cecilia",
      schoolName: "Rooted Meadows",
      billingUrl: "https://trymudkitchen.com/school/rooted-meadows/parent/billing",
      paidAtLabel: "August 8, 2026 at 3:00 PM",
      paymentMethodLabel: "Card",
      amountCents: 500000,
      chargedAmountCents: 514550,
      processingFeeCents: 14550,
      studentName: "Jon",
      chargeLabel: "Aug Tuition",
      lumpSumBreakdown: {
        installmentCents: 72000,
        futureCents: 428000,
        redistributed: true,
      },
    }),
    checks: [
      "Payment breakdown",
      "$720.00 installment",
      "$4,280.00 future",
      "Future installments were recalculated",
    ],
  },
  {
    filename: "tuition-payment-receipt-combined.html",
    html: buildTuitionPaymentReceiptHtml({
      name: "Cecilia Family",
      schoolName: "Rooted Meadows",
      billingUrl: "https://trymudkitchen.com/school/rooted-meadows/parent/billing",
      paidAtLabel: "August 8, 2026 at 4:00 PM",
      paymentMethodLabel: "Card",
      amountCents: 144000,
      chargedAmountCents: 148364,
      processingFeeCents: 4364,
      combinedLineItems: [
        {
          studentName: "Caleb",
          chargeLabel: "Aug Tuition",
          amountCents: 72000,
        },
        {
          studentName: "Jon",
          chargeLabel: "Aug Tuition",
          amountCents: 72000,
        },
      ],
    }),
    checks: [
      "Charges paid",
      "Caleb",
      "Jon",
      "$1,483.64",
      "View billing",
    ],
  },
  {
    filename: "tuition-payment-receipt-bank.html",
    html: buildTuitionPaymentReceiptHtml({
      name: "Jon Cecilia",
      schoolName: "Rooted Meadows",
      billingUrl: "https://trymudkitchen.com/school/rooted-meadows/parent/billing",
      paidAtLabel: "August 8, 2026 at 5:00 PM",
      paymentMethodLabel: "ACH",
      amountCents: 72000,
      chargedAmountCents: 72500,
      processingFeeCents: 500,
      studentName: "Jon",
      chargeLabel: "Aug Tuition",
    }),
    checks: ["ACH", "$5.00", "Processing fee", "$725.00"],
  },
  {
    filename: "late-fee.html",
    html: buildTuitionLateFeeHtml({
      familyName: "Nguyen",
      schoolName: "Rooted Meadows",
      totalDue: "$50.00",
      chargeLines: ["Late fee — August 2026 — $50.00"],
      billingUrl: "https://trymudkitchen.com/school/rooted-meadows/parent/billing",
    }),
    checks: ["Late Fee", "late fee", "View billing", "$50.00"],
  },
  {
    filename: "supabase-magic-link-otp.html",
    html: buildSupabaseMagicLinkOtpHtml(sampleToken),
    checks: [
      "Sign In",
      "Your sign-in code to continue",
      sampleToken,
      "trymudkitchen.com/images/Logo.png",
    ],
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
