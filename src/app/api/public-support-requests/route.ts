import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { apiError } from "@/lib/api/route-errors";
import { notifyPublicSupportRequest } from "@/lib/discord";
import { sendPublicSupportRequestConfirmation } from "@/lib/emails";
import { validatePublicSupportRequestBody } from "@/lib/public-support/public-support-validation";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/public-support-requests";
const DEFAULT_SOURCE_PAGE_PATH = "/support";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const validation = validatePublicSupportRequestBody(body);
  if (!validation.ok) {
    return apiError(ROUTE, { request, status: 400, error: validation.error });
  }

  const { name, email, topic, message, sourcePagePath } = validation.value;
  const resolvedSourcePagePath = sourcePagePath ?? DEFAULT_SOURCE_PAGE_PATH;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("public_support_requests")
    .insert({
      submitter_name: name,
      submitter_email: email,
      topic,
      description: message,
      source_page_path: resolvedSourcePagePath,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "An unexpected error occurred.",
      cause: error,
    });
  }

  const admin = createAdminClient();
  const requestId = data.id;

  try {
    await notifyPublicSupportRequest({
      requestId,
      submitterName: name,
      submitterEmail: email,
      topic,
      description: message,
      sourcePagePath: resolvedSourcePagePath,
    });
  } catch (err) {
    void logNotificationFailure(admin, {
      operation: "public_support_request_discord",
      error: err,
      metadata: { email, requestId },
    });
  }

  try {
    await sendPublicSupportRequestConfirmation({ name, email });
  } catch (err) {
    void logNotificationFailure(admin, {
      operation: "public_support_request_confirmation_email",
      error: err,
      metadata: { email, requestId },
    });
  }

  return NextResponse.json({ ok: true, id: requestId });
}
