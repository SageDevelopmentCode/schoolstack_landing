import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_BROADCAST_MAX_RECIPIENTS } from "@/lib/messages/admin-broadcast-constants";
import {
  findOrCreateThread,
  resolveParticipantsForContact,
} from "@/lib/messages/api-helpers";
import { sendMessageForViewer } from "@/lib/messages/api-helpers-server";
import {
  resolveAdminBroadcastGuardians,
  type AdminBroadcastAudienceInput,
} from "@/lib/messages/admin-broadcast-audience";
import type { MessageContact } from "@/lib/messages/types";

export type AdminBroadcastFailure = {
  guardianId: string;
  name: string;
  error: string;
};

export type AdminBroadcastSendResult = {
  sentCount: number;
  failedCount: number;
  failures: AdminBroadcastFailure[];
};

export type AdminBroadcastSendInput = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  body: string;
  files?: File[];
  audience: AdminBroadcastAudienceInput;
  userId: string;
  staffMemberId?: string | null;
  activityMetadata?: Record<string, unknown>;
};

function hasMessageContent(body: string, files?: File[]): boolean {
  return Boolean(body.trim() || (files?.length ?? 0) > 0);
}

export async function resolveAdminBroadcastContacts(
  admin: SupabaseClient,
  organizationId: string,
  audience: AdminBroadcastAudienceInput,
): Promise<MessageContact[]> {
  return resolveAdminBroadcastGuardians(admin, organizationId, audience);
}

export async function adminBroadcastSend(
  admin: SupabaseClient,
  input: AdminBroadcastSendInput,
): Promise<AdminBroadcastSendResult> {
  if (!hasMessageContent(input.body, input.files)) {
    throw new Error("Message content is required.");
  }

  const contacts = await resolveAdminBroadcastContacts(
    admin,
    input.organizationId,
    input.audience,
  );

  if (contacts.length === 0) {
    throw new Error("Select at least one parent to message.");
  }

  if (contacts.length > ADMIN_BROADCAST_MAX_RECIPIENTS) {
    throw new Error(
      `You can message up to ${ADMIN_BROADCAST_MAX_RECIPIENTS} parents at a time.`,
    );
  }

  const schoolOfficeLabel = `${input.schoolName} Office`;
  const failures: AdminBroadcastFailure[] = [];
  let sentCount = 0;

  for (const contact of contacts) {
    if (contact.kind !== "guardian" || !contact.guardianId) continue;

    try {
      const participants = await resolveParticipantsForContact(
        admin,
        input.organizationId,
        contact,
        {
          staffMemberId: input.staffMemberId,
          viewer: "admin",
        },
      );
      const threadId = await findOrCreateThread(
        admin,
        input.organizationId,
        participants,
      );
      await sendMessageForViewer(admin, {
        organizationId: input.organizationId,
        organizationSlug: input.organizationSlug,
        threadId,
        body: input.body,
        files: input.files,
        userId: input.userId,
        viewer: "admin",
        staffMemberId: input.staffMemberId,
        schoolName: input.schoolName,
        schoolOfficeLabel,
        activityMetadata: input.activityMetadata,
      });
      sentCount += 1;
    } catch (err) {
      failures.push({
        guardianId: contact.guardianId,
        name: contact.name,
        error: err instanceof Error ? err.message : "Failed to send message.",
      });
    }
  }

  return {
    sentCount,
    failedCount: failures.length,
    failures,
  };
}
