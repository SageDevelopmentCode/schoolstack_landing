import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { getStripeClient } from "@/lib/stripe/client";
import {
  ChargeStatusConflictError,
  getChargeById,
  updateChargeStatusIf,
} from "./charges";
import {
  ChargeWaiveError,
  validateChargeCanBeWaived,
} from "./charge-waive-validation";
import { expirePendingCheckoutSessionsForCharge } from "./expire-charge-checkout-sessions";
import { formatCents } from "./pricing";
import { rowToCharge } from "./row-mappers";
import {
  logTuitionActivity,
  type TuitionActivityOptions,
} from "./tuition-activity";
import type { TuitionCharge } from "./types";

export { ChargeWaiveError, validateChargeCanBeWaived } from "./charge-waive-validation";

const WAIVE_STATUS_CONFLICT_MESSAGE =
  "This charge was updated before it could be waived. Refresh and try again.";

function isWaiveRpcConflict(error: { message?: string; code?: string }): boolean {
  return (
    error.code === "P0001" ||
    (typeof error.message === "string" &&
      error.message.includes("charge_waive_conflict"))
  );
}

async function waiveTuitionChargeAtomic(
  supabase: SupabaseClient,
  charge: TuitionCharge,
): Promise<{ charge: TuitionCharge; cascadedLateFeeIds: string[] }> {
  const { data, error } = await supabase.rpc("waive_tuition_charge_atomic", {
    p_charge_id: charge.id,
    p_organization_id: charge.organizationId,
  });

  if (error) {
    if (isWaiveRpcConflict(error)) {
      throw new ChargeWaiveError(WAIVE_STATUS_CONFLICT_MESSAGE, 409, "status_conflict");
    }
    throw error;
  }

  const payload = data as {
    charge?: Record<string, unknown>;
    cascaded_late_fee_ids?: string[];
  };

  if (!payload?.charge) {
    throw new ChargeWaiveError(WAIVE_STATUS_CONFLICT_MESSAGE, 409, "status_conflict");
  }

  return {
    charge: rowToCharge(payload.charge),
    cascadedLateFeeIds: (payload.cascaded_late_fee_ids ?? []).map(String),
  };
}

export type WaiveChargeResult = {
  charge: TuitionCharge;
  cascadedLateFeeIds: string[];
};

export async function waiveCharge(
  supabase: SupabaseClient,
  chargeId: string,
  options?: TuitionActivityOptions & { reason?: string },
): Promise<WaiveChargeResult> {
  const charge = await getChargeById(supabase, chargeId);
  if (!charge) {
    throw new ChargeWaiveError("Charge not found.", 404, "not_found");
  }

  validateChargeCanBeWaived(charge);

  let waived: TuitionCharge;
  let cascadedLateFeeIds: string[];

  if (charge.chargeType === "tuition") {
    const result = await waiveTuitionChargeAtomic(supabase, charge);
    waived = result.charge;
    cascadedLateFeeIds = result.cascadedLateFeeIds;
  } else {
    cascadedLateFeeIds = [];
    try {
      waived = await updateChargeStatusIf(supabase, chargeId, {
        fromStatuses: ["scheduled", "sent", "overdue"],
        toStatus: "waived",
        expectedPaidCents: 0,
      });
    } catch (error) {
      if (error instanceof ChargeStatusConflictError) {
        throw new ChargeWaiveError(WAIVE_STATUS_CONFLICT_MESSAGE, 409, "status_conflict");
      }
      throw error;
    }
  }

  const stripe = getStripeClient();
  const chargeIdsToExpire = [chargeId, ...cascadedLateFeeIds];
  for (const id of chargeIdsToExpire) {
    await expirePendingCheckoutSessionsForCharge(supabase, stripe, id);
  }

  if (!options?.skip) {
    const cascadeNote =
      cascadedLateFeeIds.length > 0
        ? ` and ${cascadedLateFeeIds.length} linked late fee${cascadedLateFeeIds.length === 1 ? "" : "s"}`
        : "";

    void logTuitionActivity(supabase, {
      organizationId: charge.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_CHARGE_WAIVED,
      entityType: "tuition_charge",
      entityId: charge.id,
      summary: `Waived “${charge.label}” (${formatCents(charge.amountCents)})${cascadeNote}`,
      changeSummary: {
        changedFields: ["status"],
        changes: [
          `Waived ${charge.chargeType === "late_fee" ? "late fee" : "charge"} “${charge.label}” (${formatCents(charge.amountCents)})${options?.reason ? `: ${options.reason}` : ""}`,
        ],
      },
      logWhenEmpty: true,
      metadata: {
        familyId: charge.familyId,
        chargeId: charge.id,
        chargeType: charge.chargeType,
        label: charge.label,
        amountCents: charge.amountCents,
        reason: options?.reason ?? null,
        cascadedLateFeeIds,
      },
      context: options?.context,
    });
  }

  return { charge: waived, cascadedLateFeeIds };
}
