import type { ChargeStatusBadgeTone } from '@/lib/tuition/charge-status-display';

export type TuitionPaymentStripeStatusBadge = {
  label: string;
  tone: ChargeStatusBadgeTone;
  testId: string;
};

type StripeStatusPayment = {
  paymentMethodType: 'card' | 'us_bank_account' | null;
  stripeProviderStatus: string | null;
  status: string;
};

function achStripeProviderBadge(
  provider: string | null | undefined,
): TuitionPaymentStripeStatusBadge | null {
  if (provider === 'requires_action') {
    return {
      label: 'REQUIRES ACTION',
      tone: 'warning',
      testId: 'parent-billing-payment-requires-action-badge',
    };
  }
  if (provider === 'processing') {
    return {
      label: 'PROCESSING',
      tone: 'info',
      testId: 'parent-billing-payment-processing-badge',
    };
  }
  if (provider === 'failed') {
    return {
      label: 'FAILED',
      tone: 'danger',
      testId: 'parent-billing-payment-failed-badge',
    };
  }
  return null;
}

export function tuitionPaymentStripeStatusBadge(
  payment: StripeStatusPayment,
): TuitionPaymentStripeStatusBadge | null {
  if (payment.paymentMethodType !== 'us_bank_account') {
    return null;
  }
  return achStripeProviderBadge(payment.stripeProviderStatus);
}

export function tuitionPaymentStripeStatusHint(
  payment: StripeStatusPayment,
): { message: string; tone: 'warning' | 'info' | 'danger' } | null {
  if (payment.paymentMethodType !== 'us_bank_account') {
    return null;
  }
  const provider = payment.stripeProviderStatus;
  if (provider === 'requires_action') {
    return {
      message:
        'Bank verification needed — check your email for a link from MudKitchen or Stripe.',
      tone: 'warning',
    };
  }
  if (provider === 'processing') {
    return {
      message: 'Bank payment processing — usually 3–5 business days.',
      tone: 'info',
    };
  }
  if (provider === 'failed') {
    return {
      message: 'This bank payment did not go through. Pay again or use a card.',
      tone: 'danger',
    };
  }
  return null;
}
