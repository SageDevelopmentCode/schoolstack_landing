import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getProfile } from "@/lib/auth";
import { fetchZohoMessageContent, isZohoConfigured } from "@/lib/zoho";

const ROUTE = "/api/zoho/message-content";

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

  const folderId = request.nextUrl.searchParams.get("folderId");
  const messageId = request.nextUrl.searchParams.get("messageId");
  if (!folderId || !messageId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "folderId and messageId query params required",
    });
  }

  try {
    const content = await fetchZohoMessageContent(folderId, messageId);
    return NextResponse.json({ success: true, content });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 502,
      error: "Failed to load email content from Zoho Mail",
      cause: err,
    });
  }
}
