import type { SupabaseClient } from "@supabase/supabase-js";

export type MessagePortalViewer = "parent" | "teacher" | "admin";

function formatPersonName(
  firstName?: string | null,
  lastName?: string | null,
): string | null {
  const name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  return name || null;
}

type SenderIdentity = {
  guardianId: string | null;
  staffMemberId: string | null;
};

async function resolveSenderIdentity(
  admin: SupabaseClient,
  organizationId: string,
  senderUserId: string,
): Promise<SenderIdentity> {
  const [{ data: guardian }, { data: staff }] = await Promise.all([
    admin
      .from("guardians")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", senderUserId)
      .maybeSingle(),
    admin
      .from("staff_members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", senderUserId)
      .maybeSingle(),
  ]);

  return {
    guardianId: guardian?.id ? String(guardian.id) : null,
    staffMemberId: staff?.id ? String(staff.id) : null,
  };
}

export async function resolveSenderDisplayName(
  admin: SupabaseClient,
  organizationId: string,
  senderUserId: string,
  viewer: MessagePortalViewer,
  schoolOfficeLabel: string,
): Promise<string> {
  const identity = await resolveSenderIdentity(
    admin,
    organizationId,
    senderUserId,
  );

  if (identity.guardianId) {
    const { data: guardian } = await admin
      .from("guardians")
      .select("first_name, last_name")
      .eq("id", identity.guardianId)
      .maybeSingle();
    const name = formatPersonName(guardian?.first_name, guardian?.last_name);
    if (name) return name;
  }

  if (identity.staffMemberId) {
    const { data: staff } = await admin
      .from("staff_members")
      .select("first_name, last_name")
      .eq("id", identity.staffMemberId)
      .maybeSingle();
    const name = formatPersonName(staff?.first_name, staff?.last_name);
    if (name) return name;
  }

  if (viewer === "parent") return "A parent";
  if (viewer === "teacher") return "A teacher";
  return schoolOfficeLabel;
}

export async function resolveThreadRecipientLabels(
  admin: SupabaseClient,
  organizationId: string,
  threadId: string,
  senderUserId: string,
  schoolOfficeLabel: string,
  viewer: MessagePortalViewer,
): Promise<string[]> {
  const { data: participants, error } = await admin
    .from("message_thread_participants")
    .select("participant_kind, family_id, guardian_id, staff_member_id")
    .eq("thread_id", threadId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  const senderIdentity = await resolveSenderIdentity(
    admin,
    organizationId,
    senderUserId,
  );

  const labels: string[] = [];
  const seen = new Set<string>();

  const addLabel = (label: string | null | undefined) => {
    const trimmed = label?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    labels.push(trimmed);
  };

  for (const participant of participants ?? []) {
    if (
      participant.participant_kind === "guardian" &&
      participant.guardian_id
    ) {
      const guardianId = String(participant.guardian_id);
      if (guardianId === senderIdentity.guardianId) continue;

      const { data: guardian } = await admin
        .from("guardians")
        .select("first_name, last_name")
        .eq("id", guardianId)
        .maybeSingle();
      addLabel(formatPersonName(guardian?.first_name, guardian?.last_name));
      continue;
    }

    if (
      participant.participant_kind === "staff_member" &&
      participant.staff_member_id
    ) {
      const staffMemberId = String(participant.staff_member_id);
      if (staffMemberId === senderIdentity.staffMemberId) continue;

      const { data: staff } = await admin
        .from("staff_members")
        .select("first_name, last_name")
        .eq("id", staffMemberId)
        .maybeSingle();
      addLabel(formatPersonName(staff?.first_name, staff?.last_name));
      continue;
    }

    if (participant.participant_kind === "school_office") {
      if (viewer === "admin") continue;
      addLabel(schoolOfficeLabel);
      continue;
    }

    if (participant.participant_kind === "family" && participant.family_id) {
      const familyId = String(participant.family_id);
      const { data: family } = await admin
        .from("families")
        .select("name, primary_guardian_id")
        .eq("id", familyId)
        .maybeSingle();

      if (family?.name) {
        addLabel(String(family.name));
        continue;
      }

      if (family?.primary_guardian_id) {
        const primaryGuardianId = String(family.primary_guardian_id);
        if (primaryGuardianId === senderIdentity.guardianId) continue;

        const { data: guardian } = await admin
          .from("guardians")
          .select("first_name, last_name")
          .eq("id", primaryGuardianId)
          .maybeSingle();
        addLabel(formatPersonName(guardian?.first_name, guardian?.last_name));
      }
    }
  }

  return labels;
}
