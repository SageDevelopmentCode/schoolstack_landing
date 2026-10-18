"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Flag,
  List,
  Lock,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Sprout,
  X,
} from "lucide-react";
import MondayCheckMudKitchenCallout, {
  mudkitchenBody,
} from "@/components/marketing/monday-check/MondayCheckMudKitchenCallout";
import OpsCheckBreadcrumbs from "@/components/marketing/monday-check/OpsCheckBreadcrumbs";
import OpsCheckStatusChip from "@/components/marketing/monday-check/OpsCheckStatusChip";
import { useOpsCheckLocalPlan } from "@/components/marketing/monday-check/useOpsCheckLocalPlan";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import {
  classifyAnswerStatus,
  countByStatus,
  OPS_CHECK_STATUS_LABELS,
  type OpsCheckAnswerStatus,
} from "@/lib/marketing/ops-check-answer-status";
import {
  type PersonalizedInsight,
  type computeMondayCheckResults,
} from "@/lib/marketing/microschool-monday-check";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type MondayCheckResultsProps = {
  theme: ParentThemeTokens;
  results: ReturnType<typeof computeMondayCheckResults>;
  onReviewAnswers: () => void;
};

type FilterKey = "all" | OpsCheckAnswerStatus;

type ResultsTab = "priorities" | "action-plan" | "answers";

function tabPanelVisibilityClass(isActive: boolean): string | undefined {
  return isActive ? undefined : "hidden print:block";
}

function healthBlockColor(theme: ParentThemeTokens, status: OpsCheckAnswerStatus): string {
  switch (status) {
    case "attention":
      return theme.sun;
    case "improving":
      return theme.sky;
    case "working":
      return "#9AC3A7";
  }
}

function priorityBlurb(insight: PersonalizedInsight, index: number): string {
  const fallbacks = [
    "Make the handoff less dependent on you.",
    "Give every interested family a next step.",
    "Make the tour-to-enrollment handoff consistent.",
  ];
  const text = insight.option.insight;
  const short = text.length > 72 ? `${text.slice(0, 69)}…` : text;
  return fallbacks[index] ?? short;
}

