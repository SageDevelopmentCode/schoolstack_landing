import assert from "node:assert/strict";
import test from "node:test";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import { PORTAL_MESSAGE_DELETED_PREVIEW } from "./constants";
import {
  mapMessageRow,
  mapThreadSummary,
  type MessageThreadParticipantRow,
  type MessageThreadRow,
  type ParticipantDisplayContext,
  type PortalMessageRow,
} from "./mappers";
import { deletePortalMessage } from "./messages";

const baseRow: PortalMessageRow = {
  id: "msg-1",
  thread_id: "thread-1",
  organization_id: "org-1",
  body: "Hello",
  sender_user_id: "user-1",
  sender_kind: "guardian",
  sender_guardian_id: "guardian-1",
  sender_staff_member_id: null,
  created_at: "2026-01-01T12:00:00.000Z",
  edited_at: null,
  deleted_at: null,
};

const displayContext: ParticipantDisplayContext = {
  families: new Map(),
  staffMembers: new Map(),
  guardians: new Map([
    [
      "guardian-1",
      { firstName: "Ada", lastName: "Lovelace", familyId: "family-1", profilePhotoUrl: null },
    ],
  ]),
  familyPrimaryGuardianIds: new Map(),
  familyFirstGuardianIds: new Map(),
  familyEnrolledStudents: new Map(),
  schoolOfficeLabel: "School Office",
  currentUserId: "user-1",
  viewerGuardianId: "guardian-1",
};

function createAdminMock(handlers: {
  message?: PortalMessageRow | null;
  attachmentCount?: number;
  onUpdate?: (payload: { deleted_at: string }) => void;
}) {
  const portalMessageSelectChain = {
    eq() {
      return portalMessageSelectChain;
    },
    async maybeSingle() {
      return { data: handlers.message ?? null, error: null };
    },
  };

  return {
    from(table: string) {
      if (table === "portal_messages") {
        return {
          select() {
            return portalMessageSelectChain;
          },
          update(payload: { deleted_at: string }) {
            handlers.onUpdate?.(payload);
            return {
              eq() {
                return Promise.resolve({ error: null });
              },
            };
          },
        };
      }

      if (table === "portal_message_attachments") {
        return {
          select(_columns: string, _options?: { count: string; head: boolean }) {
            return {
              eq() {
                return Promise.resolve({
                  count: handlers.attachmentCount ?? 0,
                  error: null,
                });
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  };
}

test("mapMessageRow hides body when deleted", () => {
  const mapped = mapMessageRow(
    {
      ...baseRow,
      deleted_at: "2026-01-02T12:00:00.000Z",
    },
    displayContext,
  );

  assert.equal(mapped.deletedAt, "2026-01-02T12:00:00.000Z");
  assert.equal(mapped.body, "");
  assert.equal(mapped.editedAt, null);
});

test("mapThreadSummary uses deleted preview for last message", () => {
  const thread: MessageThreadRow = {
    id: "thread-1",
    organization_id: "org-1",
    program_id: null,
    subject: null,
    participant_signature: "sig",
    last_message_at: "2026-01-02T12:00:00.000Z",
    created_at: "2026-01-01T12:00:00.000Z",
    updated_at: "2026-01-02T12:00:00.000Z",
  };

  const summary = mapThreadSummary(
    thread,
    [],
    displayContext,
    "parent",
    {
      ...baseRow,
      deleted_at: "2026-01-02T12:00:00.000Z",
    },
    0,
  );

  assert.equal(summary.lastMessagePreview, PORTAL_MESSAGE_DELETED_PREVIEW);
});

test("deletePortalMessage rejects non-senders", async () => {
  const admin = createAdminMock({ message: baseRow });

  await assert.rejects(
    () =>
      deletePortalMessage(admin as never, {
        organizationId: "org-1",
        threadId: "thread-1",
        messageId: "msg-1",
        userId: "other-user",
      }),
    (err: unknown) => {
      assert.ok(err instanceof PortalRouteError);
      assert.equal(err.status, 403);
      return true;
    },
  );
});

test("deletePortalMessage sets deleted_at", async () => {
  let updated: { deleted_at: string } | undefined;
  const admin = createAdminMock({
    message: baseRow,
    attachmentCount: 0,
    onUpdate: (payload) => {
      updated = payload;
    },
  });

  await deletePortalMessage(admin as never, {
    organizationId: "org-1",
    threadId: "thread-1",
    messageId: "msg-1",
    userId: "user-1",
  });

  assert.ok(updated?.deleted_at);
});
