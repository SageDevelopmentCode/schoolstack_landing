import type { SupabaseClient, User } from "@supabase/supabase-js";
import { apiError } from "@/lib/api/route-errors";
import { mergeFeatures } from "@/lib/organization-settings/merge";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import {
  resolveMainParentOrganizationFeatures,
  resolveProgramOrganizationFeatures,
} from "@/lib/organization-settings/resolve-program-parent-features";
import type { OrganizationFeatures, ParentFeatures } from "@/lib/organization-settings/types";
import {
  fetchParentPortalAccess,
  parentPortalAccessAllowsOptionalProgramScope,
  parentPortalAccessHasProgram,
  type ParentPortalAccess,
} from "@/lib/parent-portal/parent-portal-access-rpc";
import {
  createClientFromRequest,
  getUserFromRequestClaims,
  signedInErrorForRequest,
} from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Shared auth + access guard for `/api/parent-portal/*` routes (Phase 3 of
 * docs/parent-portal-audit.md).
 *
 * Order: bearer-aware client + user (401) -> organizationId (400) -> one `parent_portal_access`
 * RPC and the route's access rule (403) -> optional feature toggle (403 `feature_disabled`) ->
 * handler. The handler receives everything the old boilerplate computed, so routes stop re-running
 * `userHasEnrolledAccess` / `getFamilyIdsForUser` queries.
 */

/** "none" = any enrolled child; "optional" = programId when given, else a main-portal enrollment. */
export type ParentPortalProgramScope = "none" | "optional" | "required";

export type ParentPortalOrganizationSource = "query" | "body";

export type ParentPortalRouteOptions<TBody> = {
  /** Route label used for `apiError` reporting, e.g. "/api/parent-portal/billing". */
  route: string;
  /**
   * Where `organizationId` (and `programId` / `familyId`) are read from. Default "query". "body"
   * reads JSON, or multipart form fields when the request is `multipart/form-data` (the parsed
   * form is then available as `ctx.formData` for file access).
   */
  organizationFrom?: ParentPortalOrganizationSource;
  /**
   * Custom organization lookup for routes whose handler must read the request body itself (for
   * example multipart posts). Receives a clone of the request so the handler can still read it;
   * `programId` / `familyId` are then read from the query string.
   */
  resolveOrganizationId?: (request: Request) => Promise<string> | string;
  /** Default "none". */
  programScope?: ParentPortalProgramScope;
  /**
   * Default true. Set false for routes that must answer for any signed-in user (for example a
   * badge count that returns 0 without enrollment): the access snapshot is still loaded and
   * passed to the handler, but a parent without enrolled access is not rejected.
   */
  enforceAccess?: boolean;
  /**
   * Require a `familyId` (same source as the organization) that belongs to the signed-in parent's
   * linked families. The validated id is passed to the handler as `familyId`.
   */
  requireFamily?: boolean;
  /** Parent feature toggle that must be on for this school (and program, when scoped). */
  feature?: keyof ParentFeatures;
  /** Message for the 403 when the parent has no access. */
  forbiddenMessage?: string;
  /** Message for the 400 when organizationId is missing. */
  missingOrganizationMessage?: string;
  /** Message for the 400 when programScope is "required" and programId is missing. */
  missingProgramMessage?: string;
  /** Validates the JSON body (organizationFrom "body"); return null to answer 400. */
  parseBody?: (raw: unknown) => TBody | null;
  invalidBodyMessage?: string;
  /** Message for the generic 500 when the handler throws without handling its own error. */
  fallbackErrorMessage?: string;
};

export type ParentPortalRouteContext<TBody, TParams> = {
  request: Request;
  supabase: SupabaseClient;
  user: User;
  organizationId: string;
  programId: string | null;
  access: ParentPortalAccess;
  familyIds: string[];
  /** Validated family when `requireFamily`, otherwise the primary family (or null). */
  familyId: string | null;
  body: TBody;
  /** Parsed multipart form (organizationFrom "body" with a multipart request), else null. */
  formData: FormData | null;
  params: TParams;
};

type RouteSegmentContext<TParams> = { params: Promise<TParams> };

export type ParentPortalRouteDeps = {
  createClient: (request: Request) => Promise<SupabaseClient>;
  getUser: (
    supabase: SupabaseClient,
    request: Request,
  ) => Promise<{ data: { user: User | null }; error: { message: string } | null }>;
  signedInError: (request: Request, authError: { message: string } | null) => Promise<string>;
  fetchAccess: (
    supabase: SupabaseClient,
    organizationId: string,
    userId: string,
  ) => Promise<ParentPortalAccess>;
  loadOrganizationFeatures: (organizationId: string) => Promise<OrganizationFeatures>;
};

async function defaultLoadOrganizationFeatures(
  organizationId: string,
): Promise<OrganizationFeatures> {
  const { data, error } = await createAdminClient()
    .from("organization_settings")
    .select("features")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw error;
  return mergeFeatures(data?.features as Record<string, unknown> | null | undefined);
}

const defaultDeps: ParentPortalRouteDeps = {
  createClient: createClientFromRequest,
  getUser: getUserFromRequestClaims as ParentPortalRouteDeps["getUser"],
  signedInError: (request, authError) =>
    signedInErrorForRequest(request, authError as never),
  fetchAccess: fetchParentPortalAccess,
  loadOrganizationFeatures: defaultLoadOrganizationFeatures,
};

