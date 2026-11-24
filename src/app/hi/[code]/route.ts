import { NextResponse } from "next/server";
import { getOutreachPlanByLetterCode } from "@/data/outreach";
import { snapshotPath } from "@/lib/admin-crm/outreach-email";

/**
 * Short link printed under the QR code on the handwritten letter's insert card
 * (trymudkitchen.com/hi/<code>). Opens the school's snapshot, which links their demo.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const plan = getOutreachPlanByLetterCode(code);
  const path = plan && !plan.doNotEmail ? snapshotPath(plan) : null;
  const target = new URL(path ? `${path}?via=letter` : "/", request.url);
  const response = NextResponse.redirect(target, 307);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
