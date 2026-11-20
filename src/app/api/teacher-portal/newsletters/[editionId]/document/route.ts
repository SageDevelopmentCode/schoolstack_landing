import { requireTeacherNewsletterAccess } from "@/lib/school-teacher/newsletters/teacher-newsletter-access";
import { loadTeacherNewsletterDetailOrError } from "@/lib/school-teacher/newsletters/load-teacher-newsletter-detail";

const ROUTE = "/api/teacher-portal/newsletters/[editionId]/document";

/** The standalone Garden newsletter document (staff full screen + mobile WebView). */
export async function GET(request: Request, context: { params: Promise<{ editionId: string }> }) {
  const access = await requireTeacherNewsletterAccess(request, ROUTE);
  if (!access.ok) return access.response;
  const { editionId } = await context.params;
  const result = await loadTeacherNewsletterDetailOrError(request, ROUTE, access.admin, access.organizationId, editionId);
  if (!result.ok) return result.response;
  return new Response(result.bundle.htmlDocument, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" },
  });
}
