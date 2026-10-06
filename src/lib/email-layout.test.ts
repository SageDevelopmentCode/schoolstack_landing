import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  composeEmail,
  emailDigestActivityCard,
  emailDigestSectionHeader,
} from "./email-layout";
import { PRODUCTION_SITE_URL } from "./site";

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

describe("composeEmail siteUrl", () => {
  it("uses an explicit siteUrl for logo and footer links", () => {
    const customBase = "https://preview.example.com";
    const html = composeEmail({
      preheader: "Test",
      contentHtml: "<p>Body</p>",
      siteUrl: customBase,
    });

    assert.match(html, new RegExp(`src="${customBase}/images/Logo.png"`));
    assert.match(html, new RegExp(`href="${customBase}"`));
    assert.match(html, />preview\.example\.com</);
    assert.doesNotMatch(html, /trymudkitchen\.com/);
  });

  it("defaults to production logo when env is localhost and siteUrl omitted", () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    try {
      const html = composeEmail({
        preheader: "Test",
        contentHtml: "<p>Body</p>",
      });
      assert.match(
        html,
        new RegExp(`src="${PRODUCTION_SITE_URL}/images/Logo.png"`),
      );
      assert.doesNotMatch(html, /localhost/);
    } finally {
      if (previous === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = previous;
      }
    }
  });

  it("defaults header links to production when siteUrl is omitted", () => {
    const html = composeEmail({
      preheader: "Test",
      contentHtml: "<p>Body</p>",
      siteUrl: PRODUCTION_SITE_URL,
    });

    assert.match(
      html,
      new RegExp(`src="${PRODUCTION_SITE_URL}/images/Logo.png"`),
    );
  });
});
