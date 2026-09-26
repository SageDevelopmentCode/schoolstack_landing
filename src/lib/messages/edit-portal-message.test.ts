import assert from "node:assert/strict";
import test from "node:test";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import { mapMessageRow, type ParticipantDisplayContext, type PortalMessageRow } from "./mappers";
import { editPortalMessage } from "./messages";

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
  onUpdate?: (payload: { body: string; edited_at: string }) => void;
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
          update(payload: { body: string; edited_at: string }) {
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

test("mapMessageRow maps edited_at to editedAt", () => {
  const mapped = mapMessageRow(
    {
      ...baseRow,
      edited_at: "2026-01-02T12:00:00.000Z",
    },
    displayContext,
  );

  assert.equal(mapped.editedAt, "2026-01-02T12:00:00.000Z");
});

test("editPortalMessage rejects non-senders", async () => {
  const admin = createAdminMock({ message: baseRow });

  await assert.rejects(
    () =>
      editPortalMessage(admin as never, {
        organizationId: "org-1",
        threadId: "thread-1",
        messageId: "msg-1",
        userId: "other-user",
        body: "Updated",
      }),
    (err: unknown) => {
      assert.ok(err instanceof PortalRouteError);
      assert.equal(err.status, 403);
      return true;
    },
  );
});

test("editPortalMessage rejects messages with attachments", async () => {
  const admin = createAdminMock({ message: baseRow, attachmentCount: 1 });

  await assert.rejects(
    () =>
      editPortalMessage(admin as never, {
        organizationId: "org-1",
        threadId: "thread-1",
        messageId: "msg-1",
        userId: "user-1",
        body: "Updated",
      }),
    (err: unknown) => {
      assert.ok(err instanceof PortalRouteError);
      assert.equal(err.code, "not_editable");
      return true;
    },
  );
});

test("editPortalMessage updates body and edited_at", async () => {
  let updated: { body: string; edited_at: string } | undefined;
  const admin = createAdminMock({
    message: baseRow,
    attachmentCount: 0,
    onUpdate: (payload) => {
      updated = payload;
    },
  });

  await editPortalMessage(admin as never, {
    organizationId: "org-1",
    threadId: "thread-1",
    messageId: "msg-1",
    userId: "user-1",
    body: "Updated hello",
  });

  assert.ok(updated);
  assert.equal(updated!.body, "Updated hello");
  assert.ok(updated!.edited_at);
});
