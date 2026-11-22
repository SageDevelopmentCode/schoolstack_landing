import { NextResponse } from "next/server";
import { readJsonBody, withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { createResearchSchool, parseNewSchool, ResearchInputError } from "@/lib/admin-crm/research-workspace";
import { apiError } from "@/lib/api/route-errors";

const ROUTE = "/api/admin/research/schools";

/** Adds a school to the CRM by hand. */
export async function POST(request: Request) {
  return withDemoOutreachAdmin(ROUTE, request, "Failed to add the school.", async ({ admin }) => {
    const body = await readJsonBody(request);
    if (!body) return apiError(ROUTE, { request, status: 400, error: "Invalid JSON body.", code: "invalid_body" });
    try {
      const school = await createResearchSchool(admin, parseNewSchool(body));
      return NextResponse.json({ school }, { status: 201 });
    } catch (error) {
      if (error instanceof ResearchInputError) {
        return apiError(ROUTE, { request, status: 400, error: error.message, code: "invalid_body" });
      }
      throw error;
    }
  });
}
