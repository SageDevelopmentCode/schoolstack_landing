"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight, Download, FileText, Landmark, ReceiptText } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import DemoSchoolTeacherStoryProvider from "@/components/demo/shared/DemoSchoolTeacherStoryProvider";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { GCountUp, PORTAL_EASE, gFade } from "@/components/school-parent/garden/motion";
import {
  DateStamp,
  GCard,
  GChip,
  GTabBar,
  G_FOCUS,
  gBtnOnAccent,
  gBtnOutlineSm,
  gBtnPopSm,
  type GTabBarItem,
} from "@/components/school-parent/garden/ui";
import { resolveDemoSchoolName } from "@/data/school-demos/demo-portal-shared";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import {
  buildDemoTeacherPayroll,
  type DemoPayLine,
  type DemoPayStub,
  type DemoTaxDoc,
  type DemoTeacherPayroll,
} from "@/data/school-demos/demo-teacher-payroll-fixtures";

/**
 * Demo-only "Pay & earnings" page for the teacher portal marketing demo
 * (teacher Garden rules: no header kicker, one toy button, one dark card,
 * every number leads somewhere). Fixtures + local state only: no backend,
 * downloads and pay-detail changes are disabled in preview.
 */

type PayrollTab = "hours";

const MONEY = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const MONEY_WHOLE = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const money = (cents: number) => MONEY.format(cents / 100);
const hoursText = (hours: number) => hours.toLocaleString("en-US", { maximumFractionDigits: 2 });

