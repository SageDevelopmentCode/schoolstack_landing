import type { SupabaseClient } from "@supabase/supabase-js";

export type OnboardingStatus = "not_started" | "pending" | "complete";

export type OrganizationPaymentAccount = {
  organizationId: string;
  stripeConnectAccountId: string | null;
  onboardingStatus: OnboardingStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

function rowToAccount(row: Record<string, unknown>): OrganizationPaymentAccount {
  return {
    organizationId: String(row.organization_id),
    stripeConnectAccountId:
      typeof row.stripe_connect_account_id === "string"
        ? row.stripe_connect_account_id
        : null,
    onboardingStatus: row.onboarding_status as OnboardingStatus,
    chargesEnabled: Boolean(row.charges_enabled),
    payoutsEnabled: Boolean(row.payouts_enabled),
  };
}

export async function getOrganizationPaymentAccount(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrganizationPaymentAccount | null> {
  const { data, error } = await supabase
    .from("organization_payment_accounts")
    .select(
      "organization_id, stripe_connect_account_id, onboarding_status, charges_enabled, payouts_enabled",
    )
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToAccount(data as Record<string, unknown>);
}

export async function upsertOrganizationPaymentAccount(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    stripeConnectAccountId?: string;
    onboardingStatus?: OnboardingStatus;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  },
): Promise<OrganizationPaymentAccount> {
  const payload: Record<string, unknown> = {
    organization_id: input.organizationId,
  };

  if (input.stripeConnectAccountId !== undefined) {
    payload.stripe_connect_account_id = input.stripeConnectAccountId;
  }
  if (input.onboardingStatus !== undefined) {
    payload.onboarding_status = input.onboardingStatus;
  }
  if (input.chargesEnabled !== undefined) {
    payload.charges_enabled = input.chargesEnabled;
  }
  if (input.payoutsEnabled !== undefined) {
    payload.payouts_enabled = input.payoutsEnabled;
  }

  const { data, error } = await supabase
    .from("organization_payment_accounts")
    .upsert(payload, { onConflict: "organization_id" })
    .select(
      "organization_id, stripe_connect_account_id, onboarding_status, charges_enabled, payouts_enabled",
    )
    .single();

  if (error) throw error;
  return rowToAccount(data as Record<string, unknown>);
}

export async function syncPaymentAccountFromStripe(
  supabase: SupabaseClient,
  stripeAccountId: string,
  account: {
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
    details_submitted?: boolean;
  },
): Promise<void> {
  const chargesEnabled = Boolean(account.charges_enabled);
  const payoutsEnabled = Boolean(account.payouts_enabled);
  const onboardingStatus: OnboardingStatus =
    chargesEnabled && account.details_submitted ? "complete" : "pending";

  const { error } = await supabase
    .from("organization_payment_accounts")
    .update({
      charges_enabled: chargesEnabled,
      payouts_enabled: payoutsEnabled,
      onboarding_status: onboardingStatus,
    })
    .eq("stripe_connect_account_id", stripeAccountId);

  if (error) throw error;
}

export function isPaymentReady(account: OrganizationPaymentAccount | null): boolean {
  return Boolean(account?.stripeConnectAccountId && account.chargesEnabled);
}

export async function getOrganizationPaymentAccountForClient(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrganizationPaymentAccount | null> {
  return getOrganizationPaymentAccount(supabase, organizationId);
}

export async function orgPaymentsReadyForFees(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<boolean> {
  const account = await getOrganizationPaymentAccount(supabase, organizationId);
  return isPaymentReady(account);
}
