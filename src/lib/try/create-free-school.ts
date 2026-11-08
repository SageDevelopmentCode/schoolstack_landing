import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import { reportOperationalError } from "@/lib/operational-errors";
import { revalidateOrganizationSettings } from "@/lib/organization-settings/revalidate";
import {
  emailDomain,
  FREE_SCHOOL_PLAN,
  FREE_SCHOOL_STATUS,
  normalizeSchoolName,
  signupImpersonationMessage,
  slugFromSchoolName,
  suffixedSlug,
  type ExistingSchoolIdentity,
} from "@/lib/try/free-school-signup";
import type { SupabaseClient } from "@supabase/supabase-js";

const SLUG_ATTEMPTS = 8;
const DOMAIN_HOURLY_CAP = 10;

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

  const base = slugFromSchoolName(schoolName);
  let organizationId: string | null = null;
  let slug = base;

  for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt += 1) {
    slug = suffixedSlug(base, attempt);
    const { data, error } = await admin
      .from("organizations")
      .insert({
        slug,
        name: schoolName,
        status: FREE_SCHOOL_STATUS,
        timezone: input.timezone,
        plan: FREE_SCHOOL_PLAN,
      })
      .select("id")
      .single();

    if (!error && data?.id) {
      organizationId = String(data.id);
      break;
    }

    if (error && "code" in error && error.code === "23505") {
      continue;
    }

    throw new FreeSchoolSignupError(
      "Could not create your school. Please try again.",
      500,
      "organization_insert_failed",
    );
  }

  if (!organizationId) {
    throw new FreeSchoolSignupError(
      "That school name is already in use. Try a different name.",
      409,
      "slug_exhausted",
    );
  }

  const { error: settingsError } = await admin.from("organization_settings").insert({
    organization_id: organizationId,
    features: {},
  });

  if (settingsError) {
    await admin.from("organizations").delete().eq("id", organizationId);
    throw new FreeSchoolSignupError(
      "Could not create your school. Please try again.",
      500,
      "settings_insert_failed",
    );
  }

  const { error: membershipError } = await admin.from("organization_memberships").insert({
    organization_id: organizationId,
    user_id: input.userId,
    role: "owner",
    status: "active",
  });

  if (membershipError) {
    await admin.from("organizations").delete().eq("id", organizationId);
    throw new FreeSchoolSignupError(
      "Could not create your school. Please try again.",
      500,
      "membership_insert_failed",
    );
  }

  revalidateOrganizationSettings(slug);

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
