"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import CalculatorDialog from "@/components/marketing/enrollment-calculator/CalculatorDialog";
import {
  CalculatorCountField,
  CalculatorMoneyField,
  calculatorFocusClass,
} from "@/components/marketing/enrollment-calculator/CalculatorFields";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import PlannerMenu, { type PlannerMenuSection } from "@/components/marketing/tuition-planner/PlannerMenu";
import {
  BASELINE_EDITOR_HELP,
  BREAKDOWN_ORDER,
  CAP_NOTE,
  ENROLLMENT_HELP,
  MONTHS_HELP,
  PART_TIME_NOTE,
  PARTITION_NOTE,
  PROPOSED_EDITOR_HELP,
  SAVE_STATUS,
  SCHOLARSHIP_HELP,
  SIBLING_HELP,
  TUITION_HELP,
} from "@/components/marketing/tuition-planner/planner-copy";
import { plannerFocusClass } from "@/components/marketing/tuition-planner/planner-theme";
import { formatCalculatorMoney } from "@/lib/marketing/enrollment-calculator";
import {
  ENROLLMENT_SLIDER_MAX,
  MAX_BILLING_MONTHS,
  MAX_PLANNER_ENROLLMENT,
  MIN_BILLING_MONTHS,
  clampPercentHundredths,
  type GroupAdjustment,
  type ProgramGroup,
  type Scenario,
  type ScenarioComputation,
} from "@/lib/marketing/tuition-scenario-planner";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdjustmentKind = "siblingDiscount" | "scholarship";

type ScenarioCardProps = {
  theme: ParentThemeTokens;
  scenario: Scenario;
  baseline: Scenario;
  baselineName: string;
  result: ScenarioComputation;
  isBaseline: boolean;
  atCap: boolean;
  canRemove: boolean;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  labelledBy: string;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onSetBaseline: () => void;
  onReset: () => void;
  onMove: (direction: "earlier" | "later") => void;
  onRemove: () => void;
  onUpdateGroup: (
    groupId: string,
    patch: Partial<Pick<ProgramGroup, "monthlyTuitionCents" | "enrollment" | "billingMonths">>,
  ) => void;
  onToggleAdjustment: (groupId: string, kind: AdjustmentKind, enabled: boolean) => void;
  onUpdateAdjustment: (
    groupId: string,
    kind: AdjustmentKind,
    patch: Partial<Pick<GroupAdjustment, "mode" | "percentHundredths" | "amountCents" | "recipientCount">>,
  ) => void;
  articleRef: (node: HTMLElement | null) => void;
};

