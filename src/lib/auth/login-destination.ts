import type { SupabaseClient } from "@supabase/supabase-js";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getParentPortalHomeHref } from "@/lib/organization-settings/parent-nav";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { isPlatformAdmin, userCanAccessSchoolAdmin } from "@/lib/school-admin/access";

export type LoginDestinationResult =
  | { ok: true; href: string }
  | { ok: false; error: "unauthenticated" | "not_found" | "forbidden"; message: string };

export type AuthenticatedLoginResult =
  | LoginDestinationResult
  | { ok: true; needsSchoolSelection: true; accessibleSlugs: string[] };

async function listLiveOrganizationSlugs(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("slug")
    .eq("status", "live")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => String(row.slug));
}

async function listAdminAccessibleLiveSlugs(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  if (await isPlatformAdmin(supabase, userId)) {
    return listLiveOrganizationSlugs(supabase);
  }

  const { data, error } = await supabase
    .from("organization_memberships")
    .select(
      `
      organizations!inner (
        slug,
        status,
        name
      )
    `,
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .in("role", ["owner", "admin"]);

  if (error) throw error;

  const slugs = new Set<string>();

  for (const row of data ?? []) {
    const organization = row.organizations as
      | { slug?: string; status?: string; name?: string }
      | { slug?: string; status?: string; name?: string }[]
      | null;
    const org = Array.isArray(organization) ? organization[0] : organization;

    if (org?.status === "live" && org.slug) {
      slugs.add(String(org.slug));
    }
  }

  return [...slugs].sort((left, right) => left.localeCompare(right));
}

async function listParentAccessibleLiveSlugs(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const slugs = new Set<string>();

  const [guardianResult, membershipResult] = await Promise.all([
    supabase
      .from("guardians")
      .select(
        `
        organizations!inner (
          slug,
          status,
          name
        )
      `,
      )
      .eq("user_id", userId),
    supabase
      .from("organization_memberships")
      .select(
        `
        organizations!inner (
          slug,
          status,
          name
        )
      `,
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("role", "parent"),
  ]);

  if (guardianResult.error) throw guardianResult.error;
  if (membershipResult.error) throw membershipResult.error;

  for (const row of [...(guardianResult.data ?? []), ...(membershipResult.data ?? [])]) {
    const organization = row.organizations as
      | { slug?: string; status?: string; name?: string }
      | { slug?: string; status?: string; name?: string }[]
      | null;
    const org = Array.isArray(organization) ? organization[0] : organization;

    if (org?.status === "live" && org.slug) {
      slugs.add(String(org.slug));
    }
  }

  return [...slugs].sort((left, right) => left.localeCompare(right));
}

export async function listAccessibleLiveOrganizations(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const [adminSlugs, parentSlugs] = await Promise.all([
    listAdminAccessibleLiveSlugs(supabase, userId),
    listParentAccessibleLiveSlugs(supabase, userId),
  ]);

  return [...new Set([...adminSlugs, ...parentSlugs])].sort((left, right) =>
    left.localeCompare(right),
  );
}

async function userHasParentAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const [guardianResult, membershipResult] = await Promise.all([
    supabase
      .from("guardians")
      .select("id")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("organization_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .eq("role", "parent")
      .maybeSingle(),
  ]);

  if (guardianResult.error) throw guardianResult.error;
  if (membershipResult.error) throw membershipResult.error;

  return Boolean(guardianResult.data || membershipResult.data);
}

async function resolveParentLoginDestination(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
  org: NonNullable<Awaited<ReturnType<typeof fetchOrganizationWithSettings>>>,
): Promise<LoginDestinationResult> {
  const [hasEnrolledAccess, portalEnabled] = await Promise.all([
    userHasEnrolledAccess(supabase, userId, org.id),
    Promise.resolve(isParentPortalEnabled(org.features)),
  ]);

  if (hasEnrolledAccess && portalEnabled) {
    const parentHref = getParentPortalHomeHref(
      slug,
      org.features.parent,
      org.features.feature_nav?.parent,
    );

    if (parentHref) {
      return { ok: true, href: parentHref };
    }
  }

  return {
    ok: true,
    href: `/school/${slug}/apply`,
  };
}

export async function resolveLoginDestination(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
): Promise<LoginDestinationResult> {
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return {
      ok: false,
      error: "not_found",
      message: "School not found.",
    };
  }

  if (await userCanAccessSchoolAdmin(supabase, userId, org.id)) {
    return {
      ok: true,
      href: `/school/${slug}/admin`,
    };
  }

  if (await userHasParentAccess(supabase, userId, org.id)) {
    return resolveParentLoginDestination(supabase, userId, slug, org);
  }

  return {
    ok: false,
    error: "forbidden",
    message: "You do not have access to this school.",
  };
}

export async function resolveAuthenticatedLogin(
  supabase: SupabaseClient,
  userId: string,
  slug?: string,
): Promise<AuthenticatedLoginResult> {
  if (slug) {
    return resolveLoginDestination(supabase, userId, slug);
  }

  const accessibleSlugs = await listAccessibleLiveOrganizations(supabase, userId);

  if (accessibleSlugs.length === 1) {
    return resolveLoginDestination(supabase, userId, accessibleSlugs[0]);
  }

  return {
    ok: true,
    needsSchoolSelection: true,
    accessibleSlugs,
  };
}
