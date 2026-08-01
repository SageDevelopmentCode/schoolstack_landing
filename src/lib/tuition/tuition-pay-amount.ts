export function maxTuitionOverpayCents(remainingCents: number): number {
  return remainingCents * 12;
}

export function validateTuitionPayAmountCents(input: {
  amountCents: number;
  remainingCents: number;
}): string | null {
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    return "Enter a valid payment amount.";
  }

  if (input.amountCents < input.remainingCents) {
    return "Payment must cover at least the remaining balance.";
  }

  const maxCents = maxTuitionOverpayCents(input.remainingCents);
  if (input.amountCents > maxCents) {
    return "Payment amount is too large.";
  }

  return null;
}
