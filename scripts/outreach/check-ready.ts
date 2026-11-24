/**
 * Is a school's first outreach email ready to send from /admin/research? Read-only.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/outreach/check-ready.ts <demo-slug>
 *
 * Prints a ✓/✗ checklist, the first email, the snapshot preview link and what's still left for Julius.
 * Exits 1 when something blocks the plan itself (not for the postal address or a missing contact email,
 * which are set in the environment or typed in the send screen).
 */
import { spawnSync } from "node:child_process";
import { getOutreachPlan } from "@/data/outreach";
import { isCrmStatus } from "@/lib/admin-crm/crm-status";
import { isOutreachSequenceStoppedByCrmStatus, snapshotPath } from "@/lib/admin-crm/outreach-email";
import { PRODUCTION_SITE_URL } from "@/lib/site";
import {
  SCHOOL_COLUMNS,
  adminClient,
  auditReportExists,
  demoRouteExists,
  hasDemoConfig,
  planFileExists,
  type CrmSchool,
} from "./outreach-script-env";

type Check = { ok: boolean; label: string; blocking: boolean; detail?: string };

function validatorPasses(slug: string): { ok: boolean; detail: string } {
  const run = spawnSync(
    "npx",
    [
      "tsx",
      "--require",
      "./src/test/integration/mock-server-only.cjs",
      "--test",
      "--test-name-pattern",
      slug,
      "src/data/outreach/outreach-plans.test.ts",
    ],
    { encoding: "utf8", env: { ...process.env, NODE_ENV: "test" } },
  );
  const out = `${run.stdout}\n${run.stderr}`;
  const pass = Number(out.match(/ℹ pass (\d+)/)?.[1] ?? 0);
  const fail = Number(out.match(/ℹ fail (\d+)/)?.[1] ?? 1);
  const firstError = out.match(/AssertionError[^\n]*\n?[^\n]*/)?.[0]?.trim();
  return { ok: fail === 0 && pass > 0, detail: fail ? (firstError ?? `${fail} failing`) : `${pass} checks` };
}

async function main() {
  const slug = process.argv[2]?.trim();
  if (!slug) {
    console.error("Usage: check-ready.ts <demo-slug>");
    process.exit(1);
  }

  const { data, error } = await adminClient().from("schools").select(SCHOOL_COLUMNS).eq("demo_slug", slug);
  if (error) throw error;
  const rows = (data ?? []) as CrmSchool[];
  const school = rows[0];
  const plan = getOutreachPlan(slug);
  const status = school && isCrmStatus(school.crm_status) ? school.crm_status : "not_contacted";
  const validation = plan ? validatorPasses(slug) : { ok: false, detail: "no plan" };
  const postal = Boolean((process.env.OUTREACH_POSTAL_ADDRESS ?? process.env.OUTREACH_MAILING_ADDRESS)?.trim());

  const checks: Check[] = [
    { ok: hasDemoConfig(slug) && demoRouteExists(slug), label: "Demo config and /demo route exist", blocking: true },
    { ok: rows.length === 1, label: "One CRM school is linked to this demo", blocking: true, detail: rows.length > 1 ? `${rows.length} rows share it` : undefined },
    { ok: auditReportExists(slug), label: "Site audit report in .site-audits/", blocking: false },
    { ok: planFileExists(slug) && Boolean(plan), label: "Outreach plan written and registered", blocking: true },
    { ok: validation.ok, label: "Plan passes the validator", blocking: true, detail: validation.detail },
    { ok: !plan?.doNotEmail, label: "Not marked do-not-email", blocking: true, detail: plan?.doNotEmail?.reason },
    { ok: !isOutreachSequenceStoppedByCrmStatus(status), label: `CRM status allows sending (${status})`, blocking: true },
    { ok: Boolean(plan?.snapshot), label: "Snapshot written", blocking: false },
    { ok: Boolean(school?.contact_email), label: "Contact email on file in the CRM", blocking: false, detail: "otherwise type it in the send screen" },
    { ok: postal, label: "OUTREACH_POSTAL_ADDRESS is set (required in every cold email)", blocking: false, detail: "set it in .env.local and on Vercel" },
  ];

  console.log(`\n${school?.name ?? slug} · ${slug}\n`);
  for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.label}${!c.ok && c.detail ? ` — ${c.detail}` : ""}`);

  const first = plan?.steps.find((s) => s.id === "first");
  if (first && first.kind === "email") {
    console.log(`\nFirst email · subject: ${first.subject}\n\n${first.body}\n`);
  }
  const path = snapshotPath(plan);
  if (path) console.log(`Snapshot: ${PRODUCTION_SITE_URL}${path}  (preview locally with ?preview=1)`);
  console.log(`Send from: ${PRODUCTION_SITE_URL}/admin/research?demo=${encodeURIComponent(slug)}`);

  const todo = [
    ...(plan?.checkBeforeSending ?? []),
    ...(plan?.steps.some((s) => s.body.includes("{loom link}")) ? ["Record the 60-second Loom of their demo for step 2."] : []),
    ...(postal ? [] : ["Set OUTREACH_POSTAL_ADDRESS (street address, PO box or virtual mailbox)."]),
  ];
  if (todo.length) console.log(`\nBefore sending:\n${todo.map((t) => `- ${t}`).join("\n")}`);

  const blocked = checks.filter((c) => c.blocking && !c.ok);
  console.log(blocked.length ? `\nNOT READY: ${blocked.map((c) => c.label).join("; ")}` : "\nREADY: step 1 can be sent from /admin/research.");
  process.exit(blocked.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
