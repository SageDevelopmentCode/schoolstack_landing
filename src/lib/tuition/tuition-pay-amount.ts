export function maxTuitionOverpayCents(remainingCents: number): number {
  return remainingCents * 12;
}

export function maxTuitionPayCents(input: {
  remainingCents: number;
  payRemainingYearCents?: number;
}): number {
  if (
    input.payRemainingYearCents != null &&
    input.payRemainingYearCents >= input.remainingCents
  ) {
    return input.payRemainingYearCents;
  }

  return maxTuitionOverpayCents(input.remainingCents);
}

export function validateTuitionPayAmountCents(input: {
  amountCents: number;
  remainingCents: number;
  maxCents?: number;
  payRemainingYearCents?: number;
}): string | null {
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    return "Enter a valid payment amount.";
  }

  if (input.amountCents < input.remainingCents) {
    return "Payment must cover at least the remaining balance.";
  }

  const maxCents =
    input.maxCents ??
    maxTuitionPayCents({
      remainingCents: input.remainingCents,
      payRemainingYearCents: input.payRemainingYearCents,
    });

  if (input.amountCents > maxCents) {
    return "Payment amount is too large.";
  }

  return null;
}
