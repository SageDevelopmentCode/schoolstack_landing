import type { SupabaseClient } from "@supabase/supabase-js";
import { listOrganizationMemberships } from "@/lib/admin/organization-memberships";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { sendStripePaymentsReadyNotification } from "@/lib/emails";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { SITE_URL } from "@/lib/site";

async function hasPaymentsReadyNotification(
  admin: SupabaseClient,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("activity_events")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("action", ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function notifyPaymentsReadyIfNeeded(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    stripeConnectAccountId: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  },
): Promise<void> {
  if (!input.chargesEnabled) {
    return;
  }

  const alreadyNotified = await hasPaymentsReadyNotification(
    admin,
    input.organizationId,
  );
  if (alreadyNotified) {
    return;
  }

  await logActivityEvent(admin, {
    organizationId: input.organizationId,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED,
    entityType: "organization_payment_account",
    summary: "Stripe Connect account is ready to accept payments",
    metadata: {
      stripeConnectAccountId: input.stripeConnectAccountId,
      chargesEnabled: input.chargesEnabled,
      payoutsEnabled: input.payoutsEnabled,
    },
  });

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("name, slug")
    .eq("id", input.organizationId)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org?.slug) {
    console.warn(
      "Payments ready notification: organization not found",
      input.organizationId,
    );
    return;
  }

  const schoolName = String(org.name);
  const schoolSlug = String(org.slug);
  const paymentsAdminUrl = `${SITE_URL}${schoolAdminPath(schoolSlug, "admissions", "payments")}`;

  const memberships = await listOrganizationMemberships(admin, input.organizationId);
  const notifyEmails = [
    ...new Set(
      memberships
        .filter((membership) => membership.status === "active" && membership.email)
        .map((membership) => membership.email!.trim().toLowerCase()),
    ),
  ];

  if (notifyEmails.length === 0) {
    console.warn(
      "Payments ready notification: no admin emails found",
      input.organizationId,
    );
    return;
  }

  await Promise.allSettled(
    notifyEmails.map((email) =>
      sendStripePaymentsReadyNotification({
        email,
        schoolName,
        paymentsAdminUrl,
      }),
    ),
  );
}
