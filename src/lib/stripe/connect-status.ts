import type { OrganizationPaymentAccount } from "@/lib/stripe/organization-payment-account";
import { isPaymentReady } from "@/lib/stripe/organization-payment-account";
import { canonicalApplyFormPublicPath } from "@/lib/admissions/application-forms";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";

export const STRIPE_DASHBOARD_LINK_SENTINEL = "__stripe_dashboard__";

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
  requirementsDue: string[];
  isTestMode: boolean;
  syncedAt: string;
};

const STRIPE_REQUIREMENT_LABELS: Record<string, string> = {
  "individual.verification.document": "Government-issued ID",
  "individual.verification.additional_document": "Additional identity document",
  "individual.id_number": "Social Security number or tax ID",
  "individual.dob.day": "Date of birth",
  "individual.dob.month": "Date of birth",
  "individual.dob.year": "Date of birth",
  "individual.first_name": "Legal first name",
  "individual.last_name": "Legal last name",
  "individual.email": "Email address",
  "individual.phone": "Phone number",
  "individual.address.line1": "Home address",
  "individual.address.city": "Home address",
  "individual.address.state": "Home address",
  "individual.address.postal_code": "Home address",
  "company.tax_id": "Business tax ID (EIN)",
  "company.verification.document": "Business verification document",
  "company.name": "Business legal name",
  "company.address.line1": "Business address",
  "company.address.city": "Business address",
  "company.address.state": "Business address",
  "company.address.postal_code": "Business address",
  "external_account": "Bank account for payouts",
  "tos_acceptance.date": "Terms of service acceptance",
  "tos_acceptance.ip": "Terms of service acceptance",
  "business_profile.url": "Business website",
  "business_profile.mcc": "Business category",
};

export function formatStripeRequirement(field: string): string {
  const trimmed = field.trim();
  if (!trimmed) {
    return "Additional verification in Stripe";
  }

  if (STRIPE_REQUIREMENT_LABELS[trimmed]) {
    return STRIPE_REQUIREMENT_LABELS[trimmed];
  }

  const suffixMatch = Object.entries(STRIPE_REQUIREMENT_LABELS).find(([key]) =>
    trimmed.endsWith(key),
  );
  if (suffixMatch) {
    return suffixMatch[1];
  }

  return "Additional verification in Stripe";
}

export function extractRequirementsDue(stripeAccount?: {
  requirements?: {
    currently_due?: string[] | null;
    past_due?: string[] | null;
  } | null;
} | null): string[] {
  const fields = [
    ...(stripeAccount?.requirements?.currently_due ?? []),
    ...(stripeAccount?.requirements?.past_due ?? []),
  ];

  const labels = fields.map(formatStripeRequirement);
  return [...new Set(labels)];
}

export function isStripeTestMode(): boolean {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  return secretKey.startsWith("sk_test_");
}

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
  requirementsDue: string[] = [],
): string | null {
  if (!checklist.accountCreated) {
    return null;
  }

  if (!checklist.detailsSubmitted) {
    if (requirementsDue.length > 0) {
      return "Stripe needs a few more details before you can accept payments. Continue in Stripe to complete the items below.";
    }
    return "Finish your business and identity details in Stripe to continue setup.";
  }

  if (!checklist.chargesEnabled) {
    if (requirementsDue.length > 0) {
      return "Stripe needs additional verification before enabling payments. Continue in Stripe to complete the items below.";
    }
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
    requirements?: {
      currently_due?: string[] | null;
      past_due?: string[] | null;
    } | null;
  } | null;
  syncedAt?: string;
  isTestMode?: boolean;
}): ConnectStatusResult {
  const checklist = buildConnectStatusChecklist(
    input.account,
    input.stripeAccount,
  );
  const requirementsDue = extractRequirementsDue(input.stripeAccount);
  const isReady = isPaymentReady(input.account);
  const pendingMessage = isReady
    ? null
    : buildPendingMessage(checklist, requirementsDue);

  const nextSteps: ConnectStatusNextStep[] = [];

  if (isReady) {
    nextSteps.push({
      label: "Open your Stripe dashboard",
      href: STRIPE_DASHBOARD_LINK_SENTINEL,
    });

    nextSteps.push({
      label: "Publish your application form",
      href: schoolAdminPath(input.orgSlug, "admissions", "flows"),
    });

    if (input.publishedFormSlug) {
      nextSteps.push({
        label: "Test the apply flow",
        href: canonicalApplyFormPublicPath(input.orgSlug),
      });
    }

    nextSteps.push({
      label: "Payouts are managed in your school's Stripe Express dashboard",
      href: STRIPE_DASHBOARD_LINK_SENTINEL,
    });
  }

  return {
    account: input.account,
    isReady,
    checklist,
    pendingMessage,
    nextSteps,
    requirementsDue,
    isTestMode: input.isTestMode ?? isStripeTestMode(),
    syncedAt: input.syncedAt ?? new Date().toISOString(),
  };
}
