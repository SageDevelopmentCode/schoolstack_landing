import type { OrganizationFridayBranchSettings } from "./friday-branch-org-settings";

export async function fetchFridayBranchSettings(
  organizationId: string,
): Promise<OrganizationFridayBranchSettings> {
  const response = await fetch(
    `/api/school-admin/friday-branch/settings?organizationId=${encodeURIComponent(organizationId)}`,
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to load Friday Branch settings.");
  }

  const payload = (await response.json()) as {
    settings: OrganizationFridayBranchSettings;
  };
  return payload.settings;
}

export async function patchFridayBranchSettings(
  organizationId: string,
  settings: OrganizationFridayBranchSettings,
): Promise<OrganizationFridayBranchSettings> {
  const response = await fetch("/api/school-admin/friday-branch/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, settings }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to save Friday Branch settings.");
  }

  const payload = (await response.json()) as {
    settings: OrganizationFridayBranchSettings;
  };
  return payload.settings;
}
