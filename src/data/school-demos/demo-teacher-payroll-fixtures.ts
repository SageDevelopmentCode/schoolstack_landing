/**
 * Demo-only payroll for the teacher portal marketing demo (Pay & earnings).
 *
 * Every figure is fake and every total is derived from the stub lines, so the
 * numbers on the page always add up. No backend, no real tax maths: the
 * deduction rates below are round illustrative numbers, not withholding rules.
 *
 * The teacher is Jordan Taylor; the demo's "today" is Nov 21, 2026. Jordan
 * subbed for two pay periods in Dec 2025 and joined the staff in Aug 2026,
 * which is why 2026 has six stubs and 2025 has two.
 */

export type DemoPayLine = {
  id: string;
  label: string;
  /** Hours on earnings lines (hours × rate). */
  hours?: number;
  /** Whole cents. */
  amountCents: number;
};

export type DemoPayStub = {
  id: string;
  /** YYYY-MM-DD */
  payDate: string;
  periodStart: string;
  periodEnd: string;
  year: number;
  hours: number;
  earnings: DemoPayLine[];
  deductions: DemoPayLine[];
  grossCents: number;
  deductionsCents: number;
  netCents: number;
  status: "paid";
};

export type DemoTaxDoc = {
  id: "w2-2025" | "w4";
  title: string;
  status: string;
  /** Read-only label / value rows shown in the document dialog. */
  rows: { label: string; value: string }[];
  note: string;
};

export type DemoTeacherPayroll = {
  employee: { name: string; id: string };
  /** Hourly rate in whole cents. */
  rateCents: number;
  /** YYYY-MM-DD */
  nextPayday: string;
  currentPeriod: { start: string; end: string; hoursSoFar: number };
  /** Newest first. */
  stubs: DemoPayStub[];
  ytd: { year: number; grossCents: number; netCents: number; deductionsCents: number; hours: number; stubCount: number };
  deposit: { accountType: string; last4: string; percent: number };
  taxDocs: DemoTaxDoc[];
};

/** Fake hourly rate: $24.00. */
const RATE_CENTS = 2400;

/** Illustrative deduction rates (not real withholding). Retirement is pre-tax. */
const RETIREMENT_RATE = 0.04;
const FEDERAL_RATE = 0.1;
const STATE_RATE = 0.04;
const SOCIAL_SECURITY_RATE = 0.062;
const MEDICARE_RATE = 0.0145;

const pct = (cents: number, rate: number) => Math.round(cents * rate);
const sum = (lines: { amountCents: number }[]) => lines.reduce((total, line) => total + line.amountCents, 0);

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const fmt = (cents: number) => money.format(cents / 100);

type StubSeed = { payDate: string; periodStart: string; periodEnd: string; regular: number; prep: number };

/** Semi-monthly periods (1st–15th, 16th–end), paid the next business day-ish. */
const STUB_SEEDS: StubSeed[] = [
  { payDate: "2026-11-16", periodStart: "2026-11-01", periodEnd: "2026-11-15", regular: 78, prep: 6 },
  { payDate: "2026-11-02", periodStart: "2026-10-16", periodEnd: "2026-10-31", regular: 82, prep: 4 },
  { payDate: "2026-10-16", periodStart: "2026-10-01", periodEnd: "2026-10-15", regular: 76, prep: 5 },
  { payDate: "2026-10-01", periodStart: "2026-09-16", periodEnd: "2026-09-30", regular: 80, prep: 4 },
  { payDate: "2026-09-16", periodStart: "2026-09-01", periodEnd: "2026-09-15", regular: 74, prep: 8 },
  { payDate: "2026-09-01", periodStart: "2026-08-16", periodEnd: "2026-08-31", regular: 70, prep: 10 },
  { payDate: "2025-12-16", periodStart: "2025-12-01", periodEnd: "2025-12-15", regular: 32, prep: 0 },
  { payDate: "2025-12-01", periodStart: "2025-11-16", periodEnd: "2025-11-30", regular: 28, prep: 2 },
];

