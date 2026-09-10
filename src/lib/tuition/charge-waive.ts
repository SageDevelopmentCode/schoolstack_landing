import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  ChargeStatusConflictError,
  getChargeById,
  updateChargeStatusIf,
} from "./charges";
import {
  ChargeWaiveError,
  filterLateFeesLinkedToSourceCharge,
  validateChargeCanBeWaived,
} from "./charge-waive-validation";
import { formatCents } from "./pricing";
import {
  logTuitionActivity,
  type TuitionActivityOptions,
} from "./tuition-activity";
import type { TuitionCharge } from "./types";

export { ChargeWaiveError, validateChargeCanBeWaived } from "./charge-waive-validation";

async function listLinkedOpenLateFeeIds(
  supabase: SupabaseClient,
  input: { organizationId: string; sourceChargeId: string },
): Promise<string[]> {
  const { data, error } = await supabase
    .from("tuition_charges")
    .select("id, metadata")
    .eq("organization_id", input.organizationId)
    .eq("charge_type", "late_fee")
    .in("status", ["scheduled", "sent", "overdue"]);

  if (error) throw error;

  return filterLateFeesLinkedToSourceCharge(data ?? [], input.sourceChargeId);
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

  const cascadedLateFeeIds: string[] = [];

  if (charge.chargeType === "tuition") {
    cascadedLateFeeIds.push(
      ...(await listLinkedOpenLateFeeIds(supabase, {
        organizationId: charge.organizationId,
        sourceChargeId: charge.id,
      })),
    );

    for (const lateFeeId of cascadedLateFeeIds) {
      try {
        await updateChargeStatusIf(supabase, lateFeeId, {
          fromStatuses: ["scheduled", "sent", "overdue"],
          toStatus: "waived",
        });
      } catch (error) {
        if (error instanceof ChargeStatusConflictError) {
          throw new ChargeWaiveError(
            "A linked late fee was updated before it could be waived. Refresh and try again.",
            409,
            "status_conflict",
          );
        }
        throw error;
      }
    }
  }

  let waived: TuitionCharge;
  try {
    waived = await updateChargeStatusIf(supabase, chargeId, {
      fromStatuses:
        charge.chargeType === "tuition"
          ? ["overdue"]
          : ["scheduled", "sent", "overdue"],
      toStatus: "waived",
    });
  } catch (error) {
    if (error instanceof ChargeStatusConflictError) {
      throw new ChargeWaiveError(
        "This charge was updated before it could be waived. Refresh and try again.",
        409,
        "status_conflict",
      );
    }
    throw error;
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
