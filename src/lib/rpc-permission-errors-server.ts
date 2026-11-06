import { reportOperationalError } from "@/lib/operational-errors";
import { parseOperationalError } from "@/lib/operational-errors-client";
import type { RpcPermissionDeniedInput } from "@/lib/rpc-permission-errors";
import { createAdminClient } from "@/utils/supabase/admin";

/** Server half of `reportRpcPermissionDenied` (activity_events + Discord + Sentry). */
export async function reportRpcPermissionDeniedServer(
  input: RpcPermissionDeniedInput,
): Promise<void> {
  const admin = createAdminClient();
  const parsed = parseOperationalError(input.error);

  let organizationName: string | null = null;
  let organizationSlug: string | null = null;
  if (input.organizationId) {
    const { data } = await admin
      .from("organizations")
      .select("name, slug")
      .eq("id", input.organizationId)
      .maybeSingle();
    organizationName = (data?.name as string | undefined) ?? null;
    organizationSlug = (data?.slug as string | undefined) ?? null;
  }

  await reportOperationalError({
    supabase: admin,
    surface: input.surface,
    organizationId: input.organizationId ?? null,
    organizationName,
    organizationSlug,
    operation: `rpc_permission_denied:${input.functionName}`,
    error: `Caller was denied access to ${input.functionName}: ${parsed.message}`,
    code: parsed.code ?? null,
    details: parsed.details ?? null,
    entityType: "rpc",
    entityId: input.functionName,
    notify: true,
    actor: {
      type: input.surface === "parent_portal" ? "parent" : "school_admin",
      userId: input.actorUserId ?? null,
    },
    cause: input.error,
  });
}
