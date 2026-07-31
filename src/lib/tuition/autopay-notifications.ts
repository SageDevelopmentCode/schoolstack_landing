import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import {
  buildTuitionAutopayFailedHtml,
  sendTuitionAutopayFailedEmail,
} from "@/lib/emails";
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
  },
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED,
    entityType: "tuition_charge",
    entityId: input.chargeId,
    summary: `Autopay succeeded for ${input.chargeLabel}`,
    metadata: {
      familyId: input.familyId,
      chargeId: input.chargeId,
      amountCents: input.amountCents,
      guardianUserId: input.guardianUserId,
    },
    severity: "info",
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
  },
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED,
    entityType: "tuition_charge",
    entityId: input.chargeId,
    summary: `Autopay failed for ${input.chargeLabel}`,
    metadata: {
      familyId: input.familyId,
      chargeId: input.chargeId,
      guardianId: input.guardianId,
      amountCents: input.amountCents,
      errorMessage: input.errorMessage,
    },
    severity: "error",
  });

  const [{ data: family }, { data: org }] = await Promise.all([
    supabase
      .from("families")
      .select("name, primary_email")
      .eq("id", input.familyId)
      .maybeSingle(),
    supabase
      .from("organizations")
      .select("name, slug")
      .eq("id", input.organizationId)
      .maybeSingle(),
  ]);

  let recipientEmail: string | null = null;
  if (input.guardianUserId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", input.guardianUserId)
      .maybeSingle();
    recipientEmail =
      typeof profile?.email === "string" ? profile.email.trim() : null;
  }

  if (!recipientEmail && input.guardianId) {
    const { data: guardian } = await supabase
      .from("guardians")
      .select("email")
      .eq("id", input.guardianId)
      .maybeSingle();
    recipientEmail =
      typeof guardian?.email === "string" ? guardian.email.trim() : null;
  }

  if (!recipientEmail) {
    recipientEmail =
      typeof family?.primary_email === "string"
        ? family.primary_email.trim()
        : null;
  }

  if (!recipientEmail) return;

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

  await sendTuitionAutopayFailedEmail({
    to: recipientEmail,
    schoolName,
    html,
  });
}

export async function getRecentAutopayFailureForFamily(
  supabase: SupabaseClient,
  input: { organizationId: string; familyId: string },
): Promise<{ createdAt: string; summary: string } | null> {
  const { data, error } = await supabase
    .from("activity_events")
    .select("created_at, summary")
    .eq("organization_id", input.organizationId)
    .eq("action", ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED)
    .contains("metadata", { familyId: input.familyId })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    createdAt: String(data.created_at),
    summary: String(data.summary),
  };
}
