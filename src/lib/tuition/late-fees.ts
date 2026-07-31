import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildTuitionLateFeeHtml,
  sendTuitionLateFeeEmail,
} from "@/lib/emails";
import { getEffectiveLateFeeDay, listLateFeeOverrides } from "./late-fee-overrides";
import {
  getTuitionOrgSettings,
  isLateFeeConfigured,
  resolveTuitionOrgSettings,
} from "./org-settings";
import { formatCents } from "./pricing";
import { rowToCharge } from "./row-mappers";
import type { TuitionCharge, TuitionLateFeeOverride, TuitionOrgSettings } from "./types";

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

export function buildLateFeeKey(
  sourceChargeId: string,
  year: number,
  month: number,
): string {
  return `${sourceChargeId}:${year}:${month}`;
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
      keys.add(
        buildLateFeeKey(record.sourceChargeId, record.periodYear, record.periodMonth),
      );
    }
  }

  return keys;
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
    .select("id, organization_id, assignment_id, family_id, label, due_date")
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

  let applied = 0;

  for (const row of unpaidTuition as UnpaidTuitionRow[]) {
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

      const key = buildLateFeeKey(String(row.id), period.year, period.month);
      if (existingKeys.has(key)) continue;

      const label = `Late fee — ${formatLateFeePeriodLabel(period.year, period.month)}`;
      const metadata = {
        sourceChargeId: String(row.id),
        periodYear: period.year,
        periodMonth: period.month,
      };

      const { data: inserted, error: insertError } = await supabase
        .from("tuition_charges")
        .insert({
          organization_id: organizationId,
          assignment_id: row.assignment_id,
          family_id: row.family_id,
          label,
          base_amount_cents: resolved.lateFeeAmountCents,
          amount_cents: resolved.lateFeeAmountCents,
          due_date: triggerDate,
          status: "sent",
          charge_type: "late_fee",
          installment_number: null,
          sent_at: new Date().toISOString(),
          metadata,
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
    const email = family?.primary_email?.trim();
    if (!email) continue;

    const totalCents = familyCharges.reduce(
      (sum, charge) => sum + charge.amountCents,
      0,
    );
    const chargeLines = familyCharges.map(
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

  return { applied, notified };
}

export function getReminderDaysForSettings(settings: TuitionOrgSettings): number[] {
  return resolveTuitionOrgSettings(settings).reminderDaysBefore;
}

export function getGraceDaysForSettings(settings: TuitionOrgSettings): number {
  return resolveTuitionOrgSettings(settings).graceDays;
}

export type { TuitionLateFeeOverride };
