import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import { reportOperationalError } from "@/lib/operational-errors";
import { revalidateOrganizationSettings } from "@/lib/organization-settings/revalidate";
import {
  authUserIdFromAdminList,
  emailDomain,
  FREE_SCHOOL_PLAN,
  normalizeSchoolName,
  signupImpersonationMessage,
  type ExistingSchoolIdentity,
} from "@/lib/try/free-school-signup";
import type { SupabaseClient } from "@supabase/supabase-js";

const DOMAIN_HOURLY_CAP = 10;

type FreeSchoolAtomicFailureReason =
  | "already_administers"
  | "slug_exhausted"
  | "invalid_name"
  | "invalid_timezone"
  | "invalid_user"
  | "organization_insert_failed";

const FREE_SCHOOL_ATOMIC_FAILURES: readonly FreeSchoolAtomicFailureReason[] = [
  "already_administers",
  "slug_exhausted",
  "invalid_name",
  "invalid_timezone",
  "invalid_user",
  "organization_insert_failed",
];

type CreateFreeSchoolAtomicResult = {
  organization_id: string;
  slug: string;
  idempotent: boolean;
};

function parseFreeSchoolAtomicFailure(
  message: string | null | undefined,
): FreeSchoolAtomicFailureReason | null {
  if (!message) return null;
  return (
    FREE_SCHOOL_ATOMIC_FAILURES.find((reason) => message === `free_school:${reason}`) ?? null
  );
}

function freeSchoolSignupErrorForAtomicReason(
  reason: FreeSchoolAtomicFailureReason,
): FreeSchoolSignupError {
  switch (reason) {
    case "already_administers":
      return new FreeSchoolSignupError(
        EXISTING_SCHOOL_ADMIN_MESSAGE,
        409,
        "already_administers_school",
      );
    case "slug_exhausted":
      return new FreeSchoolSignupError(
        "That school name is already in use. Try a different name.",
        409,
        "slug_exhausted",
      );
    case "invalid_name":
      return new FreeSchoolSignupError("Enter your school name.", 400, "missing_school_name");
    case "invalid_timezone":
      return new FreeSchoolSignupError(
        "We couldn't read your timezone. Refresh and try again.",
        400,
        "invalid_timezone",
      );
    case "invalid_user":
      return new FreeSchoolSignupError(
        "Confirm your email with the code we sent, then try again.",
        401,
        "email_unverified",
      );
    case "organization_insert_failed":
      return new FreeSchoolSignupError(
        "Could not create your school. Please try again.",
        500,
        "organization_insert_failed",
      );
    default: {
      const exhaustive: never = reason;
      return exhaustive;
    }
  }
}

export const EXISTING_SCHOOL_ADMIN_MESSAGE =
  "This email already manages a school. Sign in instead.";

export class FreeSchoolSignupError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "FreeSchoolSignupError";
    this.status = status;
    this.code = code;
  }
}

export async function listSchoolIdentities(
  admin: SupabaseClient,
): Promise<ExistingSchoolIdentity[]> {
  const { data, error } = await admin
    .from("organizations")
    .select("name, slug")
    .neq("status", "churned")
    .limit(500);

  if (error) {
    throw new FreeSchoolSignupError(
      "Unable to check that school name right now.",
      500,
      "school_lookup_failed",
    );
  }

  return (data ?? []).map((row) => ({
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
  }));
}

export async function emailDomainHourlyCount(
  admin: SupabaseClient,
  form: string,
  email: string,
): Promise<number> {
  const domain = emailDomain(email);
  if (!domain) return 0;

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await admin
    .from("public_form_submission_events")
    .select("id", { count: "exact", head: true })
    .eq("form", form)
    .gte("created_at", since)
    .like("email", `%@${domain}`);

  if (error) {
    throw new FreeSchoolSignupError(
      "Unable to process your signup right now. Please try again later.",
      500,
      "rate_limit_unavailable",
    );
  }

  return count ?? 0;
}

