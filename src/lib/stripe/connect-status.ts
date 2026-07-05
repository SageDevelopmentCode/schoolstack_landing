import type { OrganizationPaymentAccount } from "@/lib/stripe/organization-payment-account";
import { isPaymentReady } from "@/lib/stripe/organization-payment-account";
import { publicApplicationFormPath } from "@/lib/admissions/application-forms";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";

export type ConnectStatusChecklist = {
  accountCreated: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

export type ConnectStatusNextStep = {
  label: string;
  href: string;
};

export type ConnectStatusResult = {
  account: OrganizationPaymentAccount | null;
  isReady: boolean;
  checklist: ConnectStatusChecklist;
  pendingMessage: string | null;
  nextSteps: ConnectStatusNextStep[];
};

export function buildConnectStatusChecklist(
  account: OrganizationPaymentAccount | null,
  stripeAccount?: {
    details_submitted?: boolean;
  } | null,
): ConnectStatusChecklist {
  return {
    accountCreated: Boolean(account?.stripeConnectAccountId),
    detailsSubmitted: Boolean(stripeAccount?.details_submitted),
    chargesEnabled: Boolean(account?.chargesEnabled),
    payoutsEnabled: Boolean(account?.payoutsEnabled),
  };
}

export function buildPendingMessage(
  checklist: ConnectStatusChecklist,
): string | null {
  if (!checklist.accountCreated) {
    return null;
  }

  if (!checklist.detailsSubmitted) {
    return "Finish your business and identity details in Stripe to continue setup.";
  }

  if (!checklist.chargesEnabled) {
    return "Stripe is still verifying your account. This can take a few minutes in test mode. Check back shortly or continue in Stripe if prompted for more information.";
  }

  return null;
}

export function buildConnectStatusResult(input: {
  account: OrganizationPaymentAccount | null;
  orgSlug: string;
  publishedFormSlug?: string | null;
  stripeAccount?: {
    details_submitted?: boolean;
  } | null;
}): ConnectStatusResult {
  const checklist = buildConnectStatusChecklist(
    input.account,
    input.stripeAccount,
  );
  const isReady = isPaymentReady(input.account);
  const pendingMessage = isReady ? null : buildPendingMessage(checklist);

  const nextSteps: ConnectStatusNextStep[] = [];

  if (isReady) {
    nextSteps.push({
      label: "Publish your application form",
      href: schoolAdminPath(input.orgSlug, "admissions", "flows"),
    });

    if (input.publishedFormSlug) {
      nextSteps.push({
        label: "Test the apply flow",
        href: publicApplicationFormPath(input.orgSlug, input.publishedFormSlug),
      });
    }

    nextSteps.push({
      label: "Payouts are managed in your school's Stripe Express dashboard",
      href: "https://dashboard.stripe.com/connect/accounts/overview",
    });
  }

  return {
    account: input.account,
    isReady,
    checklist,
    pendingMessage,
    nextSteps,
  };
}
