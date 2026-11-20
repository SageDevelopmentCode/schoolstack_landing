import { NextResponse } from "next/server";
import { requireTeacherNewsletterAccess } from "@/lib/school-teacher/newsletters/teacher-newsletter-access";
import { loadTeacherNewsletterDetailOrError } from "@/lib/school-teacher/newsletters/load-teacher-newsletter-detail";

const ROUTE = "/api/teacher-portal/newsletters/[editionId]";

export async function GET(request: Request, context: { params: Promise<{ editionId: string }> }) {
  const access = await requireTeacherNewsletterAccess(request, ROUTE);
  if (!access.ok) return access.response;
  const { editionId } = await context.params;
  const result = await loadTeacherNewsletterDetailOrError(request, ROUTE, access.admin, access.organizationId, editionId);
  if (!result.ok) return result.response;
  return NextResponse.json(result.bundle);
}
