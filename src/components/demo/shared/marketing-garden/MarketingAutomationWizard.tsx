"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  CreditCard,
  Layers,
  Loader2,
  Mail,
  Megaphone,
  PhoneCall,
  Plus,
  Star,
  X,
  Zap,
} from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import {
  GChip,
  GKicker,
  GProgress,
  G_FOCUS,
  G_INPUT,
  G_LABEL,
  G_TOGGLE,
  G_TOGGLE_OFF,
  G_TOGGLE_ON,
  gBtnOutlineSm,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import {
  WIZARD_AGE_GROUPS,
  WIZARD_PROGRAMS,
  WIZARD_SEGMENTS,
  WIZARD_STEP_TYPES,
  WIZARD_TEMPLATES,
  WIZARD_TRIGGERS,
  buildNewPipeline,
  computeAudienceCount,
  type AutomationPipeline,
  type AutomationStep,
  type WizardState,
} from "@/data/school-demos/demo-marketing-automations";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { STEP_TINTS, StepIcon } from "./parts";

const STEP_LABELS = ["Template", "Trigger", "Audience", "Build Flow", "Launch"];
/** The mock's "All leads" segment size: the audience bar's 100%. */
const AUDIENCE_TOTAL = 47;
const LAUNCHING_MS = 1200;
const CLOSE_AFTER_MS = 3000;

/** Selectable option card (template, trigger, segment). */
const OPTION_BASE = `w-full rounded-[16px] border-[1.5px] text-left transition-all duration-200 ${G_FOCUS}`;
const OPTION_ON = "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)] shadow-[0_2px_0_0_var(--sf-ink)]";
const OPTION_OFF = "border-[var(--sf-ink)]/12 bg-white hover:border-[var(--sf-ink)]/30 hover:bg-[var(--sf-accent-wash)]";

function TriggerIcon({ id }: { id: string }) {
  const cls = "h-4 w-4";
  if (id === "inquiry") return <Mail className={cls} aria-hidden />;
  if (id === "tour_booked") return <PhoneCall className={cls} aria-hidden />;
  if (id === "enrolled") return <CheckCircle className={cls} aria-hidden />;
  if (id === "payment_overdue") return <CreditCard className={cls} aria-hidden />;
  if (id === "cold_lead") return <Clock className={cls} aria-hidden />;
  return <Zap className={cls} aria-hidden />;
}

function StepIntro({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-4">
      <h3 className="m-0 text-[16px] font-extrabold text-[var(--sf-ink)]">{title}</h3>
      <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">{body}</p>
    </div>
  );
}

/** Step strip under the title: numbers turn into checks. */
function WizardStepStrip({ step }: { step: WizardState["step"] }) {
  return (
    <ol className="m-0 flex list-none items-center gap-0 p-0" aria-label="Progress">
      {[1, 2, 3, 4].map((n, i) => {
        const done = step > n;
        const active = step === n;
        return (
          <li key={n} className={`flex items-center ${i < 3 ? "flex-1" : ""}`}>
            <span
              aria-current={active ? "step" : undefined}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[12px] font-extrabold tabular-nums ${
                done
                  ? "border-[var(--sf-forest)] bg-[var(--sf-mint)] text-[var(--sf-forest)]"
                  : active
                    ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                    : "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/50"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : n}
              <span className="sr-only">
                {` ${STEP_LABELS[n - 1]}${done ? " (done)" : active ? " (current)" : ""}`}
              </span>
            </span>
            {i < 3 ? (
              <span
                aria-hidden
                className={`mx-1.5 h-[1.5px] flex-1 ${done ? "bg-[var(--sf-forest)]/50" : "bg-[var(--sf-ink)]/12"}`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * "+ New automation" wizard from the old marketing mock, as a Garden
 * `GDialog`: Template → Trigger → Audience → Build flow → Launch. The created
 * pipeline is in-memory only (`buildNewPipeline`), exactly like the mock.
 */
export default function MarketingAutomationWizard({
  theme,
  open,
  state,
  onChange,
  onClose,
  onCreatePipeline,
  portalContainer,
}: {
  theme: ParentThemeTokens;
  open: boolean;
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  onClose: () => void;
  onCreatePipeline: (pipeline: AutomationPipeline) => void;
  portalContainer: HTMLElement | null;
}) {
  const [addPickerIndex, setAddPickerIndex] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const audienceCount = computeAudienceCount(state.audienceKey, state.programFilters, state.ageFilters);
  const busy = state.launching || state.launched;

  function handleNext() {
    if (state.step >= 5) return;
    const next = (state.step + 1) as WizardState["step"];
    if (state.step === 1 && state.templateId && state.templateId !== "scratch") {
      const tmpl = WIZARD_TEMPLATES.find((t) => t.id === state.templateId);
      if (tmpl) {
        onChange({
          step: next,
          triggerKey: state.triggerKey ?? tmpl.defaultTriggerKey,
          audienceKey: state.audienceKey ?? tmpl.defaultAudienceKey,
          flowSteps: state.flowSteps.length > 0 ? state.flowSteps : tmpl.defaultSteps,
          automationName: state.automationName || tmpl.defaultAutomationName,
        });
        return;
      }
    }
    onChange({ step: next });
  }

  function handleBack() {
    if (state.step <= 1) return;
    setAddPickerIndex(null);
    onChange({ step: (state.step - 1) as WizardState["step"] });
  }

  function handleLaunch() {
    const snapshot = state;
    onChange({ launching: true });
    timersRef.current.push(
      window.setTimeout(() => onChange({ launching: false, launched: true }), LAUNCHING_MS),
      window.setTimeout(() => {
        onCreatePipeline(buildNewPipeline(snapshot));
        onClose();
      }, CLOSE_AFTER_MS),
    );
  }

  function addStep(type: AutomationStep["type"], atIndex: number) {
    const newStep: AutomationStep = {
      type,
      label:
        type === "email" ? "New Email" : type === "sms" ? "New SMS" : type === "wait" ? "Wait 2 days" : "If/Then Branch",
      delay: "Next",
    };
    const steps = [...state.flowSteps];
    steps.splice(atIndex, 0, newStep);
    onChange({ flowSteps: steps });
    setAddPickerIndex(null);
  }

  function removeStep(index: number) {
    const steps = [...state.flowSteps];
    steps.splice(index, 1);
    onChange({ flowSteps: steps });
  }

  const canContinue =
    state.step === 1
      ? state.templateId !== null
      : state.step === 2
        ? state.triggerKey !== null
        : state.step === 3
          ? state.audienceKey !== null
          : true;

  // Estimate duration from the flow's wait steps.
  const estDays = state.flowSteps.reduce((acc, s) => {
    if (s.type === "wait" && s.delay) {
      const m = s.delay.match(/\d+/);
      if (m) return acc + parseInt(m[0], 10);
    }
    return acc;
  }, 0);

  const description = state.launched
    ? "Done!"
    : `Step ${Math.min(state.step, 4)} of 4 — ${STEP_LABELS[state.step - 1]}`;

  const footer = busy ? null : (
    <div className="flex w-full items-center gap-3">
      {state.step > 1 ? (
        <button type="button" onClick={handleBack} className={gBtnOutlineSm}>
          Back
        </button>
      ) : null}
      {state.step < 5 ? (
        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className={`${gBtnPopSm} ml-auto`}
          data-testid="demo-marketing-wizard-next"
        >
          {state.step === 3 ? "Build Flow" : "Continue"} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleLaunch}
          className={`${gBtnPopSm} ml-auto`}
          data-testid="demo-marketing-wizard-launch"
        >
          Launch Automation <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );

  const stepPicker = (atIndex: number) => (
    <div className="my-2 grid grid-cols-4 gap-1.5 rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] p-2">
      {WIZARD_STEP_TYPES.map((st) => (
        <button
          key={st.type}
          type="button"
          onClick={() => addStep(st.type, atIndex)}
          className={`flex flex-col items-center gap-1 rounded-[12px] bg-white px-1 py-2 text-[12px] font-extrabold text-[var(--sf-ink)] ring-[1.5px] ring-[var(--sf-ink)]/10 transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
        >
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${STEP_TINTS[st.type]}`}>
            <StepIcon type={st.type} />
          </span>
          {st.label}
        </button>
      ))}
    </div>
  );

  let body: ReactNode = null;
  if (state.step === 1) {
    body = (
      <div>
        <StepIntro title="Choose a starting point" body="Pick a pre-built template or start from scratch." />
        <div className="grid gap-2.5 sm:grid-cols-2">
          {WIZARD_TEMPLATES.map((tmpl) => {
            const selected = state.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ templateId: tmpl.id })}
                className={`${OPTION_BASE} ${selected ? OPTION_ON : OPTION_OFF} flex flex-col gap-2 p-3.5`}
              >
                <span className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sf-butter)] text-[var(--sf-ink)] ring-[1.5px] ring-[var(--sf-ink)]/10">
                    <Megaphone className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[14px] font-extrabold leading-tight text-[var(--sf-ink)]">{tmpl.name}</span>
                      {tmpl.recommended ? (
                        <GChip tone="info" className="!px-2 !text-[11px]">
                          <Star className="h-3 w-3" aria-hidden /> Recommended
                        </GChip>
                      ) : null}
                    </span>
                  </span>
                </span>
                <span className="text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">{tmpl.description}</span>
                <span className="flex flex-wrap gap-1">
                  <GChip tone="neutral" className="!text-[11px] tabular-nums">
                    {tmpl.steps} steps
                  </GChip>
                  <GChip tone="success" className="!text-[11px] tabular-nums">
                    {tmpl.openRate}% open
                  </GChip>
                  <GChip tone="neutral" className="!text-[11px] tabular-nums">
                    {tmpl.resultLabel}
                  </GChip>
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-pressed={state.templateId === "scratch"}
          onClick={() => onChange({ templateId: "scratch", flowSteps: [], automationName: "" })}
          className={`mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-[16px] border-[1.5px] border-dashed py-3 text-[13px] font-extrabold transition-all duration-200 ${G_FOCUS} ${
            state.templateId === "scratch"
              ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)] text-[var(--sf-ink)]"
              : "border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/40 hover:text-[var(--sf-ink)]"
          }`}
        >
          <Layers className="h-4 w-4" aria-hidden />
          Start from scratch
        </button>
      </div>
    );
  } else if (state.step === 2) {
    body = (
      <div>
        <StepIntro title="What kicks off this automation?" body="Choose the event that starts this sequence." />
        <div className="flex flex-col gap-2">
          {WIZARD_TRIGGERS.map((trig) => {
            const selected = state.triggerKey === trig.id;
            return (
              <button
                key={trig.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ triggerKey: trig.id })}
                className={`${OPTION_BASE} ${selected ? OPTION_ON : OPTION_OFF} flex items-center gap-3 p-3`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--sf-sky)] text-[#24507a] ring-[1.5px] ring-[var(--sf-ink)]/10">
                  <TriggerIcon id={trig.id} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">{trig.title}</span>
                  <span className="block text-[12.5px] font-semibold text-[var(--sf-soft)]">{trig.subtitle}</span>
                </span>
                {selected ? <Check className="h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  } else if (state.step === 3) {
    body = (
      <div>
        <StepIntro title="Who receives this?" body="Select the segment, then refine with optional filters." />
        <div className="mb-5 flex flex-col gap-2">
          {WIZARD_SEGMENTS.map((seg) => {
            const selected = state.audienceKey === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ audienceKey: seg.id })}
                className={`${OPTION_BASE} ${selected ? OPTION_ON : OPTION_OFF} flex items-center gap-3 px-3.5 py-2.5`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">{seg.label}</span>
                  <span className="block text-[12.5px] font-semibold text-[var(--sf-soft)]">{seg.description}</span>
                </span>
                <GChip tone={selected ? "info" : "neutral"} className="tabular-nums">
                  {seg.count}
                </GChip>
              </button>
            );
          })}
        </div>

        {[
          { title: "Refine by program", options: WIZARD_PROGRAMS, key: "programFilters" as const },
          { title: "Refine by age group", options: WIZARD_AGE_GROUPS, key: "ageFilters" as const },
        ].map((group) => (
          <div key={group.key} className="mb-4">
            <GKicker className="mb-2">{group.title}</GKicker>
            <div role="group" aria-label={group.title} className="flex flex-wrap gap-1.5">
              {group.options.map((option) => {
                const selected = state[group.key].includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({
                        [group.key]: selected
                          ? state[group.key].filter((x) => x !== option)
                          : [...state[group.key], option],
                      })
                    }
                    className={`${G_TOGGLE} ${selected ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3.5">
          <p className="m-0 mb-2 text-[13px] font-semibold text-[var(--sf-ink)]/75" aria-live="polite">
            <span className="font-extrabold tabular-nums text-[var(--sf-clay-deep)]">{audienceCount}</span> families
            will receive this automation
          </p>
          <GProgress
            value={Math.min(audienceCount, AUDIENCE_TOTAL)}
            total={AUDIENCE_TOTAL}
            label={`${audienceCount} families will receive this automation`}
          />
        </div>
      </div>
    );
  } else if (state.step === 4) {
    body = (
      <div>
        <StepIntro title="Build your automation flow" body="Click + to add steps. Hover a step to remove it." />
        {state.flowSteps.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/18 bg-[var(--sf-paper)] py-10">
            <Layers className="h-6 w-6 text-[var(--sf-ink)]/35" aria-hidden />
            <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">Your flow is empty.</p>
            {addPickerIndex === 0 ? (
              <div className="w-full max-w-sm px-3">{stepPicker(0)}</div>
            ) : (
              <button type="button" onClick={() => setAddPickerIndex(0)} className={gBtnOutlineSm}>
                <Plus className="h-4 w-4" aria-hidden /> Add first step
              </button>
            )}
          </div>
        ) : (
          <ol className="m-0 flex list-none flex-col p-0">
            {state.flowSteps.map((step, i) => (
              <li key={`${step.label}-${i}`}>
                <div className="group relative flex items-center gap-3 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 py-2.5">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-[1.5px] ring-[var(--sf-ink)]/10 ${STEP_TINTS[step.type]}`}
                  >
                    <StepIcon type={step.type} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{step.label}</span>
                    {step.delay ? (
                      <span className="text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">{step.delay}</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    aria-label={`Remove ${step.label}`}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/70 opacity-0 transition-opacity hover:bg-[var(--sf-peach)] hover:text-[var(--sf-clay-deep)] focus-visible:opacity-100 group-hover:opacity-100 ${G_FOCUS}`}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                <div className="flex justify-center py-1">
                  <button
                    type="button"
                    onClick={() => setAddPickerIndex(addPickerIndex === i + 1 ? null : i + 1)}
                    aria-label={`Add a step after ${step.label}`}
                    aria-expanded={addPickerIndex === i + 1}
                    className={`flex h-6 w-6 items-center justify-center rounded-full bg-white text-[var(--sf-ink)]/60 ring-[1.5px] ring-[var(--sf-ink)]/15 transition-colors hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)] ${G_FOCUS}`}
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                {addPickerIndex === i + 1 ? stepPicker(i + 1) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  } else if (state.launching) {
    body = (
      <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--sf-clay)] motion-reduce:animate-none" aria-hidden />
        <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">Setting up your automation…</p>
      </div>
    );
  } else if (state.launched) {
    const live = state.launchMode === "live";
    body = (
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-[18px] bg-[var(--sf-mint)] px-4 py-12 text-center"
        role="status"
      >
        <Tick className="h-10 w-10 text-[var(--sf-forest)]" />
        <p className="sf-display m-0 text-[1.5rem] text-[var(--sf-forest)]">
          {live ? "Automation is live!" : "Saved as a draft"}
        </p>
        <p className="m-0 text-[13px] font-semibold text-[var(--sf-ink)]/70">
          <span className="font-extrabold text-[var(--sf-ink)]">{state.automationName || "Your automation"}</span>{" "}
          {live ? "has been activated." : "has been saved."}
        </p>
      </div>
    );
  } else {
    body = (
      <div>
        <StepIntro title="Almost there — name your automation" body="Review the summary, then launch when ready." />
        <label className={G_LABEL} htmlFor="demo-marketing-automation-name">
          Automation name
        </label>
        <input
          id="demo-marketing-automation-name"
          type="text"
          value={state.automationName}
          onChange={(event) => onChange({ automationName: event.target.value })}
          className={`${G_INPUT} mb-4`}
          placeholder="Automation name…"
          data-autofocus
        />
        <div role="group" aria-label="Launch mode" className="mb-4 grid grid-cols-2 gap-2">
          {(["live", "draft"] as const).map((mode) => {
            const active = state.launchMode === mode;
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ launchMode: mode })}
                className={`${G_TOGGLE} ${active ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
              >
                {mode === "live" ? "Go Live Now" : "Save as Draft"}
              </button>
            );
          })}
        </div>
        <div className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4">
          <GKicker className="mb-3">Summary</GKicker>
          <dl className="m-0 grid grid-cols-2 gap-3">
            {[
              { label: "Audience", value: `${audienceCount} families` },
              { label: "Steps", value: `${state.flowSteps.length} steps` },
              { label: "First send", value: "On trigger" },
              { label: "Est. duration", value: estDays > 0 ? `~${estDays} days` : "Immediate" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-[12px] font-semibold text-[var(--sf-soft)]">{item.label}</dt>
                <dd className="m-0 text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  return (
    <GDialog
      theme={theme}
      open={open}
      onClose={onClose}
      closeDisabled={busy}
      hideCloseButton={busy}
      title="New Automation"
      description={description}
      icon={<Megaphone className="h-5 w-5" aria-hidden />}
      headerExtra={busy ? null : <WizardStepStrip step={state.step} />}
      footer={footer}
      footerBordered
      size="lg"
      portalContainer={portalContainer}
      data-testid="demo-marketing-wizard"
    >
      {body}
    </GDialog>
  );
}
