import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MessageThreadDetail } from "./types";
import {
  threadSummaryFromDetail,
  upsertThreadSummary,
} from "./thread-placeholders";

const sampleDetail: MessageThreadDetail = {
  id: "thread-1",
  programId: "program-1",
  subject: null,
  title: "Cecilia Family",
  subtitle: "Co-op family",
  color: "#4A6354",
  lastMessagePreview: "Yo!",
  lastMessageAt: "2026-09-05T05:17:17.727Z",
  lastMessageTimeLabel: "10:17 PM",
  unreadCount: 0,
  participants: [],
  messages: [
    {
      id: "msg-1",
      threadId: "thread-1",
      body: "Yo!",
      senderUserId: "user-1",
      senderKind: "guardian",
      senderName: "Julius Cecilia",
      isOwn: true,
      createdAt: "2026-09-05T05:17:17.727Z",
      timeLabel: "10:17 PM",
      attachments: [],
    },
  ],
};

describe("threadSummaryFromDetail", () => {
  it("strips messages from thread detail", () => {
    const summary = threadSummaryFromDetail(sampleDetail);
    assert.equal(summary.id, "thread-1");
    assert.equal(summary.title, "Cecilia Family");
    assert.equal("messages" in summary, false);
  });
});

describe("upsertThreadSummary", () => {
  it("prepends a new thread summary", () => {
    const summary = threadSummaryFromDetail(sampleDetail);
    const next = upsertThreadSummary([], summary);
    assert.equal(next.length, 1);
    assert.equal(next[0]?.id, "thread-1");
  });

  it("updates an existing thread summary in place", () => {
    const summary = threadSummaryFromDetail(sampleDetail);
    const existing = { ...summary, lastMessagePreview: "Old" };
    const updated = { ...summary, lastMessagePreview: "Yo!" };
    const next = upsertThreadSummary([existing], updated);
    assert.equal(next.length, 1);
    assert.equal(next[0]?.lastMessagePreview, "Yo!");
  });
});
