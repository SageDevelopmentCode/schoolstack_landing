import { NextResponse } from "next/server";
import { readJsonBody, withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { parseSchoolPatch, ResearchInputError, updateResearchSchool } from "@/lib/admin-crm/research-workspace";
import { apiError } from "@/lib/api/route-errors";

const ROUTE = "/api/admin/research/schools/[id]";

type RouteContext = { params: Promise<{ id: string }> };

/** Updates a school's status, priority, demo link, contact or notes. */
export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return withDemoOutreachAdmin(ROUTE, request, "Failed to save the school.", async ({ admin }) => {
    const body = await readJsonBody(request);
    if (!body) return apiError(ROUTE, { request, status: 400, error: "Invalid JSON body.", code: "invalid_body" });
    try {
      const school = await updateResearchSchool(admin, id, parseSchoolPatch(body));
      if (!school) return apiError(ROUTE, { request, status: 404, error: "School not found.", code: "not_found" });
      return NextResponse.json({ school });
    } catch (error) {
      if (error instanceof ResearchInputError) {
        return apiError(ROUTE, { request, status: 400, error: error.message, code: "invalid_body" });
      }
      throw error;
    }
  });
}
