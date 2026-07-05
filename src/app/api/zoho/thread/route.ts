import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getProfile } from "@/lib/auth";
import { fetchEmailThread, isZohoConfigured } from "@/lib/zoho";

const ROUTE = "/api/zoho/thread";

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return apiError(ROUTE, { request, status: 401, error: "Unauthorized" });
  }

  if (!(await isZohoConfigured())) {
    return apiError(ROUTE, {
      request,
      status: 503,
      error: "Zoho Mail API is not configured",
      notify: true,
    });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "email query param required",
    });
  }

  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);
  const data = await fetchEmailThread(email, limit);

  return NextResponse.json({ success: true, email, count: data.length, data });
}
