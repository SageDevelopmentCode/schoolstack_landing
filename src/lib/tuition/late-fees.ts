import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildTuitionLateFeeHtml,
  sendTuitionLateFeeEmail,
} from "@/lib/emails";
import {
  listBillingSplits,
  payerLabelSuffix,
  splitAmountCents,
} from "./billing-splits";
import { getEffectiveLateFeeDay, listLateFeeOverrides } from "./late-fee-overrides";
import {
  getTuitionOrgSettings,
  isLateFeeConfigured,
  resolveTuitionOrgSettings,
} from "./org-settings";
import { formatCents } from "./pricing";
import { rowToCharge } from "./row-mappers";
import type {
  TuitionBillingSplit,
  TuitionCharge,
  TuitionLateFeeOverride,
  TuitionOrgSettings,
} from "./types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type BillingPeriod = {
  year: number;
  month: number;
};

type UnpaidTuitionRow = {
  id: string;
  organization_id: string;
  assignment_id: string;
  family_id: string;
  label: string;
  due_date: string;
  guardian_id: string | null;
};

export type LateFeeDraft = {
  label: string;
  amountCents: number;
  baseAmountCents: number;
  guardianId: string | null;
  metadata: {
    sourceChargeId: string;
    periodYear: number;
    periodMonth: number;
    guardianId: string | null;
  };
};

