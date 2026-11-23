import "server-only";
import { listOutreachPlans } from "@/data/outreach";
import type { OutreachLetter } from "@/data/outreach/types";
import { letterQrSvg } from "@/lib/admin-crm/letter-qr";
import { letterShortUrl, letterShortUrlLabel } from "@/lib/admin-crm/outreach-letter";
import { PRODUCTION_SITE_URL } from "@/lib/site";

export type LetterBulkCard = {
  slug: string;
  schoolName: string;
  letter: OutreachLetter;
  schoolShortName: string;
  qrSvg: string;
  shortUrlLabel: string;
};

/** One QR card per school that has a letter and a snapshot (same rule as the single-school card page), A–Z. */
export async function loadLetterBulkCards(): Promise<LetterBulkCard[]> {
  const plans = listOutreachPlans()
    .filter((plan) => plan.letter && plan.snapshot)
    .sort((a, b) => a.schoolName.localeCompare(b.schoolName));
  return Promise.all(
    plans.map(async (plan) => {
      const letter = plan.letter!;
      return {
        slug: plan.slug,
        schoolName: plan.schoolName,
        letter,
        schoolShortName: letter.shortSchoolName,
        qrSvg: await letterQrSvg(letterShortUrl(letter.shortCode, PRODUCTION_SITE_URL)),
        shortUrlLabel: letterShortUrlLabel(letter.shortCode, PRODUCTION_SITE_URL),
      };
    }),
  );
}
