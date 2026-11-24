import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OutreachPlan } from "@/data/outreach/types";
import {
  addBusinessDays,
  fillSnapshotLink,
  followUpSubject,
  isOutreachSequenceStoppedByCrmStatus,
  nextOutreachStep,
  outreachWarnings,
  renderOutreachEmail,
  snapshotPath,
} from "@/lib/admin-crm/outreach-email";

const plan: OutreachPlan = {
  slug: "x",
  schoolName: "X",
  researchedAt: "2026-11-19",
  recipient: { firstName: "Sam", role: "Founder", source: "site" },
  angle: "test",
  facts: [{ fact: "f", source: "s", url: "https://x.test", readOn: "2026-11-19" }],
  checkBeforeSending: [],
  steps: [
    { id: "first", kind: "email", businessDay: 0, purpose: "p", subject: "a b c", body: "Hi" },
    { id: "follow-1", kind: "email", businessDay: 3, purpose: "p", body: "Hi" },
    { id: "social", kind: "social", businessDay: 5, purpose: "p", where: "IG", body: "Hi" },
    { id: "close", kind: "email", businessDay: 20, purpose: "p", body: "Hi" },
  ],
};

describe("isOutreachSequenceStoppedByCrmStatus", () => {
  it("stops when they replied, advanced the deal, or closed out", () => {
    for (const status of ["replied", "demo_scheduled", "proposal_sent", "won", "not_interested"] as const) {
      assert.equal(isOutreachSequenceStoppedByCrmStatus(status), true, status);
    }
  });

  it("allows in-sequence pipeline statuses", () => {
    for (const status of ["not_contacted", "contacted", "followed_up", "nurturing"] as const) {
      assert.equal(isOutreachSequenceStoppedByCrmStatus(status), false, status);
    }
  });
});

