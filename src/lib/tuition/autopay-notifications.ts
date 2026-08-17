import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  summarizeAutopayCharge,
} from "./tuition-activity";
import {
  buildTuitionAutopayFailedHtml,
  sendTuitionAutopayFailedEmail,
} from "@/lib/emails";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { formatCents } from "@/lib/tuition/pricing";

export async function notifyAutopaySucceeded(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    chargeId: string;
    chargeLabel: string;
    amountCents: number;
    guardianUserId: string | null;
    familyName?: string;
  },
): Promise<void> {
  const changeSummary = summarizeAutopayCharge({
    succeeded: true,
    chargeLabel: input.chargeLabel,
    amountCents: input.amountCents,
    familyName: input.familyName,
  });

  await logTuitionActivity(supabase, {
    organizationId: input.organizationId,
    action: ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED,
    entityType: "tuition_charge",
    entityId: input.chargeId,
    summary: `Autopay succeeded for ${input.chargeLabel}`,
    changeSummary,
    logWhenEmpty: true,
    metadata: {
      familyId: input.familyId,
      chargeId: input.chargeId,
      amountCents: input.amountCents,
      guardianUserId: input.guardianUserId,
      familyName: input.familyName ?? null,
    },
    context: { actorType: "system", surface: "system" },
  });
}

export async function notifyAutopayFailed(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    chargeId: string;
    chargeLabel: string;
    amountCents: number;
    guardianId: string | null;
    guardianUserId: string | null;
    errorMessage: string;
    orgSlug: string;
    stripeTestMode?: boolean;
    familyName?: string;
  },
): Promise<void> {
  const changeSummary = summarizeAutopayCharge({
    succeeded: false,
    chargeLabel: input.chargeLabel,
    amountCents: input.amountCents,
    familyName: input.familyName,
    errorMessage: input.errorMessage,
  });

  await logTuitionActivity(supabase, {
    organizationId: input.organizationId,
    action: ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED,
    entityType: "tuition_charge",
    entityId: input.chargeId,
    summary: `Autopay failed for ${input.chargeLabel}`,
    changeSummary,
    logWhenEmpty: true,
    metadata: {
      familyId: input.familyId,
      chargeId: input.chargeId,
      guardianId: input.guardianId,
      amountCents: input.amountCents,
      errorMessage: input.errorMessage,
      stripeTestMode: input.stripeTestMode ?? null,
      familyName: input.familyName ?? null,
    },
    severity: "error",
    context: { actorType: "system", surface: "system" },
  });

  const [{ data: family }, { data: org }] = await Promise.all([
    supabase
      .from("families")
      .select("name")
      .eq("id", input.familyId)
      .maybeSingle(),
    supabase
      .from("organizations")
      .select("name, slug")
      .eq("id", input.organizationId)
      .maybeSingle(),
  ]);

  const recipientEmails = await loadFamilyNotificationEmails(
    supabase,
    input.familyId,
  );

  if (recipientEmails.length === 0) return;

  const schoolName = String(org?.name ?? "Your school");
  const orgSlug = String(org?.slug ?? input.orgSlug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const billingUrl = `${baseUrl}/school/${orgSlug}/parent/billing`;

  const html = buildTuitionAutopayFailedHtml({
    familyName: String(family?.name ?? "Family"),
    schoolName,
    chargeLabel: input.chargeLabel,
    amountDue: formatCents(input.amountCents),
    billingUrl,
    errorMessage: input.errorMessage,
  });

  await Promise.all(
    recipientEmails.map((to) =>
      sendTuitionAutopayFailedEmail({
        to,
        schoolName,
        html,
      }),
    ),
  );
}