export default function ScenarioCard(props: ScenarioCardProps) {
  const {
    theme,
    scenario,
    baseline,
    baselineName,
    result,
    isBaseline,
    atCap,
    canRemove,
    canMoveEarlier,
    canMoveLater,
    labelledBy,
    onRename,
    onDuplicate,
    onSetBaseline,
    onReset,
    onMove,
    onRemove,
    onUpdateGroup,
    onToggleAdjustment,
    onUpdateAdjustment,
    articleRef,
  } = props;
  const titleId = useId();
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(scenario.name);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const cancelRename = useRef(false);

  const menuSections: PlannerMenuSection[] = [
    {
      id: "edit",
      items: [
        ...(!isBaseline ? [{ id: "baseline", label: "Set as baseline", onSelect: onSetBaseline }] : []),
        { id: "reset", label: "Reset assumptions", onSelect: onReset },
      ],
    },
    {
      id: "order",
      label: "Order",
      items: [
        {
          id: "earlier",
          label: "Move earlier",
          disabled: !canMoveEarlier,
          onSelect: () => onMove("earlier"),
        },
        {
          id: "later",
          label: "Move later",
          disabled: !canMoveLater,
          onSelect: () => onMove("later"),
        },
      ],
    },
  ];

  const commitName = () => {
    if (cancelRename.current) {
      cancelRename.current = false;
      setRenaming(false);
      return;
    }
    const next = nameDraft.trim();
    if (next && next !== scenario.name) onRename(next);
    setRenaming(false);
  };

  const discountsOn = scenario.groups.some(
    (group) => group.siblingDiscount.enabled || group.scholarship.enabled,
  );

  return (
    <div
      ref={articleRef}
      id="planner-editor"
      role="tabpanel"
      tabIndex={-1}
      aria-labelledby={labelledBy}
      data-testid={`scenario-card-${scenario.id}`}
      className="scroll-mt-28 p-6 outline-none max-[480px]:px-[17px] max-[480px]:py-5"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {renaming ? (
              <input
                aria-label={`Rename ${scenario.name}`}
                value={nameDraft}
                maxLength={80}
                autoFocus
                onChange={(event) => setNameDraft(event.target.value)}
                onBlur={commitName}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.blur();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    cancelRename.current = true;
                    setNameDraft(scenario.name);
                    setRenaming(false);
                  }
                }}
                className={`min-w-0 bg-transparent text-[23px] font-medium tracking-[-0.035em] outline-none ${plannerFocusClass}`}
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              />
            ) : (
              <h3
                id={titleId}
                className="text-[23px] font-medium tracking-[-0.035em]"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                {scenario.name}
              </h3>
            )}
            <PlanChip baseline={isBaseline} />
            {scenario.groups.length > 1 ? <PlanChip label="Part-time" tone="warning" /> : null}
          </div>
          <p className="max-w-[360px] text-[12px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
            {isBaseline ? BASELINE_EDITOR_HELP : PROPOSED_EDITOR_HELP}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <IconButton
            label={`Rename ${scenario.name}`}
            title="Rename plan"
            onClick={() => {
              setNameDraft(scenario.name);
              setRenaming(true);
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </IconButton>
          <IconButton
            label={`Duplicate ${scenario.name}`}
            title={atCap ? CAP_NOTE : "Duplicate plan"}
            disabled={atCap}
            onClick={onDuplicate}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
          </IconButton>
          {canRemove ? (
            <IconButton label={`Remove ${scenario.name}`} title="Remove plan" onClick={() => setConfirmingRemove(true)}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          ) : null}
          <PlannerMenu
            theme={theme}
            compact
            ariaLabel={`More actions for ${scenario.name}`}
            label={<MoreHorizontal className="h-4 w-4" aria-hidden="true" />}
            sections={menuSections}
          />
        </div>
      </div>

      {result.messages.length > 0 ? (
        <ul className="mb-5 space-y-1" role="status">
          {result.messages.map((message) => (
            <li key={message} className="text-[13px] leading-relaxed" style={{ color: theme.alert, fontFamily: theme.fontBody }}>
              {message}
            </li>
          ))}
        </ul>
      ) : null}

      {scenario.groups.length > 1 ? (
        <p className="mb-5 text-[12px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          {PART_TIME_NOTE}
        </p>
      ) : null}

      <div className="space-y-8">
        {scenario.groups.map((group, index) => (
          <GroupAssumptions
            key={group.id}
            theme={theme}
            scenarioId={scenario.id}
            group={group}
            showLabel={scenario.groups.length > 1}
            baselineName={isBaseline ? undefined : baselineName}
            baselineGroup={isBaseline ? undefined : baseline.groups[index]}
            onUpdateGroup={onUpdateGroup}
          />
        ))}
      </div>

      <div className="my-6 h-px" style={{ backgroundColor: theme.line }} />

      <div className="space-y-5">
        {scenario.groups.map((group) => (
          <div key={group.id} className="space-y-4">
            {scenario.groups.length > 1 ? (
              <h4 className="text-[15px] font-medium" style={{ color: theme.ink, fontFamily: theme.fontDisplay }}>
                {group.label}
              </h4>
            ) : null}
            <AdjustmentEditor
              theme={theme}
              idPrefix={`${scenario.id}-${group.id}-sibling`}
              title="Sibling discount"
              help={SIBLING_HELP}
              enrollment={group.enrollment}
              adjustment={group.siblingDiscount}
              onToggle={(enabled) => onToggleAdjustment(group.id, "siblingDiscount", enabled)}
              onChange={(patch) => onUpdateAdjustment(group.id, "siblingDiscount", patch)}
            />
            <AdjustmentEditor
              theme={theme}
              idPrefix={`${scenario.id}-${group.id}-scholarship`}
              title="Scholarship or tuition assistance"
              help={SCHOLARSHIP_HELP}
              enrollment={group.enrollment}
              adjustment={group.scholarship}
              onToggle={(enabled) => onToggleAdjustment(group.id, "scholarship", enabled)}
              onChange={(patch) => onUpdateAdjustment(group.id, "scholarship", patch)}
            />
          </div>
        ))}
      </div>
      {discountsOn ? (
        <p className="mt-3 text-[11px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          {PARTITION_NOTE}
        </p>
      ) : null}

      <div className="mt-6">
        <Disclosure theme={theme} title="How this estimate adds up" open={breakdownOpen} onToggle={() => setBreakdownOpen((open) => !open)}>
          {result.valid ? (
            <div style={{ fontFamily: theme.fontBody }}>
              <dl>
                {scenario.groups.map((group, index) => (
                  <BreakdownRow
                    key={group.id}
                    theme={theme}
                    label={
                      scenario.groups.length > 1
                        ? `${group.label} · ${formatCalculatorMoney(group.monthlyTuitionCents)} × ${group.enrollment} × ${group.billingMonths}`
                        : `${formatCalculatorMoney(group.monthlyTuitionCents)} × ${group.enrollment} students × ${group.billingMonths} months`
                    }
                    cents={result.groups[index]?.grossCents ?? null}
                  />
                ))}
                <BreakdownRow theme={theme} label="Sibling discounts" cents={result.annualSiblingDiscountCents} reduction />
                <BreakdownRow theme={theme} label="Scholarships" cents={result.annualScholarshipCents} reduction />
                <BreakdownRow theme={theme} label="Estimated annual tuition revenue" cents={result.netCents} strong />
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: theme.muted }}>
                {BREAKDOWN_ORDER}
              </p>
            </div>
          ) : (
            <p className="text-[12px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
              The breakdown appears once the highlighted assumptions are valid.
            </p>
          )}
        </Disclosure>
      </div>

      <div
        className="mt-6 flex items-center justify-between gap-4 border-t pt-4"
        style={{ borderColor: theme.line }}
      >
        <p className="flex items-center gap-1.5 text-[10px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {SAVE_STATUS}
        </p>
        {isBaseline ? <PlanChip baseline label="Comparison baseline" /> : null}
      </div>

      {confirmingRemove ? (
        <CalculatorDialog
          theme={theme}
          kicker="Tuition planner"
          title={`Remove ${scenario.name}?`}
          onClose={() => setConfirmingRemove(false)}
          actions={
            <>
              <ParentButton theme={theme} variant="outline" onClick={() => setConfirmingRemove(false)}>
                Keep plan
              </ParentButton>
              <ParentButton
                theme={theme}
                onClick={onRemove}
                style={{ backgroundColor: theme.alertBg, color: theme.alert }}
              >
                Remove plan
              </ParentButton>
            </>
          }
        >
          <p className="text-[13px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
            {isBaseline
              ? `Remove ${scenario.name}? The next plan becomes the baseline. Other plans stay unchanged.`
              : `Only ${scenario.name} will be removed. Your other plans stay unchanged.`}
          </p>
        </CalculatorDialog>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  title,
  disabled,
  onClick,
  children,
}: {
  label: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center rounded-[9px] border p-2 disabled:cursor-not-allowed disabled:opacity-40 ${plannerFocusClass}`}
      style={{ borderColor: "#E4E8E1", backgroundColor: "#fff", color: "#65777F" }}
    >
      {children}
    </button>
  );
}

function PlanChip({
  baseline = false,
  label,
  tone,
}: {
  baseline?: boolean;
  label?: string;
  tone?: "warning";
}) {
  const warning = tone === "warning";
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-extrabold"
      style={{
        backgroundColor: warning ? "#FFF4D9" : baseline ? "#EBF8EF" : "#E9F4F7",
        color: warning ? "#986F14" : baseline ? "#34825A" : "#39788C",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}
    >
      {label ?? (baseline ? "Baseline" : "What-if plan")}
    </span>
  );
}

function GroupAssumptions({
  theme,
  scenarioId,
  group,
  showLabel,
  baselineName,
  baselineGroup,
  onUpdateGroup,
}: {
  theme: ParentThemeTokens;
  scenarioId: string;
  group: ProgramGroup;
  showLabel: boolean;
  baselineName?: string;
  baselineGroup?: ProgramGroup;
  onUpdateGroup: ScenarioCardProps["onUpdateGroup"];
}) {
  const tuitionAside = baselineGroup
    ? `${baselineName}: ${formatCalculatorMoney(baselineGroup.monthlyTuitionCents)}`
    : undefined;
  const enrollmentAside = baselineGroup ? `${baselineName}: ${baselineGroup.enrollment}` : undefined;
  const monthsAside = baselineGroup ? `${baselineName}: ${baselineGroup.billingMonths} months` : undefined;

  return (
    <div>
      {showLabel ? (
        <h4 className="mb-4 text-[18px] font-medium" style={{ color: theme.ink, fontFamily: theme.fontDisplay }}>
          {group.label}
        </h4>
      ) : null}
      <div className="grid grid-cols-1 gap-5 min-[481px]:grid-cols-2">
        <CalculatorMoneyField
          theme={theme}
          dense
          id={`${scenarioId}-${group.id}-tuition`}
          label="Monthly tuition per student"
          description={TUITION_HELP}
          help={TUITION_HELP}
          aside={tuitionAside}
          valueCents={group.monthlyTuitionCents}
          onChangeCents={(monthlyTuitionCents) => onUpdateGroup(group.id, { monthlyTuitionCents })}
        />
        <CalculatorCountField
          theme={theme}
          dense
          id={`${scenarioId}-${group.id}-enrollment`}
          label="Enrolled students"
          description={ENROLLMENT_HELP}
          help={ENROLLMENT_HELP}
          aside={enrollmentAside}
          suffix="students"
          rangeNoun="students"
          value={group.enrollment}
          max={ENROLLMENT_SLIDER_MAX}
          inputMax={MAX_PLANNER_ENROLLMENT}
          onChange={(enrollment) => onUpdateGroup(group.id, { enrollment })}
        />
        <div className="min-[481px]:col-span-2">
          <MonthStepper
            theme={theme}
            id={`${scenarioId}-${group.id}-months`}
            value={group.billingMonths}
            aside={monthsAside}
            onChange={(billingMonths) => onUpdateGroup(group.id, { billingMonths })}
          />
        </div>
      </div>
    </div>
  );
}

function MonthStepper({
  theme,
  id,
  value,
  aside,
  onChange,
}: {
  theme: ParentThemeTokens;
  id: string;
  value: number;
  aside?: string;
  onChange: (value: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = (nextDraft: string) => {
    const digits = nextDraft.replace(/\D/g, "");
    if (!digits) {
      setDraft("");
      return;
    }
    const parsed = Number.parseInt(digits, 10);
    if (!Number.isFinite(parsed)) return;
    const next = Math.min(MAX_BILLING_MONTHS, Math.max(MIN_BILLING_MONTHS, parsed));
    setDraft(String(next));
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-bold" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
          Billing months per year
        </label>
        {aside ? (
          <span className="text-[10px] font-medium" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
            {aside}
          </span>
        ) : null}
      </div>
      <div
        className="flex h-12 items-center overflow-hidden"
        style={{
          border: `1px solid ${focused ? theme.primary : theme.line}`,
          borderRadius: theme.radiusButton,
          backgroundColor: theme.cream,
          boxShadow: focused ? `0 0 0 3px ${theme.primarySoft}` : undefined,
        }}
      >
        <button
          type="button"
          aria-label="One fewer billing month"
          disabled={value <= MIN_BILLING_MONTHS}
          onClick={() => onChange(value - 1)}
          className={`px-4 text-[16px] font-extrabold disabled:opacity-40 ${plannerFocusClass}`}
          style={{ color: theme.primary, fontFamily: theme.fontBody }}
        >
          −
        </button>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={focused ? draft : String(value)}
          onFocus={() => {
            setFocused(true);
            setDraft(String(value));
          }}
          onChange={(event) => commit(event.target.value)}
          onBlur={() => {
            if (!draft) onChange(value);
            setFocused(false);
          }}
          className={`min-w-0 flex-1 border-0 bg-transparent text-center text-[15px] font-medium tabular-nums outline-none ${calculatorFocusClass}`}
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        />
        <span className="text-[11px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          months
        </span>
        <button
          type="button"
          aria-label="One more billing month"
          disabled={value >= MAX_BILLING_MONTHS}
          onClick={() => onChange(value + 1)}
          className={`px-4 text-[16px] font-extrabold disabled:opacity-40 ${plannerFocusClass}`}
          style={{ color: theme.primary, fontFamily: theme.fontBody }}
        >
          +
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
        {MONTHS_HELP}
      </p>
    </div>
  );
}

function AdjustmentEditor({
  theme,
  idPrefix,
  title,
  help,
  enrollment,
  adjustment,
  onToggle,
  onChange,
}: {
  theme: ParentThemeTokens;
  idPrefix: string;
  title: string;
  help: string;
  enrollment: number;
  adjustment: GroupAdjustment;
  onToggle: (enabled: boolean) => void;
  onChange: (
    patch: Partial<Pick<GroupAdjustment, "mode" | "percentHundredths" | "amountCents" | "recipientCount">>,
  ) => void;
}) {
  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={adjustment.enabled}
        onClick={() => onToggle(!adjustment.enabled)}
        className={`flex w-full items-center justify-between gap-4 bg-transparent p-0 text-left ${plannerFocusClass}`}
      >
        <span>
          <strong className="block text-[13px]" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
            {title}
          </strong>
          <span className="mt-1 block text-[11px] leading-snug" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
            {help}
          </span>
        </span>
        <span
          className="flex h-[21px] w-[35px] shrink-0 items-center rounded-full p-[3px]"
          style={{ backgroundColor: adjustment.enabled ? theme.primary : "#DCE4DC" }}
        >
          <span
            className="h-[15px] w-[15px] rounded-full bg-white shadow-sm motion-safe:transition-transform"
            style={{ transform: adjustment.enabled ? "translateX(14px)" : undefined }}
          />
        </span>
      </button>
      {adjustment.enabled ? (
        <div
          className="mt-4 rounded-xl border p-4"
          style={{ backgroundColor: "#F7FAF6", borderColor: theme.line }}
        >
          <div className="grid grid-cols-1 gap-4 min-[481px]:grid-cols-2">
            <div>
              <label
                htmlFor={`${idPrefix}-mode`}
                className="mb-2 block text-[12px] font-bold"
                style={{ color: theme.ink, fontFamily: theme.fontBody }}
              >
                Discount format
              </label>
              <select
                id={`${idPrefix}-mode`}
                value={adjustment.mode}
                onChange={(event) => onChange({ mode: event.target.value === "fixed" ? "fixed" : "percent" })}
                className={`h-12 w-full rounded-xl border bg-white px-3 text-[14px] ${plannerFocusClass}`}
                style={{ borderColor: "#DDE4DA", color: theme.ink, fontFamily: theme.fontBody }}
              >
                <option value="percent">Percentage off tuition</option>
                <option value="fixed">Dollars off each month</option>
              </select>
            </div>
            {adjustment.mode === "percent" ? (
              <PercentField
                theme={theme}
                id={`${idPrefix}-percent`}
                label="Discount per student"
                hundredths={adjustment.percentHundredths}
                onChange={(percentHundredths) => onChange({ percentHundredths })}
              />
            ) : (
              <CalculatorMoneyField
                theme={theme}
                dense
                id={`${idPrefix}-amount`}
                label="Discount per student"
                description="Subtracted from this student's monthly tuition."
                suffix="/ month"
                valueCents={adjustment.amountCents}
                onChangeCents={(amountCents) => onChange({ amountCents })}
              />
            )}
            <div className="min-[481px]:col-span-2">
              <RecipientField
                theme={theme}
                id={`${idPrefix}-recipients`}
                value={adjustment.recipientCount}
                enrollment={enrollment}
                onChange={(recipientCount) => onChange({ recipientCount })}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PercentField({
  theme,
  id,
  label,
  hundredths,
  onChange,
}: {
  theme: ParentThemeTokens;
  id: string;
  label: string;
  hundredths: number;
  onChange: (hundredths: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(formatPercentHundredths(hundredths));
  const resting = formatPercentHundredths(hundredths);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[12px] font-bold" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
        {label}
      </label>
      <div
        className="flex h-12 items-center overflow-hidden"
        style={{
          border: `1px solid ${focused ? theme.primary : "#DDE4DA"}`,
          borderRadius: theme.radiusButton,
          backgroundColor: theme.white,
          boxShadow: focused ? `0 0 0 2px ${theme.primary}` : undefined,
        }}
      >
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={focused ? draft : resting}
          onFocus={() => {
            setFocused(true);
            setDraft(resting);
          }}
          onChange={(event) => {
            const next = sanitizePercentDraft(event.target.value);
            setDraft(next);
            const parsed = parsePercentDraft(next);
            if (parsed !== null) onChange(parsed);
          }}
          onBlur={() => {
            const parsed = parsePercentDraft(draft);
            onChange(parsed ?? hundredths);
            setFocused(false);
          }}
          className={`min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] tabular-nums outline-none ${calculatorFocusClass}`}
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        />
        <span className="pr-3 text-[11px]" style={{ color: theme.muted }} aria-hidden="true">
          %
        </span>
      </div>
    </div>
  );
}

function RecipientField({
  theme,
  id,
  value,
  enrollment,
  onChange,
}: {
  theme: ParentThemeTokens;
  id: string;
  value: number;
  enrollment: number;
  onChange: (value: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[12px] font-bold" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
        Students receiving this discount
      </label>
      <div
        className="flex h-12 items-center overflow-hidden"
        style={{
          border: `1px solid ${focused ? theme.primary : "#DDE4DA"}`,
          borderRadius: theme.radiusButton,
          backgroundColor: theme.white,
        }}
      >
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={focused ? draft : String(value)}
          onFocus={() => {
            setFocused(true);
            setDraft(value === 0 ? "" : String(value));
          }}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
            setDraft(digits);
            if (!digits) {
              onChange(0);
              return;
            }
            const parsed = Number.parseInt(digits, 10);
            if (Number.isFinite(parsed)) onChange(Math.min(MAX_PLANNER_ENROLLMENT, parsed));
          }}
          onBlur={() => {
            if (!draft) onChange(0);
            setFocused(false);
          }}
          className={`min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] tabular-nums outline-none ${calculatorFocusClass}`}
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        />
        <span className="pr-3 text-[11px] whitespace-nowrap" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          of {enrollment} students
        </span>
      </div>
    </div>
  );
}

function Disclosure({
  theme,
  title,
  open,
  onToggle,
  children,
}: {
  theme: ParentThemeTokens;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: theme.line, backgroundColor: "#FCFDFB" }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[12px] font-bold ${plannerFocusClass}`}
        style={{ color: theme.ink, fontFamily: theme.fontBody }}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 shrink-0 motion-safe:transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

