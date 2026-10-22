import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type PortalSignInDiscordActorType,
  type PortalSignInDiscordSurface,
} from "@/lib/discord";
import { isPlatformAdmin } from "@/lib/school-admin/access";

export type InferredPortalSignInDiscord = {
  surface: PortalSignInDiscordSurface;
  actorType: PortalSignInDiscordActorType;
};

export function inferPortalSignInDiscordFromLoginHref(
  href: string,
  slug: string,
): InferredPortalSignInDiscord {
  const normalizedHref = href.trim();
  const adminPrefix = `/school/${slug}/admin`;

  if (
    normalizedHref === adminPrefix ||
    normalizedHref.startsWith(`${adminPrefix}/`)
  ) {
    return { surface: "school_admin", actorType: "school_admin" };
  }

  if (normalizedHref.includes("/teacher")) {
    return { surface: "teacher_portal", actorType: "teacher" };
  }

  return { surface: "parent_portal", actorType: "parent" };
}

export async function resolvePortalSignInDiscordActorType(
  supabase: SupabaseClient,
  userId: string,
  surface: PortalSignInDiscordSurface,
  defaultActorType: PortalSignInDiscordActorType,
): Promise<PortalSignInDiscordActorType> {
  if (surface === "platform_admin") {
    return "platform_admin";
  }

  if (surface === "school_admin" && (await isPlatformAdmin(supabase, userId))) {
    return "platform_admin";
  }

  return defaultActorType;
}

export async function loadOrganizationName(
  admin: SupabaseClient,
  organizationId: string,
): Promise<string | undefined> {
  const { data: organization } = await admin
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .maybeSingle();

  const name = organization?.name;
  return name ? String(name) : undefined;
}
