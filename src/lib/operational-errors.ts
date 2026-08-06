import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { stackFromCause } from "@/lib/api/error-serialization";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
  type ActivitySurface,
  type ActorType,
} from "@/lib/activity-log";
import {
  notifySchoolAdminOperationError,
  notifyWebsiteApiError,
} from "@/lib/discord";

export type OperationalErrorActor = {
  type: ActorType;
  userId?: string | null;
  email?: string | null;
};

export type ReportOperationalErrorInput = {
  supabase: SupabaseClient;
  surface: ActivitySurface;
  action?: string;
  organizationId?: string | null;
  organizationName?: string | null;
  organizationSlug?: string | null;
  operation: string;
  error: string;
  code?: string | null;
  details?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  notify?: boolean;
  actor: OperationalErrorActor;
  cause?: unknown;
  /** API route context — when set, uses notifyWebsiteApiError instead of school-admin Discord */
  api?: {
    route: string;
    method: string;
    status: number;
    stack?: string;
    digest?: string;
  };
};

export async function reportOperationalError(
  input: ReportOperationalErrorInput,
): Promise<void> {
  const {
    supabase,
    surface,
    organizationId,
    organizationName,
    organizationSlug,
    operation,
    error,
    code,
    details,
    entityType,
    entityId,
    metadata,
    notify = true,
    actor,
    cause,
    api,
  } = input;

  const action =
    input.action ??
    (surface === "api"
      ? ACTIVITY_ACTIONS.API_ERROR
      : ACTIVITY_ACTIONS.ADMIN_OPERATION_FAILED);

  const causeMessage = stackFromCause(cause);
  const stack =
    api?.stack && typeof api.stack === "string"
      ? api.stack
      : causeMessage;

  const summary = api
    ? `${api.method} ${api.route} returned ${api.status}: ${error}`
    : `${operation} failed: ${error}`;

  await logActivityEvent(supabase, {
    organizationId,
    actorType: actor.type,
    actorUserId: actor.userId,
    actorEmail: actor.email,
    surface,
    action,
    entityType,
    entityId,
    summary,
    severity: "error",
    metadata: {
      operation,
      error,
      code: code ?? null,
      details: details ?? null,
      ...(stack ? { stack } : {}),
      ...(api
        ? {
            route: api.route,
            method: api.method,
            status: api.status,
          }
        : {}),
      ...(metadata ?? {}),
    },
  });

  if (notify) {
    if (api) {
      await notifyWebsiteApiError({
        route: api.route,
        method: api.method,
        status: api.status,
        error,
        code: code ?? undefined,
        stack: api.stack ?? stackFromCause(cause),
        digest: api.digest,
      });
    } else {
      await notifySchoolAdminOperationError({
        operation,
        error,
        organizationId: organizationId ?? undefined,
        organizationName: organizationName ?? undefined,
        organizationSlug: organizationSlug ?? undefined,
        actorEmail: actor.email ?? undefined,
        code: code ?? undefined,
        details: details ?? undefined,
        entityType: entityType ?? undefined,
        entityId: entityId ?? undefined,
      });
    }
  }

  Sentry.captureException(
    cause instanceof Error ? cause : new Error(error),
    {
      tags: {
        surface,
        operation,
        ...(api ? { route: api.route, status: String(api.status) } : {}),
      },
      extra: {
        code,
        details,
        organizationId,
        entityType,
        entityId,
      },
    },
  );
}