function BreakdownRow({
  theme,
  label,
  cents,
  reduction = false,
  strong = false,
}: {
  theme: ParentThemeTokens;
  label: string;
  cents: number | null;
  reduction?: boolean;
  strong?: boolean;
}) {
  const amount =
    cents === null ? "—" : reduction && cents > 0 ? `−${formatCalculatorMoney(cents)}` : formatCalculatorMoney(cents);
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2 text-[11px] ${strong ? "mt-1 border-t pt-2.5" : ""}`}
      style={{ borderColor: theme.line, color: strong ? theme.ink : theme.muted }}
    >
      <dt className={strong ? "font-bold" : "font-normal"} style={{ color: strong ? theme.ink : theme.muted }}>
        {label}
      </dt>
      <dd className={`tabular-nums ${strong ? "font-bold" : "font-semibold"}`} style={{ color: theme.ink }}>
        {amount}
      </dd>
    </div>
  );
}

function formatPercentHundredths(hundredths: number): string {
  const value = hundredths / 100;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/0$/, "");
}

function sanitizePercentDraft(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = cleaned.split(".");
  const hasDot = rest.length > 0 || cleaned.endsWith(".");
  const fraction = rest.join("").slice(0, 2);
  const body = hasDot ? `${whole}.${fraction}` : whole;
  const parsed = Number.parseFloat(body);
  if (Number.isFinite(parsed) && parsed > 100) return "100";
  return body;
}

function parsePercentDraft(draft: string): number | null {
  if (!draft || draft === ".") return 0;
  if (draft.endsWith(".")) return null;
  const parsed = Number.parseFloat(draft);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return clampPercentHundredths(Math.round(parsed * 100));
}
