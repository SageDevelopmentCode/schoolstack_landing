import { NextResponse } from "next/server";
import { deleteDemoOutreachTouch } from "@/lib/admin-crm/demo-outreach";
import { withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { apiError } from "@/lib/api/route-errors";

const ROUTE = "/api/admin/demo-outreach/touches/[touchId]";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ touchId: string }> };

/** Remove a mistakenly logged touch. Status and last-contacted date are left as they are. */
export async function DELETE(request: Request, context: RouteContext) {
  const { touchId } = await context.params;

  return withDemoOutreachAdmin(ROUTE, request, "Failed to delete the touch.", async ({ admin }) => {
    if (!UUID_RE.test(touchId)) {
      return apiError(ROUTE, { request, status: 400, error: "Invalid touch id.", code: "invalid_touch" });
    }
    const outreach = await deleteDemoOutreachTouch(admin, touchId);
    if (!outreach) {
      return apiError(ROUTE, { request, status: 404, error: "Touch not found.", code: "not_found" });
    }
    return NextResponse.json({ outreach });
  });
}
