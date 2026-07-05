import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getProfile } from "@/lib/auth";
import { fetchSentEmails, isZohoConfigured } from "@/lib/zoho";

const ROUTE = "/api/zoho/emails";

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return apiError(ROUTE, { request, status: 401, error: "Unauthorized" });
  }

  if (!(await isZohoConfigured())) {
    return apiError(ROUTE, {
      request,
      status: 503,
      error: "Not configured",
      notify: true,
    });
  }

  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);
  const data = await fetchSentEmails(limit);

  return NextResponse.json({ success: true, count: data.length, data });
}
