import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { schoolDemoHref, schoolDemoRegistry } from "@/data/school-demos";
import { listOutreachPlans, outreachPlanRegistry } from "@/data/outreach";
import {
  MUDKITCHEN_CAPABILITIES,
  isCapabilityId,
  isCustomCapability,
  walkthroughCapabilities,
  type CapabilityId,
} from "@/data/outreach/mudkitchen-capabilities";
import { SNAPSHOT_AREAS, SNAPSHOT_LINK_TOKEN } from "@/data/outreach/types";
import * as walkthroughs from "@/data/school-demos/walkthrough-placeholder";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";

/** Judgement words that make a snapshot read as an attack rather than a helpful look. */
const JUDGEMENT_WORDS = /\b(bad|outdated|ugly|poor|terrible|awful|confusing|clunky|broken|amateur|messy|old-fashioned)\b/i;

/** The walkthrough a demo page imports (e.g. `athenaWalkthroughPlaceholder`), or null. */
function demoWalkthrough(slug: string): readonly DemoWalkthroughStep[] | null {
  // Some demos live in a route folder that differs from their slug (e.g. monarch-hills-education → /demo/monarch-hills).
  const page = join(process.cwd(), "src/app", schoolDemoHref(slug).slice(1), "page.tsx");
  if (!existsSync(page)) return null;
  const name = readFileSync(page, "utf8").match(/\b(\w+WalkthroughPlaceholder)\b/)?.[1];
  const steps = name ? (walkthroughs as Record<string, unknown>)[name] : null;
  return Array.isArray(steps) ? (steps as DemoWalkthroughStep[]) : null;
}
import { outreachWarnings } from "@/lib/admin-crm/outreach-email";
import { letterProblems } from "@/lib/admin-crm/outreach-letter";

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

      it("only links the snapshot when the plan has one", () => {
        const usesLink = plan.steps.some((s) => s.body.includes(SNAPSHOT_LINK_TOKEN));
        if (usesLink) assert.ok(plan.snapshot, "{snapshot link} used but the plan has no snapshot");
        const first = plan.steps.find((s) => s.id === "first");
        assert.ok(!first?.body.includes(SNAPSHOT_LINK_TOKEN), "no links in a first email: offer the snapshot instead");
      });

      if (plan.priorContact) {
        it("acknowledges the earlier email in the first email", () => {
          const first = plan.steps.find((s) => s.id === "first");
          assert.ok(plan.priorContact?.when.trim(), "priorContact.when missing");
          assert.ok(first?.body.includes(plan.priorContact!.when), `first email should mention "${plan.priorContact!.when}"`);
        });
      }

      if (plan.snapshot) {
        const snapshot = plan.snapshot;
        it("has a private, sourced snapshot", () => {
          assert.match(snapshot.token, /^[A-Za-z0-9_-]{16,}$/, "snapshot token must be 16+ url-safe characters");
          assert.match(snapshot.preparedOn, /^\d{4}-\d{2}-\d{2}$/);
          assert.ok(snapshot.observations.length >= 4 && snapshot.observations.length <= 8, "4–8 observations");
          for (const o of snapshot.observations) {
            assert.ok((SNAPSHOT_AREAS as readonly string[]).includes(o.area), `unknown area ${o.area}`);
            assert.match(o.url, /^https:\/\//, `observation without an https source: ${o.gap}`);
            assert.match(o.readOn, /^\d{4}-\d{2}-\d{2}$/);
            assert.ok(o.gap.trim() && o.saw.trim() && o.impact.trim() && o.fix.text.trim(), `observation text missing: ${o.gap}`);
            assert.ok(o.gap.length <= 90, `gap headline too long: ${o.gap}`);
            for (const text of [o.gap, o.saw, o.impact]) {
              assert.doesNotMatch(text, JUDGEMENT_WORDS, `judgement word in "${text}": say what a family sees instead`);
            }
          }
          if (snapshot.pageSpeed) {
            assert.ok(snapshot.pageSpeed.mobileScore >= 0 && snapshot.pageSpeed.mobileScore <= 100);
            assert.match(snapshot.pageSpeed.url, /^https:\/\//);
            assert.match(snapshot.pageSpeed.checkedOn, /^\d{4}-\d{2}-\d{2}$/);
          }
        });

        if (snapshot.toolStack) {
          const tools = snapshot.toolStack;
          it("lists 2+ sourced tools, with network tools flagged for review", () => {
            assert.ok(tools.length >= 2, "only show a tool stack with 2 or more tools");
            const names = tools.map((t) => t.name.toLowerCase());
            assert.equal(new Set(names).size, names.length, "duplicate tool in toolStack");
            const checks = plan.checkBeforeSending.join("\n").toLowerCase();
            for (const tool of tools) {
              assert.ok(tool.name.trim() && tool.usedFor.trim(), "tool name and usedFor are required");
              assert.match(tool.url, /^https:\/\//, `tool without an https source: ${tool.name}`);
              if (tool.network) {
                assert.ok(
                  checks.includes(`uses ${tool.network.toLowerCase()}'s ${tool.name.toLowerCase()}`),
                  `add "Uses ${tool.network}'s ${tool.name}: decide whether to pitch replacing it" to checkBeforeSending`,
                );
              }
            }
          });
        }

        it("only claims what MudKitchen and their demo really have", () => {
          const steps = demoWalkthrough(plan.slug);
          const inDemo = steps ? walkthroughCapabilities(steps) : new Set<CapabilityId>();
          const checks = plan.checkBeforeSending.join("\n").toLowerCase();
          for (const o of snapshot.observations) {
            assert.ok(o.fix.capabilities.length > 0, `fix without capabilities: ${o.gap}`);
            for (const id of o.fix.capabilities) {
              assert.ok(isCapabilityId(id), `unknown capability "${id}" (see mudkitchen-capabilities.ts)`);
              if (isCustomCapability(id)) {
                assert.equal(o.fix.label, "set_up", `"${id}" is custom work, so label it set_up: ${o.gap}`);
                assert.ok(
                  checks.includes(`we'd build: ${MUDKITCHEN_CAPABILITIES[id].label.toLowerCase()}`),
                  `add "We'd build: ${MUDKITCHEN_CAPABILITIES[id].label}" to checkBeforeSending`,
                );
              }
            }
            if (o.fix.label === "in_demo") {
              assert.ok(steps, `no demo walkthrough found for ${plan.slug}`);
              const missing = o.fix.capabilities.filter((id) => !inDemo.has(id));
              assert.deepEqual(missing, [], `"${o.gap}" is labelled In your demo, but the demo doesn't show ${missing.join(", ")}`);
            } else {
              assert.equal(o.fix.demoPath, undefined, "demoPath only applies to in_demo fixes");
            }
          }
        });
      }

      if (plan.letter) {
        const letter = plan.letter;
        it("has a handwritten letter ready to copy out", () => {
          assert.deepEqual(letterProblems(plan), [], `${plan.slug} letter: ${letterProblems(plan).join(" ")}`);
        });

        it("mentions the letter in the first email", () => {
          const first = plan.steps.find((s) => s.id === "first");
          assert.match(first?.body ?? "", /\b(note|letter)\b/i, "the first email goes out after the letter, so mention it");
        });

        it("uses a letter short code no other plan uses", () => {
          const same = listOutreachPlans().filter((p) => p.letter?.shortCode.toLowerCase() === letter.shortCode.toLowerCase());
          assert.equal(same.length, 1, `short code ${letter.shortCode} is used by ${same.map((p) => p.slug).join(", ")}`);
        });
      }

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

describe("demoWalkthrough", () => {
  it("finds demos whose route folder differs from their slug", () => {
    assert.ok(demoWalkthrough("monarch-hills-education"), "monarch-hills-education should resolve to /demo/monarch-hills");
  });
});

describe("walkthroughCapabilities", () => {
  it("reads the standard 9-step demo conservatively", () => {
    const found = walkthroughCapabilities(walkthroughs.athenaWalkthroughPlaceholder);
    for (const id of ["website-service", "admissions-pipeline", "enrollment-checklist", "parent-billing", "autopay", "attendance", "mobile-app"] as const) {
      assert.ok(found.has(id), `expected ${id}`);
    }
    for (const id of ["tour-self-booking", "calendar", "messaging"] as const) {
      assert.ok(!found.has(id), `did not expect ${id}`);
    }
  });
});
