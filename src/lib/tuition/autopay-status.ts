import type { FamilyGuardianRecord } from "@/lib/admissions/family-guardians";
import { getAutopayEnabledForGuardian } from "@/lib/tuition/payment-settlement";
import { rowToBillingAccount } from "@/lib/tuition/row-mappers";

export type GuardianAutopayStatus = {
  guardianId: string;
  name: string;
  autopayEnabled: boolean;
  hasPaymentMethod: boolean;
};

export type FamilyAutopayStatus = {
  autopayStatus: "off" | "on" | "partial";
  guardianAutopay: GuardianAutopayStatus[];
  hasPaymentMethod: boolean;
};

type PaymentMethodRow = {
  guardian_id: string | null;
  billing_account_id: string;
};

export function computeFamilyAutopayStatus(input: {
  billingAccountRow: Record<string, unknown> | null | undefined;
  guardians: FamilyGuardianRecord[];
  paymentMethods: PaymentMethodRow[];
  hasBillingSplit: boolean;
}): FamilyAutopayStatus {
  if (!input.billingAccountRow) {
    return {
      autopayStatus: "off",
      guardianAutopay: [],
      hasPaymentMethod: false,
    };
  }

  const account = rowToBillingAccount(input.billingAccountRow);
  const billingAccountId = account.id;
  const methodsForAccount = input.paymentMethods.filter(
    (method) => String(method.billing_account_id) === billingAccountId,
  );

  const guardianHasMethod = (guardianId: string | null): boolean => {
    if (guardianId) {
      return methodsForAccount.some(
        (method) => method.guardian_id && String(method.guardian_id) === guardianId,
      );
    }
    return (
      methodsForAccount.some((method) => method.guardian_id === null) ||
      Boolean(account.defaultPaymentMethodId)
    );
  };

  if (!input.hasBillingSplit) {
    const enabled = account.autopayEnabled;
    return {
      autopayStatus: enabled ? "on" : "off",
      guardianAutopay: [],
      hasPaymentMethod: guardianHasMethod(null),
    };
  }

  const guardianAutopay: GuardianAutopayStatus[] = input.guardians.map((guardian) => ({
    guardianId: guardian.id,
    name: [guardian.firstName, guardian.lastName].filter(Boolean).join(" ").trim(),
    autopayEnabled: getAutopayEnabledForGuardian(account, guardian.id),
    hasPaymentMethod: guardianHasMethod(guardian.id),
  }));

  const enabledCount = guardianAutopay.filter((row) => row.autopayEnabled).length;
  const autopayStatus: FamilyAutopayStatus["autopayStatus"] =
    enabledCount === 0
      ? "off"
      : enabledCount === guardianAutopay.length
        ? "on"
        : "partial";

  return {
    autopayStatus,
    guardianAutopay,
    hasPaymentMethod: guardianAutopay.some((row) => row.hasPaymentMethod),
  };
}