export function domainRateLimitMessage(count: number): string | null {
  if (count < DOMAIN_HOURLY_CAP) return null;
  return "Too many signups from this email domain. Please try again later.";
}

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new FreeSchoolSignupError(
      "Unable to check that email right now.",
      500,
      "admin_lookup_failed",
    );
  }

  const url = new URL("/auth/v1/admin/users", supabaseUrl);
  url.searchParams.set("filter", email);
  url.searchParams.set("per_page", "200");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
  });

  if (!response.ok) {
    throw new FreeSchoolSignupError(
      "Unable to check that email right now.",
      500,
      "admin_lookup_failed",
    );
  }

  return authUserIdFromAdminList(await response.json(), email);
}

/** Parents and teachers may start a free school. An owner or admin may not. */
export async function assertMayStartFreeSchool(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data, error } = await admin
    .from("organization_memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .in("role", ["owner", "admin"])
    .limit(1);

  if (error) {
    throw new FreeSchoolSignupError(
      "Unable to check that email right now.",
      500,
      "admin_lookup_failed",
    );
  }

  if ((data ?? []).length > 0) {
    throw new FreeSchoolSignupError(
      EXISTING_SCHOOL_ADMIN_MESSAGE,
      409,
      "already_administers_school",
    );
  }
}

export async function assertEmailMayStartFreeSchool(
  admin: SupabaseClient,
  email: string,
): Promise<void> {
  const userId = await findAuthUserIdByEmail(email);
  if (!userId) return;
  await assertMayStartFreeSchool(admin, userId);
}

export async function createFreeSchool(
  admin: SupabaseClient,
  input: {
    schoolName: string;
    timezone: string;
    userId: string;
    email: string;
  },
): Promise<{ organizationId: string; slug: string }> {
  const schoolName = normalizeSchoolName(input.schoolName);
  const existing = await listSchoolIdentities(admin);
  const blocked = signupImpersonationMessage(schoolName, existing);
  if (blocked) {
    throw new FreeSchoolSignupError(blocked, 409, "name_taken");
  }

  const { data, error: rpcError } = await admin.rpc("create_free_school_atomic", {
    p_user_id: input.userId,
    p_school_name: schoolName,
    p_timezone: input.timezone,
  });

  if (rpcError) {
    const reason = parseFreeSchoolAtomicFailure(rpcError.message);
    if (reason) throw freeSchoolSignupErrorForAtomicReason(reason);
    throw new FreeSchoolSignupError(
      "Could not create your school. Please try again.",
      500,
      "organization_insert_failed",
    );
  }

  const created = data as CreateFreeSchoolAtomicResult | null;
  const organizationId = created?.organization_id?.trim();
  const slug = created?.slug?.trim();
  const idempotent = created?.idempotent === true;

  if (!organizationId || !slug) {
    throw new FreeSchoolSignupError(
      "Could not create your school. Please try again.",
      500,
      "organization_insert_failed",
    );
  }

  revalidateOrganizationSettings(slug);

  if (!idempotent) {
    await logActivityEvent(admin, {
      organizationId,
      actorType: "school_admin",
      actorUserId: input.userId,
      actorEmail: input.email,
      surface: "api",
      action: ACTIVITY_ACTIONS.ORGANIZATION_FREE_CREATED,
      entityType: "organization",
      entityId: organizationId,
      summary: `Free school created: ${schoolName}`,
      metadata: {
        plan: FREE_SCHOOL_PLAN,
        slug,
        timezone: input.timezone,
      },
    });
  }

  return { organizationId, slug };
}

export async function reportFreeSchoolSignupFailure(opts: {
  admin: SupabaseClient;
  route: string;
  request: Request;
  error: unknown;
  email?: string | null;
  schoolName?: string | null;
}): Promise<void> {
  await reportOperationalError({
    supabase: opts.admin,
    surface: "api",
    operation: "free_school_signup",
    error:
      opts.error instanceof Error
        ? opts.error.message
        : "Free school signup failed.",
    code: opts.error instanceof FreeSchoolSignupError ? opts.error.code : "signup_failed",
    actor: { type: "system", email: opts.email ?? null },
    cause: opts.error,
    metadata: {
      plan: FREE_SCHOOL_PLAN,
      schoolName: opts.schoolName ?? null,
    },
    api: {
      route: opts.route,
      method: opts.request.method,
      status: opts.error instanceof FreeSchoolSignupError ? opts.error.status : 500,
    },
  });
}