function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "Nov 16, 2026" */
function longDate(key: string): string {
  return parseDay(key).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** "Nov 1 – 15" (or "Nov 16 – Dec 1" across months), optionally with the year. */
function periodLabel(start: string, end: string, withYear = false): string {
  const s = parseDay(start);
  const e = parseDay(end);
  const month = (d: Date) => d.toLocaleDateString("en-US", { month: "short" });
  const tail = s.getMonth() === e.getMonth() ? `${e.getDate()}` : `${month(e)} ${e.getDate()}`;
  return `${month(s)} ${s.getDate()} – ${tail}${withYear ? `, ${e.getFullYear()}` : ""}`;
}

const STUB_SECTION_ID = "demo-teacher-payroll-stubs";

export default function DemoTeacherPayrollPage({ onNavigate }: { onNavigate?: (tab: PayrollTab) => void }) {
  return (
    <DemoSchoolTeacherStoryProvider>
      <PayrollView onNavigate={onNavigate} />
    </DemoSchoolTeacherStoryProvider>
  );
}

function PayrollView({ onNavigate }: { onNavigate?: (tab: PayrollTab) => void }) {
  const { theme } = useParentTheme();
  const reduce = useReducedMotion() === true;
  const payroll = useMemo(() => buildDemoTeacherPayroll(), []);
  const schoolName = resolveDemoSchoolName();
  const years = useMemo(
    () => Array.from(new Set(payroll.stubs.map((stub) => stub.year))).sort((a, b) => b - a),
    [payroll.stubs],
  );
  const [year, setYear] = useState(String(years[0]));
  const [openStubId, setOpenStubId] = useState<string | null>(null);
  const [openDocId, setOpenDocId] = useState<DemoTaxDoc["id"] | null>(null);
  const stubsRef = useRef<HTMLElement>(null);

  const latestStub = payroll.stubs[0];
  const openStub = payroll.stubs.find((stub) => stub.id === openStubId) ?? null;
  const openDoc = payroll.taxDocs.find((doc) => doc.id === openDocId) ?? null;
  const reviewHours = onNavigate ? () => onNavigate("hours") : undefined;

  const showStubsForYear = (targetYear: number) => {
    setYear(String(targetYear));
    const el = stubsRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
  };

  return (
    <>
      <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
        <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid="demo-teacher-payroll-page">
          <ParentGardenPageHeader
            title={
              <>
                Pay &amp; <span className="text-[var(--sf-clay)]">earnings</span>
              </>
            }
            subtitle={`Pay stubs and earnings from ${schoolName}.`}
            actions={
              <button
                type="button"
                className={gBtnPopSm}
                onClick={() => setOpenStubId(latestStub.id)}
                data-testid="demo-teacher-payroll-latest-stub"
              >
                <ReceiptText className="h-4 w-4" aria-hidden />
                View latest stub
              </button>
            }
          />

          <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
            <div className="flex min-w-0 flex-col gap-5">
              <NextPaydayStrip payroll={payroll} reduce={reduce} onReviewHours={reviewHours} />

              <section
                ref={stubsRef}
                id={STUB_SECTION_ID}
                tabIndex={-1}
                aria-label="Pay stubs"
                className="scroll-mt-6 rounded-[24px] focus:outline-none"
              >
                <GCard index={2} kicker="Pay history" title="Pay stubs" data-testid="demo-teacher-payroll-stubs">
                  <StubsPanel
                    payroll={payroll}
                    years={years}
                    year={year}
                    onYearChange={setYear}
                    onOpenStub={setOpenStubId}
                    reduce={reduce}
                  />
                </GCard>
              </section>
            </div>

            <div className="flex min-w-0 flex-col gap-5">
              <YearToDateCard payroll={payroll} onShowStubs={showStubsForYear} onReviewHours={reviewHours} />
              <DirectDepositCard payroll={payroll} />
              <TaxDocsCard docs={payroll.taxDocs} onOpen={setOpenDocId} />
            </div>
          </div>
        </div>
      </ParentGardenFrame>

      {/* Dialogs portal out of the frame on their own. */}
      <StubDialog stub={openStub} payroll={payroll} theme={theme} onClose={() => setOpenStubId(null)} />
      <TaxDocDialog doc={openDoc} theme={theme} onClose={() => setOpenDocId(null)} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Main column                                                         */
/* ------------------------------------------------------------------ */

function NextPaydayStrip({
  payroll,
  reduce,
  onReviewHours,
}: {
  payroll: DemoTeacherPayroll;
  reduce: boolean;
  onReviewHours?: () => void;
}) {
  const { currentPeriod, nextPayday } = payroll;
  const content = (
    <>
      <span className="flex items-center gap-4 sm:contents">
        <DateStamp date={nextPayday} size="sm" dark />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/70">
            Next payday
          </span>
          <span className="mt-0.5 block text-[17px] font-extrabold leading-snug">
            {parseDay(nextPayday).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
          <span className="mt-0.5 block text-[13px] font-semibold text-white/85">
            Pay period {periodLabel(currentPeriod.start, currentPeriod.end)} ·{" "}
            <span className="tabular-nums">{hoursText(currentPeriod.hoursSoFar)}</span> hours so far
          </span>
        </span>
      </span>
      {onReviewHours ? (
        <span className={`${gBtnOnAccent} self-start sm:self-auto`} aria-hidden="true">
          Review hours <ArrowRight className="h-4 w-4" />
        </span>
      ) : null}
    </>
  );
  const stripClass =
    "group flex w-full flex-col gap-4 rounded-[18px] bg-[var(--sf-clay)] p-4 text-left text-white sm:flex-row sm:items-center sm:p-5";

  return (
    <motion.div {...gFade(1, reduce)}>
      {onReviewHours ? (
        <button
          type="button"
          onClick={onReviewHours}
          className={`${stripClass} cursor-pointer ${G_FOCUS}`}
          data-testid="demo-teacher-payroll-next-payday"
        >
          {content}
        </button>
      ) : (
        <div className={stripClass} data-testid="demo-teacher-payroll-next-payday">
          {content}
        </div>
      )}
    </motion.div>
  );
}

function StubsPanel({
  payroll,
  years,
  year,
  onYearChange,
  onOpenStub,
  reduce,
}: {
  payroll: DemoTeacherPayroll;
  years: number[];
  year: string;
  onYearChange: (year: string) => void;
  onOpenStub: (id: string) => void;
  reduce: boolean;
}) {
  const items: GTabBarItem[] = years.map((y) => {
    const count = payroll.stubs.filter((stub) => stub.year === y).length;
    const active = String(y) === year;
    return {
      key: String(y),
      label: String(y),
      testId: `demo-teacher-payroll-year-${y}`,
      suffix: (
        <span
          className={`ml-0.5 rounded-full px-1.5 text-[11px] tabular-nums ${
            active ? "bg-white/25 text-white" : "bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/60"
          }`}
          aria-label={`${count} stubs`}
        >
          {count}
        </span>
      ),
    };
  });
  const stubs = payroll.stubs.filter((stub) => String(stub.year) === year);

  return (
    <>
      <GTabBar items={items} activeKey={year} onChange={onYearChange} ariaLabel="Pay stub year" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={year}
          role="tabpanel"
          aria-label={`${year} pay stubs`}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.24, ease: PORTAL_EASE }}
          className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0"
        >
          {stubs.map((stub) => (
            <StubRow key={stub.id} stub={stub} onOpen={() => onOpenStub(stub.id)} />
          ))}
        </motion.ul>
      </AnimatePresence>
    </>
  );
}

function StubRow({ stub, onOpen }: { stub: DemoPayStub; onOpen: () => void }) {
  return (
    // The row is a pointer shortcut; the "View stub" button is the keyboard / screen-reader control.
    <li
      onClick={onOpen}
      className="sf-ticket flex cursor-pointer items-stretch rounded-2xl bg-[var(--sf-paper)] text-[var(--sf-ink)] transition-colors hover:bg-[var(--sf-accent-wash)]"
      data-testid={`demo-teacher-payroll-stub-${stub.id}`}
    >
      <div className="flex items-center py-2.5 pl-5 pr-3">
        <DateStamp date={stub.payDate} size="sm" />
      </div>
      <div className="my-3 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/20" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 py-3 pl-4 pr-6 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-[15px] font-extrabold leading-snug">
            <span className="sr-only">Paid {longDate(stub.payDate)}, pay period </span>
            {periodLabel(stub.periodStart, stub.periodEnd)}
          </h3>
          <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
            <span className="tabular-nums">{hoursText(stub.hours)}</span> h · Gross{" "}
            <span className="tabular-nums">{money(stub.grossCents)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="m-0 min-w-[5.5rem] sm:text-right">
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">Net</span>
            <span className="block text-[16px] font-extrabold tabular-nums">{money(stub.netCents)}</span>
          </p>
          <GChip tone="success">Paid</GChip>
          <button
            type="button"
            className={`${gBtnOutlineSm} !px-3 !py-2`}
            aria-label={`View stub for ${longDate(stub.payDate)}`}
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
          >
            View stub
          </button>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Rail                                                                */
/* ------------------------------------------------------------------ */

type Figure = {
  key: string;
  label: string;
  value: ReactNode;
  aria: string;
  onClick?: () => void;
};

const FIGURE_TILE =
  "group flex w-full flex-col items-start rounded-[14px] bg-white/10 px-3 py-2.5 text-left";

function YearToDateCard({
  payroll,
  onShowStubs,
  onReviewHours,
}: {
  payroll: DemoTeacherPayroll;
  onShowStubs: (year: number) => void;
  onReviewHours?: () => void;
}) {
  const { ytd, currentPeriod, nextPayday } = payroll;
  const figures: Figure[] = [
    {
      key: "gross",
      label: "Gross",
      value: <MoneyCountUp cents={ytd.grossCents} />,
      aria: `Gross pay in ${ytd.year}: ${money(ytd.grossCents)}. Show ${ytd.year} pay stubs`,
      onClick: () => onShowStubs(ytd.year),
    },
    {
      key: "net",
      label: "Net",
      value: <MoneyCountUp cents={ytd.netCents} />,
      aria: `Net pay in ${ytd.year}: ${money(ytd.netCents)}. Show ${ytd.year} pay stubs`,
      onClick: () => onShowStubs(ytd.year),
    },
    {
      key: "hours",
      label: "Hours",
      value: <GCountUp value={ytd.hours} />,
      aria: `Hours paid in ${ytd.year}: ${hoursText(ytd.hours)}. Review your hours`,
      onClick: onReviewHours,
    },
  ];

  return (
    <GCard index={3} tone="dark" kicker={`${ytd.year} so far`} title="Year to date" data-testid="demo-teacher-payroll-ytd">
      <p className="m-0 text-[14px] font-semibold leading-relaxed text-white/80">
        From {ytd.stubCount} pay stubs this year.
      </p>
      <dl className="m-0 mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {figures.map((figure) => (
          <div key={figure.key} className={`min-w-0 ${figure.key === "hours" ? "max-sm:col-span-2 lg:max-xl:col-span-2" : ""}`}>
            <dt className="sr-only">{figure.label}</dt>
            <dd className="m-0">
              {figure.onClick ? (
                <button
                  type="button"
                  onClick={figure.onClick}
                  aria-label={figure.aria}
                  className={`${FIGURE_TILE} transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/60`}
                >
                  <FigureBody figure={figure} linked />
                </button>
              ) : (
                <div className={FIGURE_TILE} aria-label={figure.aria} role="group">
                  <FigureBody figure={figure} />
                </div>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <div className="sf-ticket flex items-stretch rounded-2xl bg-[var(--sf-paper)] text-[var(--sf-ink)]">
          <div className="flex items-center py-2.5 pl-5 pr-3">
            <DateStamp date={nextPayday} size="sm" />
          </div>
          <div className="my-3 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/20" aria-hidden="true" />
          <div className="min-w-0 flex-1 px-4 py-3 pr-6">
            <p className="m-0 truncate text-[15px] font-extrabold">Next payday {parseDay(nextPayday).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            <p className="m-0 truncate text-[13px] font-semibold text-[var(--sf-soft)]">
              Pay period {periodLabel(currentPeriod.start, currentPeriod.end)}
            </p>
          </div>
        </div>
      </div>
    </GCard>
  );
}

function FigureBody({ figure, linked = false }: { figure: Figure; linked?: boolean }) {
  return (
    <>
      <span className="sf-display text-[1.6rem] leading-none tabular-nums text-white">{figure.value}</span>
      <span className="mt-1 flex items-center gap-1 text-[12px] font-extrabold text-white/75 group-hover:text-white">
        <span className="truncate">{figure.label}</span>
        {linked ? (
          <ArrowRight className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
        ) : null}
      </span>
    </>
  );
}

/** GCountUp for money: whole dollars with separators; renders the final value first, skips under reduced motion. */
function MoneyCountUp({ cents }: { cents: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion() === true;
  const dollars = Math.round(cents / 100);
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce || dollars === 0) return;
    const controls = animate(0, dollars, {
      duration: 1,
      ease: PORTAL_EASE,
      onUpdate: (v) => {
        el.textContent = MONEY_WHOLE.format(Math.round(v));
      },
    });
    return () => {
      controls.stop();
      el.textContent = MONEY_WHOLE.format(dollars);
    };
  }, [inView, reduce, dollars]);
  return <span ref={ref}>{MONEY_WHOLE.format(dollars)}</span>;
}

function DirectDepositCard({ payroll }: { payroll: DemoTeacherPayroll }) {
  const { deposit } = payroll;
  return (
    <GCard
      index={4}
      kicker="Where pay goes"
      title="Direct deposit"
      action={
        <button
          type="button"
          className={`${gBtnOutlineSm} !px-3 !py-1.5`}
          disabled
          title="Updating pay details is off in preview"
        >
          Update
        </button>
      }
      data-testid="demo-teacher-payroll-deposit"
    >
      <div className="flex items-center gap-3 rounded-[16px] bg-[var(--sf-paper)] p-3.5 ring-[1.5px] ring-[var(--sf-ink)]/[0.08]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--sf-sky)]" aria-hidden="true">
          <Landmark className="h-4 w-4 text-[var(--sf-ink)]/80" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">
            {deposit.accountType} ending in {deposit.last4}
          </span>
          <span className="block text-[13px] font-semibold text-[var(--sf-soft)]">
            <span className="tabular-nums">{deposit.percent}%</span> of net pay
          </span>
        </span>
        <Tick className="h-7 w-7" color="var(--sf-forest)" fill="var(--sf-mint)" />
      </div>
    </GCard>
  );
}

function TaxDocsCard({ docs, onOpen }: { docs: DemoTaxDoc[]; onOpen: (id: DemoTaxDoc["id"]) => void }) {
  return (
    <GCard index={5} kicker="Year-end" title="Tax documents" data-testid="demo-teacher-payroll-tax-docs">
      <ul className="sf-paper -mx-1 m-0 flex list-none flex-col rounded-xl p-0 px-1">
        {docs.map((doc) => (
          <li key={doc.id}>
            <button
              type="button"
              onClick={() => onOpen(doc.id)}
              className={`group flex min-h-[52px] w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/70 ${G_FOCUS}`}
              data-testid={`demo-teacher-payroll-doc-${doc.id}`}
            >
              <Tick className="h-6 w-6" color="var(--sf-forest)" fill="var(--sf-mint)" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">{doc.title}</span>
                <span className="block text-[13px] font-semibold text-[var(--sf-soft)]">{doc.status}</span>
              </span>
              <ChevronRight
                className="h-4 w-4 text-[var(--sf-ink)]/50 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Dialogs                                                             */
/* ------------------------------------------------------------------ */

function DisabledDownload({ label }: { label: string }) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="m-0 text-[12px] font-semibold text-[var(--sf-soft)]">Preview · downloads are off in the demo.</p>
      <button type="button" className={gBtnOutlineSm} disabled title="Downloads are off in preview">
        <Download className="h-4 w-4" aria-hidden />
        {label}
      </button>
    </div>
  );
}

function LineRows({ lines, rateCents }: { lines: DemoPayLine[]; rateCents?: number }) {
  return (
    <dl className="m-0 flex flex-col divide-y divide-[var(--sf-ink)]/[0.08]">
      {lines.map((line) => (
        <div key={line.id} className="flex items-baseline justify-between gap-4 py-2">
          <dt className="min-w-0">
            <span className="block text-[14px] font-bold text-[var(--sf-ink)]">{line.label}</span>
            {line.hours != null && rateCents != null ? (
              <span className="block text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">
                {hoursText(line.hours)} h × {money(rateCents)}
              </span>
            ) : null}
          </dt>
          <dd className="m-0 shrink-0 text-[14px] font-extrabold tabular-nums text-[var(--sf-ink)]">
            {money(line.amountCents)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TotalRow({ label, cents, negative = false }: { label: string; cents: number; negative?: boolean }) {
  return (
    <div className="mt-1 flex items-baseline justify-between gap-4 border-t-[1.5px] border-[var(--sf-ink)]/20 pt-2">
      <span className="text-[14px] font-extrabold text-[var(--sf-ink)]">{label}</span>
      <span className="text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]">
        {negative ? "−" : ""}
        {money(cents)}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">{children}</h3>
  );
}

function StubDialog({
  stub,
  payroll,
  theme,
  onClose,
}: {
  stub: DemoPayStub | null;
  payroll: DemoTeacherPayroll;
  theme: ReturnType<typeof useParentTheme>["theme"];
  onClose: () => void;
}) {
  // Keep the last stub on screen while the dialog animates out.
  const [shown, setShown] = useState<DemoPayStub | null>(stub);
  if (stub && stub !== shown) setShown(stub);
  const view = stub ?? shown;

  return (
    <GDialog
      theme={theme}
      open={stub != null}
      onClose={onClose}
      size="md"
      icon={<ReceiptText />}
      title={view ? `Pay stub · ${longDate(view.payDate)}` : "Pay stub"}
      description={
        view
          ? `Pay period ${periodLabel(view.periodStart, view.periodEnd, true)} · ${payroll.employee.name}`
          : undefined
      }
      footer={<DisabledDownload label="Download PDF" />}
      data-testid="demo-teacher-payroll-stub-dialog"
    >
      {view ? (
        <div className="flex flex-col gap-5">
          <section>
            <SectionLabel>Earnings</SectionLabel>
            <LineRows lines={view.earnings} rateCents={payroll.rateCents} />
            <TotalRow label="Gross pay" cents={view.grossCents} />
          </section>
          <section>
            <SectionLabel>Deductions</SectionLabel>
            <LineRows lines={view.deductions} />
            <TotalRow label="Total deductions" cents={view.deductionsCents} negative />
          </section>
          <div className="flex items-center gap-4 rounded-[18px] bg-[var(--sf-mint)] p-4">
            <Tick className="h-10 w-10" color="var(--sf-forest)" />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-forest)]">Net pay</p>
              <p className="sf-display m-0 text-[2rem] leading-none tabular-nums text-[var(--sf-ink)]">
                {money(view.netCents)}
              </p>
              <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-ink)]/75">
                Paid to {payroll.deposit.accountType} ending in {payroll.deposit.last4}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </GDialog>
  );
}

function TaxDocDialog({
  doc,
  theme,
  onClose,
}: {
  doc: DemoTaxDoc | null;
  theme: ReturnType<typeof useParentTheme>["theme"];
  onClose: () => void;
}) {
  const [shown, setShown] = useState<DemoTaxDoc | null>(doc);
  if (doc && doc !== shown) setShown(doc);
  const view = doc ?? shown;

  return (
    <GDialog
      theme={theme}
      open={doc != null}
      onClose={onClose}
      size="sm"
      icon={<FileText />}
      title={view?.title ?? "Tax document"}
      description={view ? `${view.status} · read-only` : undefined}
      footer={<DisabledDownload label="Download" />}
      data-testid="demo-teacher-payroll-doc-dialog"
    >
      {view ? (
        <>
          <dl className="m-0 flex flex-col divide-y divide-[var(--sf-ink)]/[0.08]">
            {view.rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-2">
                <dt className="min-w-0 text-[13px] font-bold text-[var(--sf-soft)]">{row.label}</dt>
                <dd className="m-0 shrink-0 text-[14px] font-extrabold tabular-nums text-[var(--sf-ink)]">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="m-0 mt-3 text-[12px] font-semibold text-[var(--sf-soft)]">{view.note}</p>
        </>
      ) : null}
    </GDialog>
  );
}
