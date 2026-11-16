import assert from "node:assert/strict";
import test from "node:test";
import {
  describeTeacherMessagesFeedback,
  TEACHER_MESSAGES_ERROR_FOR_SUCCESS,
} from "./teacher-messages-feedback";

test("starting a conversation speaks to the teacher, not the school office", () => {
  const toast = describeTeacherMessagesFeedback({ type: "conversation_started", name: "Rivera Family" });
  assert.equal(toast?.kind, "success");
  assert.equal(toast?.title, "Conversation with Rivera Family started.");
  assert.ok(!toast?.description?.includes("school office"));
});

test("failed send keeps the retry and says the text is safe", () => {
  const retry = () => {};
  const toast = describeTeacherMessagesFeedback({
    type: "send_failed",
    message: "Network error.",
    restored: true,
    retry,
  });
  assert.equal(toast?.kind, "error");
  assert.equal(toast?.id, "teacher-messages-send-error");
  assert.equal(toast?.retry, retry);
  assert.match(toast?.description ?? "", /still in the box/);
});

test("contacts failure names families and colleagues", () => {
  const toast = describeTeacherMessagesFeedback({ type: "load_failed", scope: "contacts", message: "Oops." });
  assert.equal(toast?.id, "teacher-messages-contacts-error");
  assert.match(toast?.title ?? "", /families and colleagues/);
});

test("a thread that fails to open is inline only", () => {
  assert.equal(describeTeacherMessagesFeedback({ type: "load_failed", scope: "thread", message: "x" }), null);
});

test("success ids clear their teacher error ids", () => {
  assert.equal(
    TEACHER_MESSAGES_ERROR_FOR_SUCCESS["teacher-messages-conversation-started"],
    "teacher-messages-start-error",
  );
  assert.equal(TEACHER_MESSAGES_ERROR_FOR_SUCCESS["teacher-messages-deleted"], "teacher-messages-delete-error");
});
