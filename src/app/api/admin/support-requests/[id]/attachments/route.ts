import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  getSupportRequestFileSignedUrl,
  type SupportRequestAttachmentMeta,
} from "@/lib/school-admin/support-request-storage";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/support-requests/[id]/attachments";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseAttachments(value: unknown): SupportRequestAttachmentMeta[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is SupportRequestAttachmentMeta =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as SupportRequestAttachmentMeta).storagePath === "string" &&
      typeof (item as SupportRequestAttachmentMeta).fileName === "string",
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: requestId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    const admin = createAdminClient();
    const { data: ticket, error } = await admin
      .from("admin_support_requests")
      .select("id, attachments")
      .eq("id", requestId)
      .maybeSingle();

    if (error) {
      return apiError(ROUTE, {
        status: 500,
        error: error.message,
        cause: error,
      });
    }

    if (!ticket) {
      return apiError(ROUTE, {
        status: 404,
        error: "Support request not found.",
        code: "not_found",
      });
    }

    const attachments = parseAttachments(ticket.attachments);
    const signedAttachments = await Promise.all(
      attachments.map(async (attachment) => {
        const url = await getSupportRequestFileSignedUrl(
          admin,
          attachment.storagePath,
        );

        return {
          fileName: attachment.fileName,
          url,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
        };
      }),
    );

    return NextResponse.json({ attachments: signedAttachments });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to load support request attachments.",
      code: "internal_error",
      cause: error,
    });
  }
}
