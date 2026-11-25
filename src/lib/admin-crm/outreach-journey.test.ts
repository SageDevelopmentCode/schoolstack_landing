import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OutreachPlan } from "@/data/outreach/types";
import { funnelCounts, outreachJourney } from "@/lib/admin-crm/outreach-journey";

const plan: OutreachPlan = {
  slug: "demo",
  schoolName: "Demo School",
  researchedAt: "2026-11-22",
  recipient: { firstName: "Ana", role: "Founder", source: "site" },
  angle: "test",
  facts: [],
  checkBeforeSending: [],
  priorContact: { when: "June", what: "first email" },
  steps: [
    { id: "first", kind: "email", businessDay: 0, purpose: "", subject: "a b", body: "Hi" },
    { id: "follow-1", kind: "email", businessDay: 3, purpose: "", body: "Hi {loom link}" },
    { id: "social", kind: "social", businessDay: 5, purpose: "", where: "Instagram", body: "Hi" },
    { id: "follow-2", kind: "email", businessDay: 8, purpose: "", body: "Hi {snapshot link}" },
    { id: "close", kind: "email", businessDay: 20, purpose: "", body: "Hi" },
  ],
};

// Monday 2026-11-23, 9am local.
const monday = new Date(2026, 10, 23, 9, 0, 0);

describe("outreachJourney", () => {
  it("starts a re-contact plan at a ready Re-intro", () => {
    const j = outreachJourney({ plan, completed: [], crmStatus: "contacted", hasDemo: true, now: monday });
    assert.equal(j.stage, "step:first");
    assert.equal(j.next?.label, "Re-intro");
    assert.equal(j.actionable, true);
    assert.equal(j.due, false);
    assert.equal(j.isRecontact, true);
    assert.deepEqual(j.steps.map((s) => s.status), ["current", "upcoming", "upcoming", "upcoming", "upcoming"]);
    assert.equal(j.steps[3].label, "Snapshot & proof");
  });

  it("waits, then marks the walkthrough due three business days later", () => {
    const completed = [{ stepId: "first", at: monday.toISOString() }];
    const waiting = outreachJourney({ plan, completed, crmStatus: "contacted", hasDemo: true, now: monday });
    assert.equal(waiting.stage, "step:follow-1");
    assert.equal(waiting.actionable, false);
    assert.equal(waiting.steps[0].status, "done");
    assert.ok(waiting.next?.dueAt);

    const thursday = new Date(2026, 10, 26, 10, 0, 0);
    const due = outreachJourney({ plan, completed, crmStatus: "followed_up", hasDemo: true, now: thursday });
    assert.equal(due.due, true);
    assert.equal(due.actionable, true);
  });

  it("puts the handwritten letter before the first email, then holds the email five business days", () => {
    const withLetter: OutreachPlan = {
      ...plan,
      letter: {
        writtenOn: "2026-11-22",
        shortSchoolName: "Demo",
        founder: { fullName: "Ana Diaz", firstName: "Ana", role: "Founder", source: "site", url: "https://example.com" },
        mailTo: { lines: ["1 Main St", "Austin, TX 78701"], source: "site", url: "https://example.com" },
        founderFacts: [],
        hook: "",
        body: "Hi Ana,",
        postscript: "",
        stickyNote: "",
        shortCode: "ana-k7p2",
        checkBeforeMailing: [],
      },
    };

    const toWrite = outreachJourney({ plan: withLetter, completed: [], crmStatus: "contacted", hasDemo: true, now: monday });
    assert.equal(toWrite.stage, "letter");
    assert.equal(toWrite.actionable, true);
    assert.deepEqual(toWrite.letter, { readyAt: null, mailedAt: null, firstEmailDueAt: null });

    // "Ready to mail" is display only: same stage, still actionable, no email clock yet.
    const readyAt = monday.toISOString();
    const ready = outreachJourney({ plan: withLetter, completed: [], crmStatus: "contacted", hasDemo: true, letterReadyAt: readyAt, now: monday });
    assert.equal(ready.stage, "letter");
    assert.equal(ready.actionable, true);
    assert.deepEqual(ready.letter, { readyAt, mailedAt: null, firstEmailDueAt: null });

    const mailed = outreachJourney({
      plan: withLetter,
      completed: [],
      crmStatus: "contacted",
      hasDemo: true,
      letterMailedAt: monday.toISOString(),
      now: monday,
    });
    assert.equal(mailed.stage, "step:first");
    assert.equal(mailed.actionable, false);
    // Monday + 5 business days = the next Monday.
    assert.equal(new Date(mailed.letter!.firstEmailDueAt!).getDate(), 30);

    const nextMonday = new Date(2026, 10, 30, 10, 0, 0);
    const due = outreachJourney({
      plan: withLetter,
      completed: [],
      crmStatus: "contacted",
      hasDemo: true,
      letterMailedAt: monday.toISOString(),
      now: nextMonday,
    });
    assert.equal(due.actionable, true);
    assert.equal(due.due, true);

    const plain = outreachJourney({ plan, completed: [], crmStatus: "contacted", hasDemo: true, now: monday });
    assert.equal(plain.letter, null);
  });

  it("puts replies and closed deals in their outcome lane", () => {
    assert.equal(outreachJourney({ plan, completed: [], crmStatus: "replied", hasDemo: true }).stage, "replied");
    assert.equal(outreachJourney({ plan, completed: [], crmStatus: "demo_scheduled", hasDemo: true }).stage, "call_booked");
    assert.equal(outreachJourney({ plan, completed: [], crmStatus: "not_interested", hasDemo: true }).stage, "not_interested");
  });

  it("sorts schools without a plan by what they need", () => {
    assert.equal(outreachJourney({ plan: null, completed: [], crmStatus: "contacted", hasDemo: true }).stage, "needs_plan");
    assert.equal(outreachJourney({ plan: null, completed: [], crmStatus: "contacted", hasDemo: false }).stage, "needs_demo");
    assert.equal(outreachJourney({ plan: null, completed: [], crmStatus: "not_contacted", hasDemo: false }).stage, "not_started");
    assert.equal(outreachJourney({ plan: null, completed: [], crmStatus: "nurturing", hasDemo: false }).stage, "nurturing");
  });

  it("finishes after the close and honours do-not-email", () => {
    const completed = plan.steps.map((s) => ({ stepId: s.id, at: monday.toISOString() }));
    assert.equal(outreachJourney({ plan, completed, crmStatus: "followed_up", hasDemo: true }).stage, "finished");
    const paused = { ...plan, doNotEmail: { reason: "paused" }, steps: [] };
    assert.equal(outreachJourney({ plan: paused, completed: [], crmStatus: "contacted", hasDemo: true }).stage, "do_not_email");
  });
});

describe("funnelCounts", () => {
  it("counts each lane and what can be worked today", () => {
    const journeys = [
      outreachJourney({ plan, completed: [], crmStatus: "contacted", hasDemo: true, now: monday }),
      outreachJourney({ plan, completed: [], crmStatus: "contacted", hasDemo: true, now: monday }),
      outreachJourney({ plan: null, completed: [], crmStatus: "contacted", hasDemo: true }),
    ];
    const counts = funnelCounts(journeys);
    assert.deepEqual(counts["step:first"], { total: 2, actionable: 2 });
    assert.deepEqual(counts.needs_plan, { total: 1, actionable: 0 });
    assert.deepEqual(counts.won, { total: 0, actionable: 0 });
  });
});
