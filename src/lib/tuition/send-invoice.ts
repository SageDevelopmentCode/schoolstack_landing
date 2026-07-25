import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildTuitionInvoiceHtml,
  sendTuitionInvoiceEmail,
} from "@/lib/emails";
import { SITE_URL } from "@/lib/site";
import { getChargeById, markChargeSent } from "./charges";
import { formatCents } from "./pricing";
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
        .select("name, primary_email")
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

  const email = family?.primary_email?.trim();
  const orgSlug = String(org?.slug ?? "");
  let emailed = false;

  if (email && orgSlug) {
    const billingUrl = buildTuitionBillingDeepLink(orgSlug, charge.id);
    const html = buildTuitionInvoiceHtml({
      familyName: String(family?.name ?? "Family"),
      schoolName: String(org?.name ?? "Your school"),
      chargeLabel: charge.label,
      amountDue: formatCents(charge.amountCents),
      dueDate: charge.dueDate,
      billingUrl,
    });

    const result = await sendTuitionInvoiceEmail({
      to: email,
      schoolName: String(org?.name ?? "Your school"),
      html,
    });
    emailed = result.ok;
  }

  return { charge: updated, emailed };
}
