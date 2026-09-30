import type { TuitionBillingAccount } from "./types";

/** Enabled autopay keys: guardian id, or `null` for legacy family-level autopay_enabled only. */
export function getAutopayTargets(
  account: TuitionBillingAccount,
): Map<string | null, boolean> {
  const autopayTargets = new Map<string | null, boolean>();

  const autopayByGuardian =
    account.metadata.autopayByGuardian &&
    typeof account.metadata.autopayByGuardian === "object" &&
    !Array.isArray(account.metadata.autopayByGuardian)
      ? (account.metadata.autopayByGuardian as Record<string, boolean>)
      : {};

  for (const [guardianId, enabled] of Object.entries(autopayByGuardian)) {
    if (enabled) autopayTargets.set(guardianId, true);
  }

  if (autopayTargets.size === 0 && account.autopayEnabled) {
    autopayTargets.set(null, true);
  }

  return autopayTargets;
}

/**
 * Whether a due charge will be picked up by processAutopayForOrganization for this account.
 * Without billing split, autopay queries family-level charges (guardian_id null) for every enabled target.
 */
export function chargeMatchesAutopayTarget(
  charge: { guardian_id: string | null },
  autopayTargets: Map<string | null, boolean>,
  hasBillingSplit: boolean,
): boolean {
  if (autopayTargets.size === 0) return false;

  if (hasBillingSplit) {
    for (const guardianId of autopayTargets.keys()) {
      if (guardianId === null) continue;
      if (String(charge.guardian_id) === guardianId) return true;
    }
    return false;
  }

  return charge.guardian_id == null;
}
