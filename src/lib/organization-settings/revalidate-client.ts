/**
 * Browser editors write settings straight to Supabase, so they cannot expire the server cache.
 * Ask the server to do it. Fire and forget: the 60s TTL covers a failed call.
 */
export function revalidateOrganizationSettingsFromBrowser(
  organizationId: string,
): void {
  if (!organizationId) return;
  void fetch("/api/school-admin/revalidate-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId }),
  }).catch(() => {
    // ignore; cache expires on its own
  });
}
