import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildEmailNotificationContext,
  buildTuitionAutopayUpcomingHtml,
  sendTuitionAutopayUpcomingEmail,
} from "@/lib/emails";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { chargeRemainingCents } from "./billing-splits";
import { formatCents } from "./pricing";
import { rowToBillingAccount } from "./row-mappers";
import { getTuitionReminderTargetDate } from "./reminders";
import type { TuitionBillingAccount } from "./types";

export const DEFAULT_AUTOPAY_REMINDER_DAYS_BEFORE = 1;

type DueChargeRow = {
  id: string;
  label: string;
  due_date: string;
  amount_cents: number;
  paid_cents?: number | null;
  family_id: string;
  guardian_id: string | null;
};

function getAutopayTargets(
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

function chargeMatchesAutopayTarget(
  charge: DueChargeRow,
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

  return charge.guardian_id == null && autopayTargets.has(null);
}

type ReminderDeps = {
  sendEmail?: typeof sendTuitionAutopayUpcomingEmail;
  today?: Date;
};

export async function sendAutopayUpcomingReminders(
  supabase: SupabaseClient,
  organizationId: string,
  reminderDaysBefore = DEFAULT_AUTOPAY_REMINDER_DAYS_BEFORE,
  deps: ReminderDeps = {},
): Promise<number> {
  const sendEmail = deps.sendEmail ?? sendTuitionAutopayUpcomingEmail;
  const chargeDate = getTuitionReminderTargetDate(reminderDaysBefore, deps.today);

  const { data: accountRows, error: accountsError } = await supabase
    .from("tuition_billing_accounts")
    .select("id, organization_id, family_id, autopay_enabled, metadata")
    .eq("organization_id", organizationId);

  if (accountsError) throw accountsError;

  const accounts = (accountRows ?? []).map((row) => rowToBillingAccount(row));
  const autopayAccounts = accounts.filter(
    (account) => getAutopayTargets(account).size > 0,
  );

  if (autopayAccounts.length === 0) return 0;

  const familyIds = autopayAccounts.map((account) => account.familyId);
  const familiesWithBillingSplit = new Set<string>();

  const { data: splitRows, error: splitsError } = await supabase
    .from("tuition_billing_splits")
    .select("family_id")
    .in("family_id", familyIds);

  if (splitsError) throw splitsError;

  for (const row of splitRows ?? []) {
    familiesWithBillingSplit.add(String(row.family_id));
  }

  const { data: charges, error: chargesError } = await supabase
    .from("tuition_charges")
    .select(
      "id, label, due_date, amount_cents, paid_cents, family_id, guardian_id",
    )
    .eq("organization_id", organizationId)
    .eq("due_date", chargeDate)
    .in("status", ["scheduled", "sent"])
    .in("family_id", familyIds);

  if (chargesError) throw chargesError;
  if (!charges?.length) return 0;

  const accountByFamily = new Map(
    autopayAccounts.map((account) => [account.familyId, account]),
  );

  const byFamily = new Map<string, DueChargeRow[]>();

  for (const charge of charges as DueChargeRow[]) {
    const familyId = String(charge.family_id);
    const account = accountByFamily.get(familyId);
    if (!account) continue;

    const remaining = chargeRemainingCents({
      amountCents: Number(charge.amount_cents),
      paidCents: Number(charge.paid_cents ?? 0),
    });
    if (remaining <= 0) continue;

    const autopayTargets = getAutopayTargets(account);
    const hasBillingSplit = familiesWithBillingSplit.has(familyId);
    if (!chargeMatchesAutopayTarget(charge, autopayTargets, hasBillingSplit)) {
      continue;
    }

    const existing = byFamily.get(familyId) ?? [];
    existing.push(charge);
    byFamily.set(familyId, existing);
  }

  if (byFamily.size === 0) return 0;

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;
  const schoolName = String(org?.name ?? "Your school");
  const orgSlug = String(org?.slug ?? "");

  let sent = 0;

  for (const [familyId, familyCharges] of byFamily) {
    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("name")
      .eq("id", familyId)
      .maybeSingle();

    if (familyError) throw familyError;

    const emails = await loadFamilyNotificationEmails(supabase, familyId);
    if (emails.length === 0) continue;

    const totalCents = familyCharges.reduce(
      (sum, charge) =>
        sum +
        chargeRemainingCents({
          amountCents: Number(charge.amount_cents),
          paidCents: Number(charge.paid_cents ?? 0),
        }),
      0,
    );

    const chargeLines = familyCharges.map((charge) => {
      const remaining = chargeRemainingCents({
        amountCents: Number(charge.amount_cents),
        paidCents: Number(charge.paid_cents ?? 0),
      });
      return `${charge.label} — ${formatCents(remaining)}`;
    });

    const billingUrl = orgSlug
      ? `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")}/school/${orgSlug}/parent/billing`
      : undefined;

    const html = buildTuitionAutopayUpcomingHtml({
      familyName: String(family?.name ?? "Family"),
      schoolName,
      chargeDate,
      totalDue: formatCents(totalCents),
      chargeLines,
      billingUrl,
    });

    for (const email of emails) {
      const result = await sendEmail({
        to: email,
        schoolName,
        html,
        notificationContext: buildEmailNotificationContext({
          organizationId,
          organizationSlug: orgSlug,
          surface: "cron",
          entityType: "family",
          entityId: familyId,
        }),
      });

      if (result.ok) sent++;
    }
  }

  return sent;
}