describe("renderOutreachEmail", () => {
  it("adds the legal footer and escapes HTML", () => {
    const { text, html } = renderOutreachEmail({ body: "Hi <Sam>,\n\nLine one\nline two", mailingAddress: "PO Box 1, Round Rock, TX" });
    assert.match(text, /Hi <Sam>,\n\nLine one\nline two\n\n--\nJulius Cecilia · MudKitchen \(trymudkitchen\.com\) · Sage Field, Round Rock, TX · PO Box 1, Round Rock, TX\nIf this isn't useful/);
    assert.match(html, /Hi &lt;Sam&gt;,/);
    assert.match(html, /Line one<br>line two/);
    assert.doesNotMatch(html, /<img/);
  });

  it("turns bare URLs into links", () => {
    const { html } = renderOutreachEmail({ body: "See https://www.loom.com/share/abc ok", mailingAddress: "A" });
    assert.match(html, /<a href="https:\/\/www\.loom\.com\/share\/abc">/);
  });
});

describe("followUpSubject", () => {
  it("prefixes Re: once", () => {
    assert.equal(followUpSubject("TEFA families at Athena"), "Re: TEFA families at Athena");
    assert.equal(followUpSubject("Re: hi there"), "Re: hi there");
  });
});

describe("outreachWarnings", () => {
  const longBody = Array.from({ length: 70 }, () => "word").join(" ");

  it("blocks leftover placeholders unless they're allowed fill-ins", () => {
    const send = outreachWarnings({ stepId: "follow-1", body: `${longBody.slice(0, 120)} {loom link} {school}` });
    assert.ok(send.some((w) => w.code === "placeholder" && w.level === "block"));
    const plan = outreachWarnings({ stepId: "follow-1", body: `${longBody.slice(0, 120)} {loom link}`, allowFillIns: true });
    assert.equal(plan.filter((w) => w.code === "placeholder").length, 0);
  });

  it("checks first-email subject, length, links and stock phrases", () => {
    const codes = outreachWarnings({ stepId: "first", subject: "Re: hi", body: "Quick question https://a.test https://b.test" }).map((w) => w.code);
    assert.deepEqual(new Set(codes), new Set(["subject", "length", "links", "stock_phrase"]));
    assert.deepEqual(outreachWarnings({ stepId: "first", subject: "three word subject", body: longBody }), []);
  });

  it("caps social notes at 200 characters", () => {
    assert.equal(outreachWarnings({ stepId: "social", body: "x".repeat(201) })[0]?.code, "length");
  });
});

describe("addBusinessDays", () => {
  it("skips weekends", () => {
    // Thu Nov 19 2026 + 3 business days = Tue Nov 24
    const d = addBusinessDays(new Date(2026, 10, 19, 10).toISOString(), 3);
    assert.equal(d.getDate(), 24);
    assert.equal(d.getHours(), 9);
  });
});

describe("nextOutreachStep", () => {
  const sentThu = new Date(2026, 10, 19, 10).toISOString();

  it("needs research without a plan, and stops for do-not-email", () => {
    assert.equal(nextOutreachStep({ plan: null, completed: [], crmStatus: "not_contacted" }).stage, "needs_research");
    assert.equal(
      nextOutreachStep({ plan: { ...plan, doNotEmail: { reason: "paused" }, steps: [] }, completed: [], crmStatus: "not_contacted" }).stage,
      "do_not_email",
    );
  });

  it("is ready before the first email, then waiting, then due", () => {
    assert.equal(nextOutreachStep({ plan, completed: [], crmStatus: "not_contacted" }).stage, "ready");
    const completed = [{ stepId: "first", at: sentThu }];
    const waiting = nextOutreachStep({ plan, completed, crmStatus: "contacted", now: new Date(2026, 10, 23, 12) });
    assert.equal(waiting.stage, "waiting");
    assert.equal(waiting.step?.id, "follow-1");
    const due = nextOutreachStep({ plan, completed, crmStatus: "contacted", now: new Date(2026, 10, 24, 8) });
    assert.equal(due.stage, "due");
  });

  it("moves through steps, including a logged social note, then closes", () => {
    const completed = [
      { stepId: "first", at: sentThu },
      { stepId: "follow-1", at: sentThu },
    ];
    assert.equal(nextOutreachStep({ plan, completed, crmStatus: "followed_up" }).step?.id, "social");
    const all = [...completed, { stepId: "social", at: sentThu }, { stepId: "close", at: sentThu }];
    assert.equal(nextOutreachStep({ plan, completed: all, crmStatus: "nurturing" }).stage, "closed");
  });

  it("files replied and won schools by status even without a plan", () => {
    assert.equal(nextOutreachStep({ plan: null, completed: [], crmStatus: "replied" }).stage, "replied");
    assert.equal(nextOutreachStep({ plan: null, completed: [], crmStatus: "won" }).stage, "closed");
  });

  it("stops the sequence once they reply or the deal closes", () => {
    const completed = [{ stepId: "first", at: sentThu }];
    assert.equal(nextOutreachStep({ plan, completed, crmStatus: "replied" }).stage, "replied");
    assert.equal(nextOutreachStep({ plan, completed, crmStatus: "demo_scheduled" }).stage, "replied");
    assert.equal(nextOutreachStep({ plan, completed, crmStatus: "not_interested" }).stage, "closed");
  });
});

describe("fillSnapshotLink", () => {
  const plan = { slug: "athena-microacademy", snapshot: { token: "abcDEF123_-xyz789", preparedOn: "2026-11-22", observations: [] } };

  it("fills the snapshot URL from the plan", () => {
    assert.equal(snapshotPath(plan), "/snapshot/athena-microacademy/abcDEF123_-xyz789");
    assert.equal(
      fillSnapshotLink("Here it is: {snapshot link}", plan, "https://trymudkitchen.com/"),
      "Here it is: https://trymudkitchen.com/snapshot/athena-microacademy/abcDEF123_-xyz789",
    );
  });

  it("leaves the token when there's no snapshot, so the send is blocked", () => {
    const body = fillSnapshotLink("Here: {snapshot link}", { slug: "x" }, "https://trymudkitchen.com");
    assert.equal(body, "Here: {snapshot link}");
    assert.ok(outreachWarnings({ stepId: "follow-2", body }).some((w) => w.code === "placeholder"));
  });
});
