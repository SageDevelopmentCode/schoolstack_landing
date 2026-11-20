import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadParentNewslettersListBundle } from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { requireTeacherNewsletterAccess } from "@/lib/school-teacher/newsletters/teacher-newsletter-access";

const ROUTE = "/api/teacher-portal/newsletters";

/** Published newsletters for staff (web and mobile). Same list families see. */
export async function GET(request: Request) {
  const access = await requireTeacherNewsletterAccess(request, ROUTE);
  if (!access.ok) return access.response;
  try {
    const bundle = await loadParentNewslettersListBundle(access.admin, access.organizationId);
    return NextResponse.json(bundle);
  } catch (err) {
    return apiError(ROUTE, { request, status: 500, error: "Failed to load newsletters.", cause: err, code: "load_failed" });
  }
}
