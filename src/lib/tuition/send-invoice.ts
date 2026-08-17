import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildTuitionInvoiceHtml,
  sendTuitionInvoiceEmail,
} from "@/lib/emails";
import { SITE_URL } from "@/lib/site";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { getChargeById, markChargeSent } from "./charges";
import { formatCents } from "./pricing";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  summarizePaymentAction,
  type TuitionActivityOptions,
} from "./tuition-activity";
import type { TuitionCharge } from "./types";

export function buildTuitionBillingDeepLink(
  orgSlug: string,
  chargeId: string,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? SITE_URL,
): string {
  return `${siteUrl}/school/${orgSlug}/parent/billing?charge=${chargeId}`;
}

export type SendTuitionInvoiceResult = {
  charge: TuitionCharge;
  emailed: boolean;
};

export async function sendTuitionInvoice(
  supabase: SupabaseClient,
  chargeId: string,
  options?: TuitionActivityOptions,
): Promise<SendTuitionInvoiceResult> {
  const charge = await getChargeById(supabase, chargeId);
  if (!charge) {
    throw new Error("Charge not found.");
  }

  if (charge.status === "paid" || charge.status === "void" || charge.status === "waived") {
    throw new Error("This charge cannot be sent as an invoice.");
  }

  const updated = await markChargeSent(supabase, charge.id);

  const [{ data: family, error: familyError }, { data: org, error: orgError }] =
    await Promise.all([
      supabase
        .from("families")
        .select("name")
        .eq("id", charge.familyId)
        .maybeSingle(),
      supabase
        .from("organizations")
        .select("name, slug")
        .eq("id", charge.organizationId)
        .maybeSingle(),
    ]);

  if (familyError) throw familyError;
  if (orgError) throw orgError;

  const emails = await loadFamilyNotificationEmails(supabase, charge.familyId);
  const orgSlug = String(org?.slug ?? "");
  let emailed = false;

  if (emails.length > 0 && orgSlug) {
    const billingUrl = buildTuitionBillingDeepLink(orgSlug, charge.id);
    const html = buildTuitionInvoiceHtml({
      familyName: String(family?.name ?? "Family"),
      schoolName: String(org?.name ?? "Your school"),
      chargeLabel: charge.label,
      amountDue: formatCents(charge.amountCents),
      dueDate: charge.dueDate,
      billingUrl,
    });

    for (const email of emails) {
      const result = await sendTuitionInvoiceEmail({
        to: email,
        schoolName: String(org?.name ?? "Your school"),
        html,
      });
      if (result.ok) emailed = true;
    }
  }

  if (!options?.skip) {
    const changeSummary = summarizePaymentAction({
      kind: "invoice_sent",
      amountCents: charge.amountCents,
      chargeLabel: charge.label,
      familyName: family?.name ? String(family.name) : undefined,
      recipientEmail: emails[0] ?? undefined,
    });
    void logTuitionActivity(supabase, {
      organizationId: charge.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_CHARGE_INVOICE_SENT,
      entityType: "tuition_charge",
      entityId: charge.id,
      summary: `Sent invoice for “${charge.label}”`,
      changeSummary,
      logWhenEmpty: true,
      metadata: {
        familyId: charge.familyId,
        emailed,
      },
      context: options?.context,
    });
  }

  return { charge: updated, emailed };
}
