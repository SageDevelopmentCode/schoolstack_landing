import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";
import { organizationSettingsTag } from "./cache-tags";

/**
 * Expire the cached organization + settings read after a save so the next request sees the
 * change. Safe to call anywhere on the server; outside a Next request (scripts, unit tests) there
 * is nothing to purge and the 60s TTL covers any other process.
 */
export function revalidateOrganizationSettings(
  slug: string | null | undefined,
): void {
  const trimmed = slug?.trim();
  if (!trimmed) return;
  try {
    revalidateTag(organizationSettingsTag(trimmed), { expire: 0 });
  } catch {
    // No Next request/cache context available; the TTL is the backstop.
  }
}

/** Same as `revalidateOrganizationSettings`, for save paths that only know the organization id. */
export async function revalidateOrganizationSettingsById(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<void> {
  try {
    const { data } = await supabase
      .from("organizations")
      .select("slug")
      .eq("id", organizationId)
      .maybeSingle();
    revalidateOrganizationSettings((data as { slug?: string } | null)?.slug);
  } catch {
    // The TTL is the backstop; a failed lookup must never fail the save.
  }
}
