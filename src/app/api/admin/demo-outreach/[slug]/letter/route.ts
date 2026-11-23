import { NextResponse } from "next/server";
import { getOutreachPlan } from "@/data/outreach";
import { LETTER_TO_FIRST_EMAIL_BUSINESS_DAYS } from "@/data/outreach/types";
import { ensureSchoolForDemo, loadOutreach, logDemoOutreachTouch } from "@/lib/admin-crm/demo-outreach";
import { findDemo, readJsonBody, withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { addBusinessDays } from "@/lib/admin-crm/outreach-email";
import { letterMailedAt } from "@/lib/admin-crm/outreach-letter";
import { apiError } from "@/lib/api/route-errors";

const ROUTE = "/api/admin/demo-outreach/[slug]/letter";

type RouteContext = { params: Promise<{ slug: string }> };

/** Noon UTC on a YYYY-MM-DD date, or now when it's today (so the time reads right in the log). */
function mailedAtIso(mailedOn: string, now: Date): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(mailedOn)) return null;
  const at = new Date(`${mailedOn}T12:00:00.000Z`);
  if (Number.isNaN(at.getTime())) return null;
  if (at.getTime() > now.getTime() + 36 * 60 * 60 * 1000) return null; // not in the future
  return mailedOn === now.toISOString().slice(0, 10) ? now.toISOString() : at.toISOString();
}

/**
 * Log the school's handwritten letter as mailed (a `mail` touch). The first email then comes due
 * five business days later. Body: { mailedOn: "YYYY-MM-DD" }.
 */
export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  return withDemoOutreachAdmin(ROUTE, request, "Failed to log the letter.", async ({ admin, user }) => {
    const demo = findDemo(slug);
    const plan = getOutreachPlan(slug);
    if (!demo || !plan?.letter) {
      return apiError(ROUTE, { request, status: 404, error: "This school has no handwritten letter.", code: "no_letter" });
    }

    const body = await readJsonBody(request);
    const now = new Date();
    const occurredAt = typeof body?.mailedOn === "string" ? mailedAtIso(body.mailedOn, now) : null;
    if (!occurredAt) {
      return apiError(ROUTE, { request, status: 400, error: "Pick the day you mailed it (not in the future).", code: "invalid_body" });
    }

    const school = await ensureSchoolForDemo(admin, demo);
    const current = await loadOutreach(admin, school.id);
    if (letterMailedAt(current.touches)) {
      return apiError(ROUTE, { request, status: 409, error: "The letter is already logged as mailed.", code: "already_logged" });
    }

    const outreach = await logDemoOutreachTouch(admin, school, {
      channel: "mail",
      direction: "outbound",
      note: `Handwritten letter to ${plan.letter.founder.firstName} (QR card: /hi/${plan.letter.shortCode})`,
      occurredAt,
      nextFollowUpAt: addBusinessDays(occurredAt, LETTER_TO_FIRST_EMAIL_BUSINESS_DAYS).toISOString(),
      createdBy: user.id,
    });
    return NextResponse.json({ slug, outreach }, { status: 201 });
  });
}
