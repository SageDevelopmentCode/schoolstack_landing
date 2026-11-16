import assert from "node:assert/strict";
import test from "node:test";
import type { MessagesFeedbackEvent } from "@/components/messages/messages-inbox-view-model";
import { describeAdminMessagesFeedback } from "./admin-messages-feedback";
import {
  isAdminGardenMessagesVariant,
  isGardenMessagesVariant,
  isParentGardenMessagesVariant,
  isSplitPaneMessagesVariant,
} from "./messages-layout-variant";

test("admin-garden is a split-pane Garden variant, separate from parent-garden", () => {
  assert.equal(isSplitPaneMessagesVariant("admin-garden"), true);
  assert.equal(isGardenMessagesVariant("admin-garden"), true);
  assert.equal(isGardenMessagesVariant("parent-garden"), true);
  assert.equal(isGardenMessagesVariant("admin-story"), false);
  assert.equal(isAdminGardenMessagesVariant("admin-garden"), true);
  assert.equal(isParentGardenMessagesVariant("admin-garden"), false);
});

test("failed send keeps the draft, offers Retry and uses an error-only id", () => {
  let retried = false;
  const toast = describeAdminMessagesFeedback({
    type: "send_failed",
    message: "Network error.",
    restored: true,
    retry: () => {
      retried = true;
    },
  });
  assert.ok(toast);
  assert.equal(toast.kind, "error");
  assert.equal(toast.id, "admin-messages-send-error");
  assert.match(toast.description ?? "", /still in the box/);
  toast.retry?.();
  assert.equal(retried, true);

  const lost = describeAdminMessagesFeedback({
    type: "send_failed",
    message: "Network error.",
    restored: false,
  });
  assert.match(lost?.description ?? "", /Nothing was sent/);
  assert.equal(lost?.retry, undefined);
});

test("thread load failures are not toasted (inline notice covers them)", () => {
  assert.equal(
    describeAdminMessagesFeedback({ type: "load_failed", scope: "thread", message: "x" }),
    null,
  );
  const contacts = describeAdminMessagesFeedback({
    type: "load_failed",
    scope: "contacts",
    message: "x",
  });
  assert.equal(contacts?.title, "Couldn't load parents and staff.");
});

test("success and error ids never collide", () => {
  const events: MessagesFeedbackEvent[] = [
    { type: "conversation_started", name: "Ava" },
    { type: "edited" },
    { type: "deleted" },
    { type: "delete_failed", message: "x" },
    { type: "load_failed", scope: "contacts", message: "x" },
    { type: "load_failed", scope: "start_conversation", message: "x" },
    { type: "send_failed", message: "x", restored: true },
    { type: "files_rejected", tooLarge: ["a.pdf"], overLimit: [] },
  ];
  const toasts = events.map((event) => describeAdminMessagesFeedback(event)).filter(Boolean);
  for (const toast of toasts) {
    if (toast?.kind === "error") assert.match(toast.id, /-error$/);
    else assert.doesNotMatch(toast?.id ?? "", /-error$/);
  }
});

test("conversation started names the contact", () => {
  assert.equal(
    describeAdminMessagesFeedback({ type: "conversation_started", name: "Ava's family" })?.title,
    "Conversation with Ava's family started.",
  );
});
