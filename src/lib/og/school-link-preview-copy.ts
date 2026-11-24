import "server-only";
import { getAdmissionsOrgSettings } from "@/lib/admissions/admissions-org-settings";
import { resolvePublishedApplyEntryCached } from "@/lib/admissions/public-apply-cache";
import {
  parsePublicTourPageSettings,
  resolvePublicTourHeadline,
  resolvePublicTourIntro,
} from "@/lib/admissions/public-tour-settings";
import { isApplyProgramPicker } from "@/lib/admissions/resolve-published-apply-entry";
import { truncateText, type SchoolPreviewPage } from "@/lib/og/school-link-preview-core";
import { createAdminClient } from "@/utils/supabase/admin";

export type SchoolPreviewCopy = {
  /** Small pill above the headline. */
  eyebrow?: string;
  headline: string;
  /** One supporting line (the school's own intro text, trimmed). */
  sub?: string;
};

type Org = { id: string; name: string };

function applyCopy(org: Org): SchoolPreviewCopy {
  return { eyebrow: "Applications", headline: `Apply to ${org.name}` };
}

/**
 * The words on a school's card, taken from what the page itself shows: the tour headline and intro
 * the school wrote, the application form's title and intro, or just the school's name. Never
 * accepts text from the request, so nobody can mint a card with a school's logo and their own words.
 */
export async function resolveSchoolPreviewCopy(org: Org, page: SchoolPreviewPage, formSlug?: string | null): Promise<SchoolPreviewCopy> {
  try {
    if (page === "tour") {
      const admissions = await getAdmissionsOrgSettings(createAdminClient(), org.id);
      const tour = parsePublicTourPageSettings(admissions.publicTour);
      return {
        eyebrow: "Schedule a tour",
        headline: truncateText(resolvePublicTourHeadline(tour), 80),
        sub: truncateText(resolvePublicTourIntro(tour), 110),
      };
    }
    if (page === "form" && formSlug) {
      const entry = await resolvePublishedApplyEntryCached(org.id, formSlug);
      if (!entry || isApplyProgramPicker(entry)) return applyCopy(org);
      return {
        eyebrow: "Applications",
        headline: truncateText(entry.title, 80) || `Apply to ${org.name}`,
        sub: entry.intro ? truncateText(entry.intro, 110) : undefined,
      };
    }
    if (page === "apply" || page === "form") return applyCopy(org);
  } catch {
    // Fall through to the plain school card rather than failing the preview.
  }
  return { headline: org.name };
}
