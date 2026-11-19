import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { schoolDemoRegistry } from "@/data/school-demos";
import { listOutreachPlans, outreachPlanRegistry } from "@/data/outreach";
import { outreachWarnings } from "@/lib/admin-crm/outreach-email";

// Every researched plan must pass the same checks the send screen runs, so the
// school-outreach-research skill's output is validated by `npm test`.
describe("outreach plans", () => {
  for (const plan of listOutreachPlans()) {
    describe(plan.slug, () => {
      it("is registered under its own slug and matches a demo", () => {
        assert.equal(outreachPlanRegistry[plan.slug], plan);
        assert.ok(schoolDemoRegistry[plan.slug], `no demo config for ${plan.slug}`);
      });

      it("cites a source for every fact", () => {
        assert.ok(plan.facts.length > 0, "no facts");
        for (const fact of plan.facts) {
          assert.match(fact.url, /^https:\/\//, `fact without an https source: ${fact.fact}`);
          assert.match(fact.readOn, /^\d{4}-\d{2}-\d{2}$/);
        }
        assert.match(plan.researchedAt, /^\d{4}-\d{2}-\d{2}$/);
      });

      it("keeps contact details out of the file", () => {
        const text = JSON.stringify(plan);
        assert.doesNotMatch(text, /[\w.+-]+@[\w-]+\.[\w.]+/, "email address in plan");
        assert.doesNotMatch(text, /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/, "phone number in plan");
      });

      if (plan.doNotEmail) {
        it("has no steps when marked do-not-email", () => {
          assert.equal(plan.steps.length, 0);
        });
        return;
      }

      it("has a first email, a recipient and steps in business-day order", () => {
        assert.ok(plan.recipient.firstName, "recipient first name missing");
        assert.equal(plan.steps[0]?.id, "first");
        assert.equal(plan.steps[0]?.businessDay, 0);
        const ids = plan.steps.map((s) => s.id);
        assert.equal(new Set(ids).size, ids.length, "duplicate step ids");
        for (let i = 1; i < plan.steps.length; i += 1) {
          assert.ok(plan.steps[i].businessDay > plan.steps[i - 1].businessDay, "steps out of order");
        }
      });

      it("greets the recipient by first name and signs as Julius", () => {
        for (const step of plan.steps.filter((s) => s.kind === "email")) {
          assert.ok(step.body.startsWith(`Hi ${plan.recipient.firstName},`), `${step.id} greeting`);
          assert.ok(step.body.trimEnd().endsWith("Julius"), `${step.id} sign-off`);
        }
      });

      it("passes the content checks with no warnings", () => {
        for (const step of plan.steps) {
          const warnings = outreachWarnings({
            stepId: step.id,
            subject: step.kind === "email" ? step.subject : undefined,
            body: step.body,
            allowFillIns: true,
          });
          assert.deepEqual(warnings, [], `${plan.slug} ${step.id}: ${warnings.map((w) => w.message).join(" ")}`);
        }
      });

      it("names MudKitchen in the first email", () => {
        const first = plan.steps.find((s) => s.id === "first");
        assert.ok(first?.body.includes("MudKitchen"), "first email should say what Julius built: MudKitchen");
      });

      it("only gives the first email a subject", () => {
        for (const step of plan.steps) {
          if (step.kind !== "email") continue;
          if (step.id === "first") assert.ok(step.subject);
          else assert.equal(step.subject, undefined, `${step.id} should reply in the thread`);
        }
      });
    });
  }
});