function readString(source: URLSearchParams | Record<string, unknown> | null, key: string): string {
  if (!source) return "";
  if (source instanceof URLSearchParams) return source.get(key)?.trim() ?? "";
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

export function createWithParentPortalRoute(deps: ParentPortalRouteDeps) {
  return function withParentPortalRoute<TBody = undefined, TParams = Record<string, never>>(
    options: ParentPortalRouteOptions<TBody>,
    handler: (ctx: ParentPortalRouteContext<TBody, TParams>) => Promise<Response>,
  ): (request: Request, segment?: RouteSegmentContext<TParams>) => Promise<Response> {
    const route = options.route;
    const scope = options.programScope ?? "none";
    const source = options.organizationFrom ?? "query";
    const forbiddenMessage =
      options.forbiddenMessage ?? "You do not have access to the parent portal.";

    return async function parentPortalRoute(request, segment) {
      const supabase = await deps.createClient(request);
      const {
        data: { user },
        error: authError,
      } = await deps.getUser(supabase, request);

      if (!user) {
        return apiError(route, {
          request,
          status: 401,
          error: await deps.signedInError(request, authError),
          code: "unauthorized",
        });
      }

      let rawBody: unknown = undefined;
      let formData: FormData | null = null;
      let fields: URLSearchParams | Record<string, unknown> | null;
      if (options.resolveOrganizationId) {
        fields = new URL(request.url).searchParams;
      } else if (source === "body") {
        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("multipart/form-data")) {
          formData = await request.formData().catch(() => null);
          if (!formData) {
            return apiError(route, {
              request,
              status: 400,
              error: options.invalidBodyMessage ?? "Invalid request body.",
              code: "invalid_form",
            });
          }
          const entries: Record<string, unknown> = {};
          for (const [key, value] of formData.entries()) {
            if (typeof value === "string") entries[key] = value;
          }
          rawBody = entries;
        } else {
          rawBody = await request.json().catch(() => null);
        }
        if (rawBody === null || typeof rawBody !== "object" || Array.isArray(rawBody)) {
          return apiError(route, {
            request,
            status: 400,
            error: options.invalidBodyMessage ?? "Invalid request body.",
            code: "invalid_json",
          });
        }
        fields = rawBody as Record<string, unknown>;
      } else {
        fields = new URL(request.url).searchParams;
      }

      const organizationId = options.resolveOrganizationId
        ? (await options.resolveOrganizationId(request.clone())).trim()
        : readString(fields, "organizationId");
      if (!organizationId) {
        return apiError(route, {
          request,
          status: 400,
          error: options.missingOrganizationMessage ?? "organizationId is required.",
          code: "missing_fields",
        });
      }

      const programId = readString(fields, "programId") || null;
      if (scope === "required" && !programId) {
        return apiError(route, {
          request,
          status: 400,
          error: options.missingProgramMessage ?? "organizationId and programId are required.",
          code: "missing_fields",
        });
      }

      const requestedFamilyId = options.requireFamily ? readString(fields, "familyId") : "";
      if (options.requireFamily && !requestedFamilyId) {
        return apiError(route, {
          request,
          status: 400,
          error: "organizationId and familyId are required.",
          code: "missing_fields",
        });
      }

      let body = undefined as TBody;
      if (options.parseBody) {
        const parsed = options.parseBody(rawBody);
        if (parsed === null) {
          return apiError(route, {
            request,
            status: 400,
            error: options.invalidBodyMessage ?? "Invalid request body.",
            code: "invalid_body",
          });
        }
        body = parsed;
      } else {
        body = rawBody as TBody;
      }

      try {
        const access = await deps.fetchAccess(supabase, organizationId, user.id);

        let allowed: boolean;
        if (scope === "required") {
          allowed = parentPortalAccessHasProgram(access, programId ?? "");
        } else if (scope === "optional") {
          allowed = parentPortalAccessAllowsOptionalProgramScope(access, programId);
        } else {
          allowed = access.hasEnrolledAccess;
        }
        if (!allowed && options.enforceAccess !== false) {
          return apiError(route, {
            request,
            status: 403,
            error: forbiddenMessage,
            code: "forbidden",
          });
        }

        let familyId: string | null = access.familyIds[0] ?? null;
        if (options.requireFamily) {
          if (!access.familyIds.includes(requestedFamilyId)) {
            return apiError(route, {
              request,
              status: 403,
              error: "You do not have access to this family.",
              code: "forbidden",
            });
          }
          familyId = requestedFamilyId;
        }

        if (options.feature) {
          const orgFeatures = await deps.loadOrganizationFeatures(organizationId);
          const program = programId
            ? access.enrolledPrograms.find((candidate) => candidate.id === programId)
            : null;
          const effective = program
            ? resolveProgramOrganizationFeatures(orgFeatures, program.parent_portal_settings)
            : resolveMainParentOrganizationFeatures(orgFeatures);
          if (!isParentFeatureEnabled(effective, options.feature)) {
            return apiError(route, {
              request,
              status: 403,
              error: "This feature is not available for this school.",
              code: "feature_disabled",
            });
          }
        }

        const params = (segment ? await segment.params : {}) as TParams;
        return await handler({
          request,
          supabase,
          user,
          organizationId,
          programId,
          access,
          familyIds: access.familyIds,
          familyId,
          body,
          formData,
          params,
        });
      } catch (err) {
        return apiError(route, {
          request,
          status: 500,
          error: options.fallbackErrorMessage ?? "Something went wrong. Please try again.",
          cause: err,
          code: "internal_error",
        });
      }
    };
  };
}

export const withParentPortalRoute = createWithParentPortalRoute(defaultDeps);
