export type CheckoutPaymentMethod = "card" | "us_bank_account";

export type ProcessingFeeQuote = {
  netAmountCents: number;
  processingFeeCents: number;
  grossAmountCents: number;
  paymentMethod: CheckoutPaymentMethod;
};

const CARD_PERCENT = 0.029;
const CARD_FIXED_CENTS = 30;
const ACH_PERCENT = 0.008;
const ACH_CAP_CENTS = 500;

function stripeFeeCents(
  grossAmountCents: number,
  method: CheckoutPaymentMethod,
): number {
  if (grossAmountCents <= 0) return 0;

  if (method === "card") {
    return Math.ceil(grossAmountCents * CARD_PERCENT) + CARD_FIXED_CENTS;
  }

  return Math.min(Math.ceil(grossAmountCents * ACH_PERCENT), ACH_CAP_CENTS);
}

function initialGrossEstimate(
  netAmountCents: number,
  method: CheckoutPaymentMethod,
): number {
  if (method === "card") {
    return Math.ceil((netAmountCents + CARD_FIXED_CENTS) / (1 - CARD_PERCENT));
  }

  const uncappedGross = Math.ceil(netAmountCents / (1 - ACH_PERCENT));
  const uncappedFee = stripeFeeCents(uncappedGross, method);
  if (uncappedFee < ACH_CAP_CENTS) {
    return uncappedGross;
  }

  return netAmountCents + ACH_CAP_CENTS;
}

export function quoteProcessingFee(
  netAmountCents: number,
  method: CheckoutPaymentMethod,
): ProcessingFeeQuote {
  if (!Number.isFinite(netAmountCents) || netAmountCents <= 0) {
    throw new Error("Net amount must be greater than zero.");
  }

  let grossAmountCents = initialGrossEstimate(netAmountCents, method);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const fee = stripeFeeCents(grossAmountCents, method);
    if (grossAmountCents - fee >= netAmountCents) {
      return {
        netAmountCents,
        processingFeeCents: grossAmountCents - netAmountCents,
        grossAmountCents,
        paymentMethod: method,
      };
    }
    grossAmountCents += 1;
  }

  return {
    netAmountCents,
    processingFeeCents: grossAmountCents - netAmountCents,
    grossAmountCents,
    paymentMethod: method,
  };
}

export function isCheckoutPaymentMethod(
  value: unknown,
): value is CheckoutPaymentMethod {
  return value === "card" || value === "us_bank_account";
}

export function paymentMethodLabel(method: CheckoutPaymentMethod): string {
  return method === "card" ? "Credit or debit card" : "Bank account (ACH)";
}