function buildStub(seed: StubSeed): DemoPayStub {
  const earnings: DemoPayLine[] = [
    { id: "regular", label: "Regular hours", hours: seed.regular, amountCents: seed.regular * RATE_CENTS },
  ];
  if (seed.prep > 0) {
    earnings.push({ id: "prep", label: "Prep / PD time", hours: seed.prep, amountCents: seed.prep * RATE_CENTS });
  }
  const grossCents = sum(earnings);
  const retirementCents = pct(grossCents, RETIREMENT_RATE);
  const taxableCents = grossCents - retirementCents;
  const deductions: DemoPayLine[] = [
    { id: "federal", label: "Federal income tax", amountCents: pct(taxableCents, FEDERAL_RATE) },
    { id: "state", label: "State income tax", amountCents: pct(taxableCents, STATE_RATE) },
    { id: "social-security", label: "Social Security", amountCents: pct(grossCents, SOCIAL_SECURITY_RATE) },
    { id: "medicare", label: "Medicare", amountCents: pct(grossCents, MEDICARE_RATE) },
    { id: "retirement", label: "Retirement (4%)", amountCents: retirementCents },
  ];
  const deductionsCents = sum(deductions);
  return {
    id: `stub-${seed.payDate}`,
    payDate: seed.payDate,
    periodStart: seed.periodStart,
    periodEnd: seed.periodEnd,
    year: Number(seed.payDate.slice(0, 4)),
    hours: seed.regular + seed.prep,
    earnings,
    deductions,
    grossCents,
    deductionsCents,
    netCents: grossCents - deductionsCents,
    status: "paid",
  };
}

function lineTotal(stubs: DemoPayStub[], id: string): number {
  return stubs.reduce((total, stub) => total + (stub.deductions.find((line) => line.id === id)?.amountCents ?? 0), 0);
}

export function buildDemoTeacherPayroll(): DemoTeacherPayroll {
  const stubs = STUB_SEEDS.map(buildStub);
  const stubs2026 = stubs.filter((stub) => stub.year === 2026);
  const stubs2025 = stubs.filter((stub) => stub.year === 2025);

  const gross2025 = stubs2025.reduce((total, stub) => total + stub.grossCents, 0);
  const retirement2025 = lineTotal(stubs2025, "retirement");

  return {
    employee: { name: "Jordan Taylor", id: "DEMO-0042" },
    rateCents: RATE_CENTS,
    nextPayday: "2026-12-01",
    currentPeriod: { start: "2026-11-16", end: "2026-11-30", hoursSoFar: 62.5 },
    stubs,
    ytd: {
      year: 2026,
      grossCents: stubs2026.reduce((total, stub) => total + stub.grossCents, 0),
      netCents: stubs2026.reduce((total, stub) => total + stub.netCents, 0),
      deductionsCents: stubs2026.reduce((total, stub) => total + stub.deductionsCents, 0),
      hours: stubs2026.reduce((total, stub) => total + stub.hours, 0),
      stubCount: stubs2026.length,
    },
    deposit: { accountType: "Checking", last4: "1234", percent: 100 },
    taxDocs: [
      {
        id: "w2-2025",
        title: "2025 W-2",
        status: "Ready",
        rows: [
          { label: "Employee", value: "Jordan Taylor" },
          { label: "Wages, tips, other comp. (box 1)", value: fmt(gross2025 - retirement2025) },
          { label: "Federal income tax withheld (box 2)", value: fmt(lineTotal(stubs2025, "federal")) },
          { label: "Social Security wages (box 3)", value: fmt(gross2025) },
          { label: "Social Security withheld (box 4)", value: fmt(lineTotal(stubs2025, "social-security")) },
          { label: "Medicare withheld (box 6)", value: fmt(lineTotal(stubs2025, "medicare")) },
          { label: "State income tax (box 17)", value: fmt(lineTotal(stubs2025, "state")) },
        ],
        note: "Totals from your 2 pay stubs in 2025. Sample figures for the demo only.",
      },
      {
        id: "w4",
        title: "W-4 on file",
        status: "Updated Aug 2026",
        rows: [
          { label: "Employee", value: "Jordan Taylor" },
          { label: "Filing status", value: "Single" },
          { label: "Multiple jobs", value: "No" },
          { label: "Dependents", value: "None" },
          { label: "Extra withholding", value: fmt(0) },
          { label: "Signed", value: "Aug 14, 2026" },
        ],
        note: "Sample W-4 details for the demo only.",
      },
    ],
  };
}
