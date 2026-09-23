import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  composeEmail,
  emailDigestActivityCard,
  emailDigestSectionHeader,
} from "./email-layout";

describe("committee digest email dark mode", () => {
  it("includes semantic digest classes on section headers and activity cards", () => {
    const section = emailDigestSectionHeader("Calendar");
    const card = emailDigestActivityCard({
      title: "Harvest festival planning meeting",
      actionLabel: "Added",
      details: ["Saturday, September 27, 2026"],
      actorName: "Ms. Taylor Reyes",
      occurredAtLabel: "Yesterday at 3:15 PM",
    });

    assert.match(section, /class="email-digest-section"/);
    assert.match(section, /class="email-digest-section-label"/);
    assert.match(card, /class="email-digest-card"/);
    assert.match(card, /class="email-digest-card-title"/);
    assert.match(card, /class="email-digest-badge"/);
  });

  it("includes dark mode overrides for digest classes in composed email shell", () => {
    const html = composeEmail({
      preheader: "Committee activity update",
      contentHtml: `${emailDigestSectionHeader("Members")}${emailDigestActivityCard({
        title: "Holly Evensen",
        actionLabel: "Invited",
        details: ["Member"],
        actorName: "Julius Cecilia",
        occurredAtLabel: "Yesterday at 2:40 PM",
      })}`,
    });

    assert.match(html, /\.email-digest-section \{/);
    assert.match(html, /\.email-digest-section-label \{/);
    assert.match(html, /\.email-digest-card \{/);
    assert.match(html, /\.email-digest-card-title \{/);
    assert.match(html, /\.email-digest-badge \{/);
    assert.match(html, /prefers-color-scheme: dark/);
    assert.match(html, /#F3F4F6/);
  });
});
