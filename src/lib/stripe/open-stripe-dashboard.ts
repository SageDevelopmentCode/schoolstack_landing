export async function fetchStripeConnectDashboardUrl(
  organizationId: string,
): Promise<string> {
  const response = await fetch("/api/stripe/connect/dashboard-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId }),
  });
  const payload = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Failed to open Stripe dashboard.");
  }

  return payload.url;
}

export async function openStripeConnectDashboard(
  organizationId: string,
): Promise<void> {
  const url = await fetchStripeConnectDashboardUrl(organizationId);
  window.open(url, "_blank", "noopener,noreferrer");
}
