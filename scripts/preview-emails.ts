import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildDemoBookingConfirmationHtml,
  buildDemoFeedbackConfirmationHtml,
  buildHomepageQuestionConfirmationHtml,
} from "../src/lib/emails";

const outDir = join(process.cwd(), ".email-previews");
mkdirSync(outDir, { recursive: true });

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

console.log(`\nPreview files written to ${outDir}`);
