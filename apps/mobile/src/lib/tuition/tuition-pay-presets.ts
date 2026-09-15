/** Idaho Parent Choice Tax Credit maximum per child (cents). */
export const IDAHO_PARENT_CHOICE_TAX_CREDIT_CENTS = 500_000;

export function taxCreditPresetAmountCents(input: {
  currentChargeRemainingCents: number;
  payRemainingYearCents: number;
}): number {
  const withCredit = input.currentChargeRemainingCents + IDAHO_PARENT_CHOICE_TAX_CREDIT_CENTS;
  return Math.min(withCredit, input.payRemainingYearCents);
}
