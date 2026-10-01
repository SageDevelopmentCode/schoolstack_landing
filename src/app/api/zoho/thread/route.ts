import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getProfile } from "@/lib/auth";
import { fetchEmailThreadPage, isZohoConfigured } from "@/lib/zoho";

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

  const start = parseInt(request.nextUrl.searchParams.get("start") || "1", 10);
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20", 10);
  const includeContent =
    request.nextUrl.searchParams.get("includeContent") === "true";

  try {
    const { messages, hasMore } = await fetchEmailThreadPage(email, {
      start,
      limit,
      includeContent,
    });

    return NextResponse.json({
      success: true,
      email,
      start,
      limit,
      hasMore,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 502,
      error: "Failed to search Zoho Mail for this contact",
      cause: err,
    });
  }
}