export function formatLateFeePeriodLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function buildLateFeeTriggerDate(
  year: number,
  month: number,
  lateFeeDayOfMonth: number,
): string {
  const day = Math.min(lateFeeDayOfMonth, 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function listBillingPeriodsForLateFee(
  dueDate: string,
  today: Date,
  recurring: boolean,
): BillingPeriod[] {
  const due = new Date(`${dueDate}T00:00:00Z`);
  const startYear = due.getUTCFullYear();
  const startMonth = due.getUTCMonth() + 1;
  const endYear = today.getUTCFullYear();
  const endMonth = today.getUTCMonth() + 1;

  const periods: BillingPeriod[] = [];
  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    periods.push({ year, month });
    if (!recurring) break;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return periods;
}

export function lateFeeGuardianKey(guardianId: string | null | undefined): string {
  return guardianId ?? "family";
}

export function buildLateFeeKey(
  sourceChargeId: string,
  year: number,
  month: number,
  guardianId?: string | null,
): string {
  return `${sourceChargeId}:${year}:${month}:${lateFeeGuardianKey(guardianId)}`;
}

export function parseExistingLateFeeKeys(
  charges: Array<{ metadata?: unknown }>,
): Set<string> {
  const keys = new Set<string>();

  for (const charge of charges) {
    if (!charge.metadata || typeof charge.metadata !== "object" || Array.isArray(charge.metadata)) {
      continue;
    }
    const record = charge.metadata as Record<string, unknown>;
    if (
      typeof record.sourceChargeId === "string" &&
      typeof record.periodYear === "number" &&
      typeof record.periodMonth === "number"
    ) {
      const guardianId =
        typeof record.guardianId === "string"
          ? record.guardianId
          : record.guardianId === null
            ? null
            : undefined;
      keys.add(
        buildLateFeeKey(
          record.sourceChargeId,
          record.periodYear,
          record.periodMonth,
          guardianId,
        ),
      );
      if (guardianId === undefined) {
        keys.add(
          `${record.sourceChargeId}:${record.periodYear}:${record.periodMonth}`,
        );
      }
    }
  }

  return keys;
}

export function buildLateFeeDraftsForSource(input: {
  sourceChargeId: string;
  sourceGuardianId: string | null;
  periodYear: number;
  periodMonth: number;
  lateFeeAmountCents: number;
  billingSplits: TuitionBillingSplit[];
  guardianNames: Map<string, string>;
}): LateFeeDraft[] {
  const periodLabel = formatLateFeePeriodLabel(input.periodYear, input.periodMonth);
  const baseLabel = `Late fee — ${periodLabel}`;
  const baseMetadata = {
    sourceChargeId: input.sourceChargeId,
    periodYear: input.periodYear,
    periodMonth: input.periodMonth,
  };

  if (input.sourceGuardianId) {
    return [
      {
        label: baseLabel,
        amountCents: input.lateFeeAmountCents,
        baseAmountCents: input.lateFeeAmountCents,
        guardianId: input.sourceGuardianId,
        metadata: {
          ...baseMetadata,
          guardianId: input.sourceGuardianId,
        },
      },
    ];
  }

  if (input.billingSplits.length === 0) {
    return [
      {
        label: baseLabel,
        amountCents: input.lateFeeAmountCents,
        baseAmountCents: input.lateFeeAmountCents,
        guardianId: null,
        metadata: {
          ...baseMetadata,
          guardianId: null,
        },
      },
    ];
  }

  const splitInputs = input.billingSplits.map((split) => ({
    guardianId: split.guardianId,
    shareBps: split.shareBps,
  }));
  const allocations = splitAmountCents(input.lateFeeAmountCents, splitInputs);
  const baseAllocations = splitAmountCents(input.lateFeeAmountCents, splitInputs);

  return allocations.map((allocation, index) => {
    const firstName =
      input.guardianNames.get(allocation.guardianId)?.split(/\s+/)[0] ?? "";
    return {
      label: `${baseLabel}${payerLabelSuffix(firstName)}`,
      amountCents: allocation.amountCents,
      baseAmountCents: baseAllocations[index]?.amountCents ?? allocation.amountCents,
      guardianId: allocation.guardianId,
      metadata: {
        ...baseMetadata,
        guardianId: allocation.guardianId,
      },
    };
  });
}

export type ApplyLateFeesResult = {
  applied: number;
  notified: number;
};

type ApplyLateFeesDeps = {
  today?: Date;
  getSettings?: typeof getTuitionOrgSettings;
  listOverrides?: typeof listLateFeeOverrides;
  sendEmail?: typeof sendTuitionLateFeeEmail;
};

async function resolveRecipientEmail(
  supabase: SupabaseClient,
  input: {
    familyId: string;
    guardianId: string | null;
    primaryEmail: string | null;
    guardianUserIds: Map<string, string | null>;
    guardianEmails: Map<string, string | null>;
  },
): Promise<string | null> {
  if (input.guardianId) {
    const guardianUserId = input.guardianUserIds.get(input.guardianId) ?? null;
    if (guardianUserId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", guardianUserId)
        .maybeSingle();
      const profileEmail =
        typeof profile?.email === "string" ? profile.email.trim() : null;
      if (profileEmail) return profileEmail;
    }

    const guardianEmail = input.guardianEmails.get(input.guardianId) ?? null;
    if (guardianEmail) return guardianEmail;
  }

  return input.primaryEmail;
}

export async function applyLateFeesForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
  deps: ApplyLateFeesDeps = {},
): Promise<ApplyLateFeesResult> {
  const today = deps.today ?? new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const getSettings = deps.getSettings ?? getTuitionOrgSettings;
  const listOverrides = deps.listOverrides ?? listLateFeeOverrides;
  const sendEmail = deps.sendEmail ?? sendTuitionLateFeeEmail;

  const settings = await getSettings(supabase, organizationId);
  if (!isLateFeeConfigured(settings)) {
    return { applied: 0, notified: 0 };
  }

  const resolved = resolveTuitionOrgSettings(settings);
  const overrides = await listOverrides(supabase, organizationId);

  const { data: unpaidTuition, error: tuitionError } = await supabase
    .from("tuition_charges")
    .select(
      "id, organization_id, assignment_id, family_id, label, due_date, guardian_id",
    )
    .eq("organization_id", organizationId)
    .eq("charge_type", "tuition")
    .in("status", ["scheduled", "sent", "overdue"]);

  if (tuitionError) throw tuitionError;
  if (!unpaidTuition?.length) {
    return { applied: 0, notified: 0 };
  }

  const { data: existingLateFees, error: lateFeeError } = await supabase
    .from("tuition_charges")
    .select("metadata")
    .eq("organization_id", organizationId)
    .eq("charge_type", "late_fee")
    .not("status", "eq", "void");

  if (lateFeeError) throw lateFeeError;

  const existingKeys = parseExistingLateFeeKeys(existingLateFees ?? []);
  const createdByFamily = new Map<string, TuitionCharge[]>();
  const splitsByFamily = new Map<string, TuitionBillingSplit[]>();
  const guardianNamesByFamily = new Map<string, Map<string, string>>();

  let applied = 0;

  for (const row of unpaidTuition as UnpaidTuitionRow[]) {
    const familyId = String(row.family_id);
    let billingSplits = splitsByFamily.get(familyId);
    if (billingSplits === undefined) {
      billingSplits = await listBillingSplits(supabase, familyId);
      splitsByFamily.set(familyId, billingSplits);
    }

    let guardianNames = guardianNamesByFamily.get(familyId);
    if (!guardianNames && billingSplits.length > 0) {
      const { data: guardians, error: guardiansError } = await supabase
        .from("guardians")
        .select("id, first_name, last_name")
        .eq("family_id", familyId)
        .in(
          "id",
          billingSplits.map((split) => split.guardianId),
        );

      if (guardiansError) throw guardiansError;

      guardianNames = new Map(
        (guardians ?? []).map((guardian) => [
          String(guardian.id),
          [guardian.first_name, guardian.last_name].filter(Boolean).join(" ").trim(),
        ]),
      );
      guardianNamesByFamily.set(familyId, guardianNames);
    }

    const periods = listBillingPeriodsForLateFee(
      String(row.due_date),
      today,
      resolved.lateFeeRecurring,
    );

    for (const period of periods) {
      const lateFeeDay = getEffectiveLateFeeDay(
        resolved,
        overrides,
        period.year,
        period.month,
      );
      const triggerDate = buildLateFeeTriggerDate(
        period.year,
        period.month,
        lateFeeDay,
      );

      if (todayStr <= triggerDate) continue;

      const drafts = buildLateFeeDraftsForSource({
        sourceChargeId: String(row.id),
        sourceGuardianId: row.guardian_id ? String(row.guardian_id) : null,
        periodYear: period.year,
        periodMonth: period.month,
        lateFeeAmountCents: resolved.lateFeeAmountCents,
        billingSplits,
        guardianNames: guardianNames ?? new Map(),
      });

      for (const draft of drafts) {
        const key = buildLateFeeKey(
          draft.metadata.sourceChargeId,
          draft.metadata.periodYear,
          draft.metadata.periodMonth,
          draft.guardianId,
        );
        if (existingKeys.has(key)) continue;

        const { data: inserted, error: insertError } = await supabase
          .from("tuition_charges")
          .insert({
            organization_id: organizationId,
            assignment_id: row.assignment_id,
            family_id: familyId,
            guardian_id: draft.guardianId,
            label: draft.label,
            base_amount_cents: draft.baseAmountCents,
            amount_cents: draft.amountCents,
            due_date: triggerDate,
            status: "sent",
            charge_type: "late_fee",
            installment_number: null,
            sent_at: new Date().toISOString(),
            metadata: draft.metadata,
          })
          .select("*")
          .single();

        if (insertError) throw insertError;

        existingKeys.add(key);
        applied += 1;

        const charge = rowToCharge(inserted);
        const familyCharges = createdByFamily.get(charge.familyId) ?? [];
        familyCharges.push(charge);
        createdByFamily.set(charge.familyId, familyCharges);
      }
    }
  }

  if (createdByFamily.size === 0) {
    return { applied, notified: 0 };
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;

  const schoolName = String(org?.name ?? "Your school");
  const orgSlug = String(org?.slug ?? "");
  const billingUrl = orgSlug
    ? `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")}/school/${orgSlug}/parent/billing`
    : undefined;

  let notified = 0;

  for (const [familyId, familyCharges] of createdByFamily) {
    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("name, primary_email")
      .eq("id", familyId)
      .maybeSingle();

    if (familyError) throw familyError;

    const primaryEmail =
      typeof family?.primary_email === "string"
        ? family.primary_email.trim()
        : null;

    const guardianIds = [
      ...new Set(
        familyCharges
          .map((charge) => charge.guardianId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const guardianUserIds = new Map<string, string | null>();
    const guardianEmails = new Map<string, string | null>();

    if (guardianIds.length > 0) {
      const { data: guardians, error: guardiansError } = await supabase
        .from("guardians")
        .select("id, user_id, email")
        .in("id", guardianIds);

      if (guardiansError) throw guardiansError;

      for (const guardian of guardians ?? []) {
        const id = String(guardian.id);
        guardianUserIds.set(
          id,
          guardian.user_id ? String(guardian.user_id) : null,
        );
        guardianEmails.set(
          id,
          typeof guardian.email === "string" ? guardian.email.trim() : null,
        );
      }
    }

    const chargesByRecipient = new Map<string, TuitionCharge[]>();

    for (const charge of familyCharges) {
      const recipientEmail = await resolveRecipientEmail(supabase, {
        familyId,
        guardianId: charge.guardianId,
        primaryEmail,
        guardianUserIds,
        guardianEmails,
      });
      if (!recipientEmail) continue;

      const bucket = chargesByRecipient.get(recipientEmail) ?? [];
      bucket.push(charge);
      chargesByRecipient.set(recipientEmail, bucket);
    }

    for (const [email, recipientCharges] of chargesByRecipient) {
      const totalCents = recipientCharges.reduce(
        (sum, charge) => sum + charge.amountCents,
        0,
      );
      const chargeLines = recipientCharges.map(
        (charge) => `${charge.label} — ${formatCents(charge.amountCents)}`,
      );

      const html = buildTuitionLateFeeHtml({
        familyName: String(family?.name ?? "Family"),
        schoolName,
        totalDue: formatCents(totalCents),
        chargeLines,
        billingUrl,
      });

      const result = await sendEmail({
        to: email,
        schoolName,
        html,
      });

      if (result.ok) notified += 1;
    }
  }

  return { applied, notified };
}

export function getReminderDaysForSettings(settings: TuitionOrgSettings): number[] {
  return resolveTuitionOrgSettings(settings).reminderDaysBefore;
}

export function getGraceDaysForSettings(settings: TuitionOrgSettings): number {
  return resolveTuitionOrgSettings(settings).graceDays;
}

export type { TuitionLateFeeOverride };
