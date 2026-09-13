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
    return 'Enter a valid payment amount.';
  }

  if (input.amountCents < input.remainingCents) {
    return 'Payment must cover at least the remaining balance.';
  }

  const maxCents =
    input.maxCents ??
    maxTuitionPayCents({
      remainingCents: input.remainingCents,
      payRemainingYearCents: input.payRemainingYearCents,
    });

  if (input.amountCents > maxCents) {
    return 'Payment amount is too large.';
  }

  return null;
}

export type TuitionPayAmountMode = 'balance' | 'custom';

export function resolveTuitionPayAmountCents(input: {
  mode: TuitionPayAmountMode;
  remainingCents: number;
  customDraft: string;
  payRemainingYearCents?: number;
}): { amountCents: number; error: string | null } {
  if (input.mode === 'balance') {
    return {
      amountCents: input.remainingCents,
      error: validateTuitionPayAmountCents({
        amountCents: input.remainingCents,
        remainingCents: input.remainingCents,
        payRemainingYearCents: input.payRemainingYearCents,
      }),
    };
  }

  const parsed = parseDollarInputToCents(input.customDraft);
  if (parsed === null) {
    return { amountCents: 0, error: 'Enter a valid payment amount.' };
  }

  return {
    amountCents: parsed,
    error: validateTuitionPayAmountCents({
      amountCents: parsed,
      remainingCents: input.remainingCents,
      payRemainingYearCents: input.payRemainingYearCents,
    }),
  };
}

export function formatCentsForInput(cents: number): string {
  if (!Number.isFinite(cents)) return '0.00';
  return (cents / 100).toFixed(2);
}

const DOLLAR_INPUT_PARTIAL_PATTERN = /^\d*(\.\d{0,2})?$/;

export function sanitizeDollarDraft(value: string): string {
  const cleaned = value.replace(/[$,\s]/g, '');
  if (!cleaned) return '';
  if (DOLLAR_INPUT_PARTIAL_PATTERN.test(cleaned)) {
    return cleaned;
  }

  const match = cleaned.match(/^(\d*)(?:\.(\d{0,2}))?/);
  if (!match) return '';
  const whole = match[1] ?? '';
  const fraction = match[2];
  if (fraction === undefined) return whole;
  return `${whole}.${fraction}`;
}

export function parseDollarInputToCents(value: string): number | null {
  const draft = sanitizeDollarDraft(value);
  if (!draft || draft === '.') return 0;
  if (draft.endsWith('.')) return null;

  const parsed = Number.parseFloat(draft);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}
