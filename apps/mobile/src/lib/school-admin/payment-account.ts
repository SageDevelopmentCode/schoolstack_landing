import type { SupabaseClient } from '@supabase/supabase-js';

export type OnboardingStatus = 'not_started' | 'pending' | 'complete';

export type OrganizationPaymentAccount = {
  organizationId: string;
  stripeConnectAccountId: string | null;
  onboardingStatus: OnboardingStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

export function isPaymentReady(account: OrganizationPaymentAccount | null): boolean {
  if (!account?.stripeConnectAccountId) return false;
  return account.chargesEnabled && account.payoutsEnabled;
}

export async function getOrganizationPaymentAccount(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrganizationPaymentAccount | null> {
  const { data, error } = await supabase
    .from('organization_payment_accounts')
    .select(
      'organization_id, stripe_connect_account_id, onboarding_status, charges_enabled, payouts_enabled',
    )
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    organizationId: String(data.organization_id),
    stripeConnectAccountId:
      typeof data.stripe_connect_account_id === 'string'
        ? data.stripe_connect_account_id
        : null,
    onboardingStatus: data.onboarding_status as OnboardingStatus,
    chargesEnabled: Boolean(data.charges_enabled),
    payoutsEnabled: Boolean(data.payouts_enabled),
  };
}
