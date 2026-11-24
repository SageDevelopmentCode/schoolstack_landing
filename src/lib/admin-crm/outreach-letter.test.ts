import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OutreachPlan } from "@/data/outreach/types";
import { letterMailedAt, letterNeedsAddress, letterProblems, letterShortUrlLabel } from "@/lib/admin-crm/outreach-letter";

const body = `Hi Ana,

${"word ".repeat(80).trim()} My fiancée and I run Sage Field in Round Rock.

Julius`;

const plan: Pick<OutreachPlan, "letter" | "snapshot"> = {
  snapshot: { token: "abcdefghijklmnop", preparedOn: "2026-11-22", observations: [] },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Demo",
        founder: { fullName: "Ana Diaz", firstName: "Ana", role: "Founder", source: "About", url: "https://example.com/about" },
    mailTo: { lines: ["1 Main St", "Austin, TX 78701"], source: "Contact", url: "https://example.com/contact" },
    founderFacts: [{ fact: "Ana started with six kids.", source: "Podcast", url: "https://example.com/ep", readOn: "2026-11-22" }],
    hook: "Ana started with six kids.",
    body,
    postscript: "The card inside has your demo in MudKitchen.",
    stickyNote: "Ana, this one is worth two minutes. J",
    shortCode: "ana-k7p2",
    checkBeforeMailing: [],
  },
};

describe("letterProblems", () => {
  it("passes a well-formed letter", () => {
    assert.deepEqual(letterProblems(plan), []);
  });

  it("flags links, stock phrases, a second MudKitchen and a long sticky note", () => {
    const problems = letterProblems({
      ...plan,
      letter: {
        ...plan.letter!,
        body: body.replace("My fiancée", "I hope this letter finds you well. MudKitchen at trymudkitchen.com. My fiancée"),
        stickyNote: "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen",
      },
    });
    const text = problems.join(" ");
    assert.match(text, /No links/);
    assert.match(text, /templated/);
    assert.match(text, /MudKitchen at most once/);
    assert.match(text, /Sticky note/);
  });

  it("needs a P.S. that points to the card", () => {
    assert.match(letterProblems({ ...plan, letter: { ...plan.letter!, postscript: "" } }).join(" "), /P\.S\./);
    assert.match(letterProblems({ ...plan, letter: { ...plan.letter!, postscript: "Coffee soon." } }).join(" "), /card/);
  });

  it("allows a letter whose address is still to find, but checks an address once it's there", () => {
    assert.deepEqual(letterProblems({ ...plan, letter: { ...plan.letter!, mailTo: null } }), []);
    assert.equal(letterNeedsAddress({ mailTo: null }), true);
    assert.equal(letterNeedsAddress(plan.letter!), false);
    const partial = { lines: ["1 Main St"], source: "Contact", url: "https://example.com/contact" };
    assert.match(letterProblems({ ...plan, letter: { ...plan.letter!, mailTo: partial } }).join(" "), /street line and a city line/);
  });

  it("needs a snapshot for the QR card and a hook that is a founder fact", () => {
    const problems = letterProblems({ snapshot: undefined, letter: { ...plan.letter!, hook: "something else" } }).join(" ");
    assert.match(problems, /needs one/);
    assert.match(problems, /hook/);
  });
});

describe("letterMailedAt", () => {
  it("uses the earliest outbound mail touch", () => {
    const at = letterMailedAt([
      { channel: "email", direction: "outbound", occurredAt: "2026-11-01T10:00:00Z" },
      { channel: "mail", direction: "outbound", occurredAt: "2026-12-02T10:00:00Z" },
      { channel: "mail", direction: "outbound", occurredAt: "2026-11-30T10:00:00Z" },
      { channel: "mail", direction: "inbound", occurredAt: "2026-11-20T10:00:00Z" },
    ]);
    assert.equal(at, "2026-11-30T10:00:00Z");
    assert.equal(letterMailedAt([]), null);
  });
});

describe("letterShortUrlLabel", () => {
  it("prints the short link without the scheme", () => {
    assert.equal(letterShortUrlLabel("ana-k7p2", "https://trymudkitchen.com/"), "trymudkitchen.com/hi/ana-k7p2");
  });
});
