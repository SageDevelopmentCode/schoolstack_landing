import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildContactEmailSearchKey,
  messageInvolvesContact,
  parseZohoMessageTime,
} from "@/lib/zoho-email-thread";

describe("zoho-email-thread helpers", () => {
  it("buildContactEmailSearchKey uses sender, to, and cc with Zoho OR syntax", () => {
    assert.equal(
      buildContactEmailSearchKey("parent@example.com"),
      "sender:parent@example.com::or:to:parent@example.com::or:cc:parent@example.com",
    );
    assert.equal(
      buildContactEmailSearchKey("  Parent@Example.com  "),
      "sender:Parent@Example.com::or:to:Parent@Example.com::or:cc:Parent@Example.com",
    );
  });

  it("parseZohoMessageTime reads Zoho search API timestamp fields", () => {
    assert.equal(parseZohoMessageTime({ receivedtime: 1425388373920 }), 1425388373920);
    assert.equal(parseZohoMessageTime({ receivedTime: 1000 }), 1000);
    assert.equal(parseZohoMessageTime({ sentDateInGMT: 2000 }), 2000);
    assert.equal(parseZohoMessageTime({ time: 3000 }), 3000);
    assert.equal(parseZohoMessageTime({ receivedtime: "4500" }), 4500);
    assert.equal(parseZohoMessageTime({}), null);
  });

  it("messageInvolvesContact matches from, to, or cc (case-insensitive)", () => {
    assert.equal(
      messageInvolvesContact(
        { fromAddress: "Parent@Example.com", toAddress: "office@school.org" },
        "parent@example.com",
      ),
      true,
    );
    assert.equal(
      messageInvolvesContact(
        { fromAddress: "office@school.org", toAddress: "Parent@Example.com" },
        "parent@example.com",
      ),
      true,
    );
    assert.equal(
      messageInvolvesContact(
        {
          fromAddress: "office@school.org",
          toAddress: "other@example.com",
          ccAddress: "Parent@Example.com",
        },
        "parent@example.com",
      ),
      true,
    );
    assert.equal(
      messageInvolvesContact(
        { fromAddress: "julius@trymudkitchen.com", toAddress: "other@example.com" },
        "parent@example.com",
      ),
      false,
    );
  });
});
