import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildTuitionDueReminderHtml,
  sendTuitionDueReminderEmail,
} from "@/lib/emails";
import { formatCents } from "./pricing";

type DueChargeRow = {
  id: string;
  label: string;
  due_date: string;
  amount_cents: number;
  family_id: string;
};

export function getTuitionReminderTargetDate(
  reminderDaysBefore = 3,
  today: Date = new Date(),
): string {
  const reminderDate = new Date(today);
  reminderDate.setUTCDate(reminderDate.getUTCDate() + reminderDaysBefore);
  return reminderDate.toISOString().slice(0, 10);
}

type ReminderDeps = {
  sendEmail?: typeof sendTuitionDueReminderEmail;
  today?: Date;
};

export async function sendTuitionDueReminders(
  supabase: SupabaseClient,
  organizationId: string,
  reminderDaysBefore = 3,
  deps: ReminderDeps = {},
): Promise<number> {
  const sendEmail = deps.sendEmail ?? sendTuitionDueReminderEmail;
  const targetDate = getTuitionReminderTargetDate(reminderDaysBefore, deps.today);

  const { data: charges, error: chargesError } = await supabase
    .from("tuition_charges")
    .select("id, label, due_date, amount_cents, family_id")
    .eq("organization_id", organizationId)
    .eq("due_date", targetDate)
    .in("status", ["scheduled", "sent"]);

  if (chargesError) throw chargesError;
  if (!charges?.length) return 0;

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;
  const schoolName = String(org?.name ?? "Your school");
  const orgSlug = String(org?.slug ?? "");

  const byFamily = new Map<string, DueChargeRow[]>();
  for (const charge of charges as DueChargeRow[]) {
    const familyId = String(charge.family_id);
    const existing = byFamily.get(familyId) ?? [];
    existing.push(charge);
    byFamily.set(familyId, existing);
  }

  let sent = 0;

  for (const [familyId, familyCharges] of byFamily) {
    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("name, primary_email")
      .eq("id", familyId)
      .maybeSingle();

    if (familyError) throw familyError;
    const email = family?.primary_email?.trim();
    if (!email) continue;

    const totalCents = familyCharges.reduce(
      (sum, charge) => sum + Number(charge.amount_cents),
      0,
    );
    const chargeLines = familyCharges.map(
      (charge) =>
        `${charge.label} — ${formatCents(Number(charge.amount_cents))} due ${charge.due_date}`,
    );

    const billingUrl = orgSlug
      ? `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")}/school/${orgSlug}/parent/billing`
      : undefined;

    const html = buildTuitionDueReminderHtml({
      familyName: String(family?.name ?? "Family"),
      schoolName,
      dueDate: targetDate,
      totalDue: formatCents(totalCents),
      chargeLines,
      billingUrl,
    });

    const result = await sendEmail({
      to: email,
      schoolName,
      html,
    });

    if (result.ok) sent++;
  }

  return sent;
}