export default function MondayCheckResults({
  theme,
  results,
  onReviewAnswers,
}: MondayCheckResultsProps) {
  const { tier, personalizedInsights, growthSpotlight, totalScore, maxScore } = results;

  const topThree = useMemo(
    () => personalizedInsights.slice(0, 3),
    [personalizedInsights],
  );
  const defaultTaskIds = useMemo(
    () => topThree.map((i) => i.questionId),
    [topThree],
  );
  const validQuestionIds = useMemo(
    () => personalizedInsights.map((i) => i.questionId),
    [personalizedInsights],
  );

  const { plan, toggleDone, addTask, removeTask, resetPlan } = useOpsCheckLocalPlan(
    defaultTaskIds,
    validQuestionIds,
  );

  const [activePriorityId, setActivePriorityId] = useState<string>(
    () => topThree[0]?.questionId ?? "",
  );
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [activeTab, setActiveTab] = useState<ResultsTab>("priorities");

  useEffect(() => {
    if (topThree[0] && !topThree.some((t) => t.questionId === activePriorityId)) {
      setActivePriorityId(topThree[0].questionId);
    }
  }, [topThree, activePriorityId]);

  const statusCounts = useMemo(
    () => countByStatus(personalizedInsights.map((i) => i.option.score)),
    [personalizedInsights],
  );

  const activePriority =
    topThree.find((i) => i.questionId === activePriorityId) ?? topThree[0];

  const filteredInsights = useMemo(() => {
    const q = search.toLowerCase().trim();
    return personalizedInsights.filter((item) => {
      const status = classifyAnswerStatus(item.option.score);
      if (filter !== "all" && status !== filter) return false;
      if (!q) return true;
      const haystack = [item.pillarLabel, item.prompt, item.option.label, item.option.action]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [personalizedInsights, filter, search]);

  const planComplete = plan.taskIds.filter((id) => plan.doneIds.includes(id)).length;

  const downloadPlan = useCallback(() => {
    const findInsight = (id: string) => personalizedInsights.find((i) => i.questionId === id);
    const lines = [
      "MICROSCHOOL OPS CHECK",
      "MudKitchen · Personal action plan",
      "",
      `Snapshot score: ${totalScore} / ${maxScore}`,
      "",
      "YOUR NEXT STEPS",
      ...plan.taskIds.map((id) => {
        const item = findInsight(id);
        if (!item) return "";
        const mark = plan.doneIds.includes(id) ? "[x]" : "[ ]";
        return `${mark} ${item.pillarLabel}\n    ${item.option.action}`;
      }),
      "",
      "ALL ANSWERS",
      ...personalizedInsights.map(
        (item) =>
          `${item.pillarLabel}\nQuestion: ${item.prompt}\nAnswer: ${item.option.label}\nNext step: ${item.option.action}\n`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "microschool-ops-check-action-plan.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [personalizedInsights, plan, totalScore, maxScore]);

  const expandAll = () => {
    if (expanded.size > 0) {
      setExpanded(new Set());
      return;
    }
    setExpanded(new Set(personalizedInsights.map((i) => i.questionId)));
  };

  const scorePercent = Math.min(100, (totalScore / maxScore) * 100);

  const cardBorder = "#E0E7E0";

  return (
    <div className="flex flex-col gap-0 pb-10 print:pb-0">
      <OpsCheckBreadcrumbs theme={theme} tail="Your results" />

      <header className="pagehead mb-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div>
          <ParentSectionKicker theme={theme}>Your ops check</ParentSectionKicker>
          <ParentDisplayHeading theme={theme} as="h1" size="display" className="mb-3 mt-2">
            {tier.title}
          </ParentDisplayHeading>
          <p
            className="max-w-[600px] text-[14px] leading-[1.8]"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            {tier.summary}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:mt-5">
          <button
            type="button"
            onClick={downloadPlan}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[12px] font-bold transition-transform hover:-translate-y-px"
            style={{
              borderColor: "#B3C7B8",
              backgroundColor: theme.white,
              color: theme.primary,
              fontFamily: theme.fontBody,
            }}
          >
            <Download className="h-4 w-4" aria-hidden />
            Save action plan
          </button>
          <button
            type="button"
            onClick={onReviewAnswers}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[12px] font-bold transition-transform hover:-translate-y-px"
            style={{
              borderColor: theme.line,
              backgroundColor: "transparent",
              color: theme.muted,
              fontFamily: theme.fontBody,
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Review answers
          </button>
        </div>
      </header>

      <section
        aria-label="Assessment overview"
        className="mb-7 grid overflow-hidden rounded-[22px] border shadow-sm md:grid-cols-[minmax(0,1fr)_315px] max-md:grid-cols-1 max-sm:block"
        style={{ borderColor: cardBorder, backgroundColor: theme.white, boxShadow: theme.shadowCard }}
      >
        <div className="p-6 sm:p-7">
          <div className="mb-3.5 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-extrabold"
              style={{ backgroundColor: "#E9F4F7", color: "#39788C" }}
            >
              Your school-day snapshot
            </span>
            <span
              className="text-[10px] font-extrabold uppercase tracking-[0.13em]"
              style={{ color: "#759077", fontFamily: theme.fontBody }}
            >
              {personalizedInsights.length} answers reviewed
            </span>
          </div>
          <h2
            className="mb-2.5 font-[family-name:var(--font-fraunces)] text-[clamp(1.35rem,3vw,1.75rem)] font-medium leading-[1.15] tracking-[-0.035em]"
            style={{ color: theme.ink }}
          >
            Your next step isn&apos;t to fix everything.
          </h2>
          <p
            className="max-w-[610px] text-[13px] leading-[1.8]"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            Start with the handoffs that matter most for your school. Keep the parts already working.
          </p>
          <div
            className="mt-5 flex max-w-[520px] gap-1"
            aria-hidden
          >
            {personalizedInsights.map((item) => (
              <span
                key={item.questionId}
                className="h-[7px] flex-1 rounded-[5px]"
                style={{
                  backgroundColor: healthBlockColor(
                    theme,
                    classifyAnswerStatus(item.option.score),
                  ),
                }}
              />
            ))}
          </div>
          <div
            className="mt-3 flex flex-wrap gap-5 text-[10px]"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            <span className="inline-flex items-center gap-1.5">
              <i className="h-1.5 w-1.5 rounded-full" style={{ background: theme.sun }} />
              {statusCounts.attention} priorities
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-1.5 w-1.5 rounded-full" style={{ background: theme.sky }} />
              {statusCounts.improving} to simplify
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-1.5 w-1.5 rounded-full" style={{ background: "#9AC3A7" }} />
              {statusCounts.working} working well
            </span>
          </div>
        </div>
        <aside
          className="flex flex-col justify-center border-l p-6 sm:p-7 max-sm:border-l-0 max-sm:border-t"
          style={{ borderColor: theme.line, backgroundColor: theme.cream }}
        >
          <div className="flex items-center justify-between gap-2">
            <ParentSectionKicker theme={theme} className="!mb-0">
              Your check score
            </ParentSectionKicker>
          </div>
          <p
            className="my-3 font-[family-name:var(--font-fraunces)] text-[51px] leading-none tracking-[-0.055em] max-sm:text-[45px]"
            style={{ color: theme.ink }}
          >
            {totalScore}
            <span
              className="ml-1 text-[17px] tracking-normal"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              / {maxScore}
            </span>
          </p>
          <div
            className="h-1.5 overflow-hidden rounded-full"
            style={{ backgroundColor: "#E6EBDF" }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${scorePercent}%`, backgroundColor: theme.primary }}
            />
          </div>
          <p
            className="mt-2.5 text-[10px] leading-[1.7]"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            A starting point for reflection—not a grade for your school.
          </p>
        </aside>
      </section>

      <nav
        role="tablist"
        aria-label="Results sections"
        className="mb-7 flex flex-wrap items-center gap-6 border-b print:hidden"
        style={{ borderColor: theme.line }}
      >
        {(
          [
            { id: "priorities" as const, label: "Your priorities", count: topThree.length, icon: Flag },
            { id: "action-plan" as const, label: "Action plan", count: undefined, icon: List },
            {
              id: "answers" as const,
              label: "All answers",
              count: personalizedInsights.length,
              icon: List,
            },
          ] as const
        ).map(({ id, label, count, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={active}
              aria-controls={id}
              onClick={() => setActiveTab(id)}
              className="mb-0 flex items-center gap-1.5 border-b-2 pb-3 text-[12px] font-bold transition-colors"
              style={{
                borderBottomColor: active ? theme.primary : "transparent",
                color: active ? theme.primary : "#77858A",
                fontFamily: theme.fontBody,
              }}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
              {count != null && (
                <span
                  className="rounded px-1 py-0.5 text-[10px]"
                  style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <section
        id="priorities"
        role="tabpanel"
        aria-labelledby="tab-priorities"
        className={tabPanelVisibilityClass(activeTab === "priorities")}
      >
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <ParentSectionKicker theme={theme}>Start here</ParentSectionKicker>
            <ParentDisplayHeading theme={theme} as="h2" size="section" className="mt-2">
              Three things worth untangling.
            </ParentDisplayHeading>
            <p
              className="mt-2 max-w-xl text-[12px] leading-[1.8]"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              Choose one priority. Take one practical step. Then move to the next.
            </p>
          </div>
          <span
            className="text-[10px] whitespace-nowrap max-sm:mt-2"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            Ordered from your results
          </span>
        </header>

        <div className="grid items-stretch gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div
            className="flex flex-col gap-2.5 max-lg:grid max-lg:grid-cols-3 max-lg:gap-2 max-sm:gap-1.5"
            role="tablist"
            aria-label="Top priorities"
          >
            {topThree.map((item, index) => {
              const active = item.questionId === activePriorityId;
              const done = plan.doneIds.includes(item.questionId);
              return (
                <button
                  key={item.questionId}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActivePriorityId(item.questionId)}
                  className="relative flex w-full gap-3 rounded-[15px] border p-4 text-left shadow-sm transition-colors max-lg:block max-lg:min-h-[112px] max-lg:p-3"
                  style={{
                    borderColor: active ? "#B9D1C1" : cardBorder,
                    backgroundColor: active ? theme.primarySoft : theme.white,
                    boxShadow: theme.shadowCard,
                    color: theme.ink,
                    fontFamily: theme.fontBody,
                  }}
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] text-[11px] font-extrabold max-lg:mb-2 max-lg:h-6 max-lg:w-6"
                    style={{
                      backgroundColor: done ? "#EBF8EF" : active ? theme.primary : "#F0EBF3",
                      color: done ? "#34825A" : active ? theme.white : "#765E89",
                    }}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <div className="min-w-0 pr-4">
                    <strong className="block text-[12px] leading-snug max-lg:text-[10px]">
                      {item.pillarLabel}
                    </strong>
                    <p
                      className="mt-1 text-[11px] leading-[1.65] max-lg:hidden"
                      style={{ color: theme.muted }}
                    >
                      {priorityBlurb(item, index)}
                    </p>
                  </div>
                  <ChevronRight
                    className="absolute right-3 top-5 h-3.5 w-3.5 max-lg:right-2 max-lg:top-4"
                    style={{ color: theme.muted }}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>

          {activePriority && (
            <article
              role="tabpanel"
              className="flex min-w-0 flex-col rounded-[22px] border p-6 shadow-sm sm:p-7"
              style={{
                borderColor: cardBorder,
                backgroundColor: theme.white,
                boxShadow: theme.shadowCard,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-[0.13em]"
                  style={{ color: "#729077", fontFamily: theme.fontBody }}
                >
                  Priority {topThree.indexOf(activePriority) + 1} of 3
                </span>
                <OpsCheckStatusChip
                  status={
                    plan.doneIds.includes(activePriority.questionId) ? "working" : "attention"
                  }
                />
              </div>
              <h3
                className="mt-3 font-[family-name:var(--font-fraunces)] text-[26px] font-medium tracking-[-0.035em] max-sm:text-2xl"
                style={{ color: theme.ink }}
              >
                {activePriority.pillarLabel}
              </h3>
              <p
                className="mt-2 text-[12px] leading-[1.7]"
                style={{ color: theme.muted, fontFamily: theme.fontBody }}
              >
                {activePriority.prompt}
              </p>
              <div
                className="mt-4 rounded-r-[10px] border-l-[3px] py-2.5 pl-3.5 pr-3.5"
                style={{ borderColor: theme.sky, backgroundColor: "#F5F9F8" }}
              >
                <p
                  className="text-[9px] font-extrabold uppercase tracking-[0.08em]"
                  style={{ color: theme.muted, fontFamily: theme.fontBody }}
                >
                  Your answer
                </p>
                <p
                  className="mt-1 text-[13px] font-medium leading-[1.7]"
                  style={{ color: theme.ink, fontFamily: theme.fontBody }}
                >
                  {activePriority.option.label}
                </p>
              </div>
              <p
                className="mt-4 text-[12px] leading-[1.8]"
                style={{ color: theme.muted, fontFamily: theme.fontBody }}
              >
                {activePriority.option.insight}
              </p>
              <div
                className="mt-5 rounded-[13px] border px-4 py-4"
                style={{ borderColor: "#ECEADD", backgroundColor: theme.cream }}
              >
                <p
                  className="text-[9px] font-extrabold uppercase tracking-[0.08em]"
                  style={{ color: "#917947", fontFamily: theme.fontBody }}
                >
                  One practical next step
                </p>
                <p
                  className="mt-2 text-[14px] font-medium leading-[1.7]"
                  style={{ color: theme.ink, fontFamily: theme.fontBody }}
                >
                  {activePriority.option.action}
                </p>
              </div>
              <MondayCheckMudKitchenCallout theme={theme} className="mt-4">
                {mudkitchenBody(activePriority.option.mudkitchen)}
              </MondayCheckMudKitchenCallout>
              <div
                className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between print:hidden"
                style={{ borderColor: theme.line }}
              >
                <ParentButton
                  theme={theme}
                  type="button"
                  variant={plan.doneIds.includes(activePriority.questionId) ? "outline" : "primary"}
                  onClick={() => {
                    if (!plan.taskIds.includes(activePriority.questionId)) {
                      addTask(activePriority.questionId);
                    }
                    toggleDone(activePriority.questionId);
                  }}
                  className="inline-flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" aria-hidden />
                  {plan.doneIds.includes(activePriority.questionId)
                    ? "Mark as not done"
                    : "Mark this step done"}
                </ParentButton>
                <ParentTextLink theme={theme} href={activePriority.option.featureHref}>
                  How MudKitchen helps
                  <ArrowRight className="inline h-3.5 w-3.5" aria-hidden />
                </ParentTextLink>
              </div>
            </article>
          )}
        </div>

        {growthSpotlight && (
          <aside
            className="mt-5 flex items-center gap-3 rounded-[13px] border border-l-[3px] px-5 py-4"
            style={{
              borderColor: "#DAE8EB",
              borderLeftColor: "#39788C",
              background: "linear-gradient(135deg, #E9F4F7, white)",
            }}
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px]"
              style={{ backgroundColor: "#E9F4F7", color: "#39788C" }}
            >
              <Sprout className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p
                className="text-[9px] font-extrabold uppercase tracking-[0.08em]"
                style={{ color: "#39788C", fontFamily: theme.fontBody }}
              >
                If you grew by 10 students
              </p>
              <p
                className="mt-1 text-[12px] leading-[1.7]"
                style={{ color: theme.ink, fontFamily: theme.fontBody }}
              >
                {growthSpotlight.label} would feel the strain first.
              </p>
              <p
                className="mt-0.5 text-[10px] max-sm:hidden"
                style={{ color: theme.muted, fontFamily: theme.fontBody }}
              >
                That&apos;s a place to strengthen—not a reason to hold back.
              </p>
            </div>
          </aside>
        )}
      </section>

      <section
        id="action-plan"
        role="tabpanel"
        aria-labelledby="tab-action-plan"
        className={tabPanelVisibilityClass(activeTab === "action-plan")}
      >
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <ParentSectionKicker theme={theme}>Make it manageable</ParentSectionKicker>
            <ParentDisplayHeading theme={theme} as="h2" size="section" className="mt-2">
              Your next-step list
            </ParentDisplayHeading>
            <p
              className="mt-2 text-[12px] leading-[1.7]"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              Starting actions from your priorities. Add others from your answer review when you&apos;re
              ready.
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold whitespace-nowrap"
            style={{
              borderColor: "#D5E3D6",
              backgroundColor: theme.primarySoft,
              color: theme.primary,
              fontFamily: theme.fontBody,
            }}
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
            {planComplete} of {plan.taskIds.length} done
          </div>
        </header>
        <div
          className="rounded-[18px] border px-5 shadow-sm"
          style={{
            borderColor: cardBorder,
            backgroundColor: theme.white,
            boxShadow: theme.shadowCard,
          }}
        >
          {plan.taskIds.length === 0 ? (
            <p
              className="py-5 text-[12px] leading-[1.8]"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              Your list is clear. Add a next step from any answer below.
            </p>
          ) : (
            plan.taskIds.map((taskId) => {
              const item = personalizedInsights.find((i) => i.questionId === taskId);
              if (!item) return null;
              const done = plan.doneIds.includes(taskId);
              const isTop = topThree.some((t) => t.questionId === taskId);
              return (
                <div
                  key={taskId}
                  className={`flex gap-3 border-b py-4 last:border-b-0 ${done ? "opacity-80" : ""}`}
                  style={{ borderColor: "#E9EFEA" }}
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    onClick={() => toggleDone(taskId)}
                    className="mt-0.5 grid h-[19px] w-[19px] shrink-0 place-items-center rounded-md border print:hidden"
                    style={{
                      borderColor: done ? theme.primary : "#B9CDBD",
                      backgroundColor: done ? theme.primary : theme.white,
                      color: theme.white,
                    }}
                  >
                    {done && <Check className="h-3 w-3" aria-hidden />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <strong
                      className={`text-[12px] font-semibold leading-[1.7] ${done ? "line-through" : ""}`}
                      style={{ color: done ? theme.muted : theme.ink, fontFamily: theme.fontBody }}
                    >
                      {item.option.action}
                    </strong>
                    <p
                      className="mt-1 text-[10px] leading-[1.7]"
                      style={{ color: theme.muted, fontFamily: theme.fontBody }}
                    >
                      {item.pillarLabel}
                    </p>
                  </div>
                  {isTop ? (
                    <span
                      className="mt-0.5 hidden rounded-md border px-1.5 py-1 text-[9px] whitespace-nowrap sm:inline"
                      style={{ borderColor: theme.line, color: theme.muted }}
                    >
                      Top priority
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeTask(taskId)}
                      className="mt-0.5 inline-flex items-center gap-1 text-[10px] print:hidden"
                      style={{ color: theme.muted, fontFamily: theme.fontBody }}
                      aria-label={`Remove ${item.pillarLabel} from plan`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                      <span className="max-sm:hidden">Remove</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      <section
        id="answers"
        role="tabpanel"
        aria-labelledby="tab-answers"
        className={tabPanelVisibilityClass(activeTab === "answers")}
      >
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <ParentSectionKicker theme={theme}>The full picture</ParentSectionKicker>
            <ParentDisplayHeading theme={theme} as="h2" size="section" className="mt-2">
              Your answers, without the noise.
            </ParentDisplayHeading>
            <p
              className="mt-2 text-[12px] leading-[1.8]"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              Open an answer to see context and a practical next step.
            </p>
          </div>
          <button
            type="button"
            onClick={expandAll}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold print:hidden"
            style={{ color: theme.primary, fontFamily: theme.fontBody }}
          >
            {expanded.size > 0 ? "Collapse all" : "Expand all"}
            {expanded.size > 0 ? (
              <ChevronDown className="h-4 w-4" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
          </button>
        </header>

        <div className="review-toolbar mb-3.5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between print:hidden">
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter answers">
            {(
              [
                ["all", `All · ${personalizedInsights.length}`],
                ["attention", `${OPS_CHECK_STATUS_LABELS.attention} · ${statusCounts.attention}`],
                ["improving", `${OPS_CHECK_STATUS_LABELS.improving} · ${statusCounts.improving}`],
                ["working", `${OPS_CHECK_STATUS_LABELS.working} · ${statusCounts.working}`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className="rounded-[9px] border px-2.5 py-2 text-[11px] whitespace-nowrap transition-colors"
                style={{
                  borderColor: filter === key ? "#BCD4C1" : "#DCE4DC",
                  backgroundColor: filter === key ? "#E9F2EA" : theme.white,
                  color: filter === key ? theme.primary : "#5D6D73",
                  fontWeight: filter === key ? 700 : 400,
                  fontFamily: theme.fontBody,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <label
            className="flex max-w-full items-center gap-2 rounded-[10px] border px-3 py-2 sm:max-w-[220px]"
            style={{ borderColor: "#DCE4DC", backgroundColor: theme.white }}
          >
            <Search className="h-3.5 w-3.5 shrink-0" style={{ color: theme.muted }} aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find an answer…"
              aria-label="Search answers"
              className="min-w-0 w-full border-0 bg-transparent text-[11px] outline-none"
              style={{ color: theme.ink, fontFamily: theme.fontBody }}
            />
          </label>
        </div>

        <div
          className="overflow-hidden rounded-[20px] border shadow-sm"
          style={{
            borderColor: cardBorder,
            backgroundColor: theme.white,
            boxShadow: theme.shadowCard,
          }}
        >
          {filteredInsights.length === 0 ? (
            <p
              className="px-6 py-8 text-center text-[12px]"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              No answers match. Try a different search or filter.
            </p>
          ) : (
            filteredInsights.map((item) => {
              const status = classifyAnswerStatus(item.option.score);
              const isOpen = expanded.has(item.questionId);
              const inPlan = plan.taskIds.includes(item.questionId);
              return (
                <details
                  key={item.questionId}
                  open={isOpen}
                  onToggle={(e) => {
                    const open = (e.target as HTMLDetailsElement).open;
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (open) next.add(item.questionId);
                      else next.delete(item.questionId);
                      return next;
                    });
                  }}
                  className="group border-b last:border-b-0"
                  style={{ borderColor: "#E9EFEA" }}
                >
                  <summary
                    className="relative flex cursor-pointer list-none items-center gap-3.5 px-5 py-4 [&::-webkit-details-marker]:hidden max-sm:flex-wrap"
                    style={{ fontFamily: theme.fontBody }}
                  >
                    <span
                      className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[11px]"
                      style={{ backgroundColor: "#F0F5F0", color: theme.primary }}
                    >
                      <List className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 max-sm:basis-[calc(100%-4rem)]">
                      <strong className="text-[12px] font-semibold leading-snug">{item.pillarLabel}</strong>
                      <p className="mt-0.5 text-[11px] leading-[1.7]" style={{ color: theme.muted }}>
                        {item.option.label}
                      </p>
                    </div>
                    <OpsCheckStatusChip status={status} className="max-sm:ml-10 max-sm:-mt-1" />
                    <ChevronDown
                      className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180 max-sm:absolute max-sm:right-4 max-sm:top-5"
                      style={{ color: theme.muted }}
                      aria-hidden
                    />
                  </summary>
                  <div className="px-5 pb-5 pl-[69px] max-sm:px-4 max-sm:pl-4 max-sm:pb-4">
                    <p
                      className="pt-1 text-[12px] font-semibold leading-[1.8]"
                      style={{ color: theme.ink, fontFamily: theme.fontBody }}
                    >
                      {item.prompt}
                    </p>
                    <p
                      className="mt-2.5 text-[12px] leading-[1.8]"
                      style={{ color: theme.muted, fontFamily: theme.fontBody }}
                    >
                      {item.option.insight}
                    </p>
                    <div
                      className="mt-3.5 rounded-[13px] border px-4 py-3.5"
                      style={{ borderColor: "#ECEADD", backgroundColor: theme.cream }}
                    >
                      <p
                        className="text-[9px] font-extrabold uppercase tracking-[0.08em]"
                        style={{ color: "#917947", fontFamily: theme.fontBody }}
                      >
                        {status === "working" ? "Keep this working" : "A practical next step"}
                      </p>
                      <p
                        className="mt-2 text-[12px] leading-[1.7]"
                        style={{ color: theme.ink, fontFamily: theme.fontBody }}
                      >
                        {item.option.action}
                      </p>
                    </div>
                    <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                      <button
                        type="button"
                        onClick={() => {
                          const added = addTask(item.questionId);
                          if (added) {
                            setActiveTab("action-plan");
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border px-3 py-2 text-[11px] font-bold"
                        style={{
                          borderColor: inPlan ? "#B3C7B8" : "transparent",
                          backgroundColor: inPlan ? theme.white : theme.primarySoft,
                          color: theme.primary,
                          fontFamily: theme.fontBody,
                        }}
                      >
                        {inPlan ? (
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                        )}
                        {inPlan ? "In your action plan" : "Add to action plan"}
                      </button>
                      <ParentTextLink theme={theme} href={item.option.featureHref} className="!text-[11px]">
                        How MudKitchen helps
                        <ArrowRight className="inline h-3.5 w-3.5" aria-hidden />
                      </ParentTextLink>
                    </div>
                  </div>
                </details>
              );
            })
          )}
        </div>
        <div
          className="mt-3 flex flex-col gap-2 text-[10px] leading-[1.8] sm:flex-row sm:items-center sm:justify-between print:hidden"
          style={{ color: theme.muted, fontFamily: theme.fontBody }}
        >
          <span>These groups organize your snapshot—they don&apos;t change your score.</span>
          <button
            type="button"
            onClick={() => {
              setExpanded(new Set(personalizedInsights.map((i) => i.questionId)));
              window.print();
            }}
            className="inline-flex items-center gap-1.5 font-bold"
            style={{ color: theme.primary }}
          >
            <Printer className="h-3.5 w-3.5" aria-hidden />
            Print results
          </button>
        </div>
      </section>

      <section
        className="mt-9 grid items-center gap-6 rounded-[20px] px-6 py-7 sm:px-8 print:hidden sm:grid-cols-[minmax(0,1fr)_auto]"
        style={{ backgroundColor: theme.primary, color: theme.white }}
      >
        <div>
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.13em]"
            style={{ color: "#BDDEC4", fontFamily: theme.fontBody }}
          >
            A little less in your head
          </p>
          <h2
            className="mt-2 max-w-xl font-[family-name:var(--font-fraunces)] text-[clamp(1.5rem,3vw,1.8rem)] font-medium leading-[1.15] tracking-[-0.035em]"
          >
            Build the shared workflows behind a calmer school week.
          </h2>
          <p
            className="mt-3 max-w-xl text-[12px] leading-[1.8]"
            style={{ color: "#D8E6DB", fontFamily: theme.fontBody }}
          >
            {tier.mudkitchenPitch}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-center">
          <ParentButtonLink
            theme={theme}
            href="/get-started"
            className="!bg-white !text-[var(--parent-primary)] hover:!opacity-95"
          >
            See MudKitchen in action
            <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden />
          </ParentButtonLink>
          <span className="text-[10px]" style={{ color: "#BDDEC4", fontFamily: theme.fontBody }}>
            Your priorities. A practical walkthrough.
          </span>
        </div>
      </section>

      <div
        className="mt-7 flex flex-col gap-2 text-[10px] leading-[1.8] sm:flex-row sm:items-center sm:justify-between print:hidden"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Your action plan is kept in this browser. Nothing is sent to a server.
        </span>
        <button
          type="button"
          onClick={resetPlan}
          className="text-left font-bold"
          style={{ color: theme.primary }}
        >
          Reset local changes
        </button>
      </div>
    </div>
  );
}
