import assert from "node:assert/strict";
import test from "node:test";
import {
  describeParentMessagesFeedback,
  MAX_ATTACHMENT_MB_LABEL,
  MAX_ATTACHMENTS,
} from "./parent-messages-feedback";
import {
  isParentGardenMessagesVariant,
  isSplitPaneMessagesVariant,
  isStoryMessagesVariant,
} from "./messages-layout-variant";

test("parent-garden is a split-pane story variant, and parent-story stays separate", () => {
  assert.equal(isSplitPaneMessagesVariant("parent-garden"), true);
  assert.equal(isStoryMessagesVariant("parent-garden"), true);
  assert.equal(isParentGardenMessagesVariant("parent-garden"), true);
  assert.equal(isParentGardenMessagesVariant("parent-story"), false);
  assert.equal(isParentGardenMessagesVariant("admin-story"), false);
});

test("attachment limit labels come from the real limits", () => {
  assert.equal(MAX_ATTACHMENT_MB_LABEL, "10 MB");
  assert.equal(MAX_ATTACHMENTS, 5);
});

test("failed send tells the parent their message was restored", () => {
  const restored = describeParentMessagesFeedback({
    type: "send_failed",
    message: "Failed to send message.",
    restored: true,
  });
  assert.equal(restored.kind, "error");
  assert.equal(restored.title, "Message not sent");
  assert.match(restored.description ?? "", /back in the box/);

  const notRestored = describeParentMessagesFeedback({
    type: "send_failed",
    message: "Failed to send message.",
    restored: false,
  });
  assert.equal(notRestored.description, "Failed to send message.");
});

test("conversation started names the contact", () => {
  const toast = describeParentMessagesFeedback({
    type: "conversation_started",
    name: "Ms. Rivera",
  });
  assert.equal(toast.kind, "success");
  assert.equal(toast.title, "Conversation with Ms. Rivera is ready");
});

test("rejected files explain size and count limits", () => {
  const single = describeParentMessagesFeedback({
    type: "files_rejected",
    tooLarge: ["scan.pdf"],
    overLimit: [],
  });
  assert.equal(single.title, "File too large");
  assert.equal(single.description, "“scan.pdf” is over 10 MB.");

  const mixed = describeParentMessagesFeedback({
    type: "files_rejected",
    tooLarge: ["a.pdf", "b.pdf"],
    overLimit: ["c.png"],
  });
  assert.equal(mixed.title, "Some files weren’t attached");
  assert.equal(
    mixed.description,
    "2 files are over 10 MB. 1 file wasn’t added — you can attach up to 5 files per message.",
  );
});

test("load failures name what could not load", () => {
  assert.equal(
    describeParentMessagesFeedback({ type: "load_failed", scope: "contacts", message: "x" }).title,
    "Couldn’t load who you can message",
  );
  assert.equal(
    describeParentMessagesFeedback({ type: "load_failed", scope: "thread", message: "x" }).title,
    "Couldn’t open that conversation",
  );
});
