"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Users } from "lucide-react";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { GKicker, G_FOCUS, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { GardenField, gInputClass } from "@/components/school-admin/garden/kit";
import { CUSTOM_COMMITTEE_SLUG } from "@/lib/committees/templates";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  COMMITTEE_CREATE_STEPS,
  useCommitteeCreateWizard,
  type CommitteeTemplateOption,
} from "../useCommitteeCreateWizard";
import type { CreateCommitteeInput } from "../useCommitteesModel";

/** Numbered step pills in the dialog header; reached steps can be revisited. */
function StepPills({
  stepIndex,
  maxReachedStep,
  onGoToStep,
  disabled,
}: {
  stepIndex: number;
  maxReachedStep: number;
  onGoToStep: (index: number) => void;
  disabled: boolean;
}) {
  return (
    <ol aria-label="Steps" className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
      {COMMITTEE_CREATE_STEPS.map((step, index) => {
        const current = index === stepIndex;
        const done = index < stepIndex;
        const reachable = !current && index <= maxReachedStep && !disabled;
        return (
          <li key={step.id} className="flex items-center gap-1.5">
            {index > 0 ? <ArrowRight className="h-3.5 w-3.5 text-[var(--sf-ink)]/30" aria-hidden /> : null}
            <button
              type="button"
              onClick={() => onGoToStep(index)}
              disabled={!reachable}
              aria-current={current ? "step" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[12.5px] font-extrabold transition-colors disabled:cursor-default ${
                current
                  ? "bg-[var(--sf-clay)] text-white"
                  : done
                    ? "border-[1.5px] border-[var(--sf-forest)]/30 bg-[var(--sf-mint)] py-[3px] text-[var(--sf-ink)]"
                    : "border-[1.5px] border-[var(--sf-ink)]/15 bg-white py-[3px] text-[var(--sf-ink)]/55"
              } ${G_FOCUS} focus-visible:ring-offset-0`}
            >
              <span
                aria-hidden
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  current
                    ? "bg-white text-[var(--sf-clay-deep)]"
                    : done
                      ? "bg-[var(--sf-forest)] text-white"
                      : "border-[1.5px] border-[var(--sf-ink)]/25"
                }`}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
              </span>
              <span className="sr-only">Step {index + 1}: </span>
              {step.shortLabel}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function ReviewRow({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <GKicker>{label}</GKicker>
        <button type="button" className={`${gLinkSm} !text-[12.5px]`} onClick={onEdit}>
          Edit
        </button>
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/**
 * "New committee" in the admin Garden look: Template → Name → Term → Review,
 * with the same step rules as the story wizard (shared hook). Create stays
 * busy until the save finishes; on failure the dialog keeps every answer.
 */
export default function GardenCreateCommitteeDialog({
  theme,
  open,
  options,
  onClose,
  onCreate,
}: {
  theme: ParentThemeTokens;
  open: boolean;
  options: CommitteeTemplateOption[];
  onClose: () => void;
  /** Resolves true when the committee was created. */
  onCreate: (input: CreateCommitteeInput) => Promise<boolean>;
}) {
  const wizard = useCommitteeCreateWizard(options);
  const [saving, setSaving] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const termRef = useRef<HTMLInputElement>(null);
  const { stepIndex, selected } = wizard;

  useEffect(() => {
    const target = stepIndex === 1 ? nameRef.current : stepIndex === 2 ? termRef.current : null;
    // Focus and select the prefilled answer so typing replaces it.
    if (target)
      window.setTimeout(() => {
        target.focus();
        target.select();
      }, 60);
  }, [stepIndex]);

  const handleCreate = async () => {
    if (!wizard.input || !wizard.input.name) return;
    setSaving(true);
    try {
      const ok = await onCreate(wizard.input);
      if (ok) onClose();
    } finally {
      setSaving(false);
    }
  };

  const nameError = nameTouched && !wizard.name.trim() ? "Give the committee a name to continue." : null;

  const footer = (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      {stepIndex > 0 ? (
        <button type="button" className={gBtnOutlineSm} onClick={wizard.goBack} disabled={saving}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
      ) : (
        <button type="button" className={gBtnOutlineSm} onClick={onClose} disabled={saving}>
          Cancel
        </button>
      )}
      {wizard.isFinalStep ? (
        <button
          type="button"
          className={gBtnPopSm}
          onClick={() => void handleCreate()}
          disabled={saving || !wizard.name.trim()}
          aria-busy={saving || undefined}
          data-testid="committee-create-submit"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Creating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden />
              Create workspace
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          className={gBtnPopSm}
          onClick={() => {
            if (stepIndex === 1) setNameTouched(true);
            wizard.goNext();
          }}
          disabled={saving || (stepIndex === 0 && !wizard.canContinue)}
        >
          Next: {COMMITTEE_CREATE_STEPS[stepIndex + 1]?.shortLabel.toLowerCase()}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );

  return (
    <GDialog
      theme={theme}
      open={open}
      onClose={onClose}
      closeDisabled={saving}
      title="New committee"
      icon={<Users />}
      size="xl"
      footer={footer}
      footerBordered
      data-testid="committee-create-dialog"
      description="Answer a few questions to spin up a volunteer workspace. You can change everything later."
      headerExtra={
        <StepPills
          stepIndex={stepIndex}
          maxReachedStep={wizard.maxReachedStep}
          onGoToStep={wizard.goToStep}
          disabled={saving}
        />
      }
    >
      {stepIndex === 0 ? (
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-1 text-[15px] font-extrabold text-[var(--sf-ink)]">
            What kind of committee are you setting up?
          </legend>
          <p className="m-0 mb-3 text-[13px] font-semibold text-[var(--sf-soft)]">
            Pick a starting point — we&apos;ll preload roles, tasks, and resources from the template.
          </p>
          <div role="radiogroup" aria-label="Committee template" className="flex flex-col gap-2">
            {options.map((option, index) => {
              const isCustom = option.slug === CUSTOM_COMMITTEE_SLUG;
              const active = wizard.selectedSlug === option.slug;
              const showDivider = isCustom && index > 0 && options[index - 1]?.slug !== CUSTOM_COMMITTEE_SLUG;
              return (
                <div key={option.slug}>
                  {showDivider ? <div aria-hidden className="my-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15" /> : null}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => wizard.selectTemplate(option)}
                    className={`flex w-full items-start gap-3 rounded-[16px] border-[1.5px] p-3.5 text-left transition-colors ${
                      active
                        ? "border-[var(--sf-ink)] bg-[var(--sf-accent-wash)] shadow-[0_2px_0_0_rgba(43,36,29,0.12)]"
                        : "border-[var(--sf-ink)]/12 bg-white hover:border-[var(--sf-ink)]/35"
                    } ${G_FOCUS} focus-visible:ring-offset-0`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                        active ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white" : "border-[var(--sf-ink)]/25 bg-white"
                      }`}
                    >
                      {active ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-extrabold text-[var(--sf-ink)]">{option.name}</span>
                      {option.description ? (
                        <span className="mt-0.5 block text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </fieldset>
      ) : stepIndex === 1 ? (
        <div className="space-y-4">
          <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">What should this committee be called?</p>
          <GardenField
            id="committee-create-name"
            label="Committee name"
            required
            error={nameError}
            hint="Families and volunteers see this name in the portal."
          >
            <input
              ref={nameRef}
              id="committee-create-name"
              type="text"
              value={wizard.name}
              onChange={(e) => wizard.setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setNameTouched(true);
                  wizard.goNext();
                }
              }}
              placeholder={selected?.slug === CUSTOM_COMMITTEE_SLUG ? "Committee name" : (selected?.name ?? "Committee name")}
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? "committee-create-name-error" : "committee-create-name-hint"}
              className={gInputClass(nameError)}
            />
          </GardenField>
          <GardenField
            id="committee-create-description"
            label="Short description"
            optional
            hint="A brief summary for the committees list and workspace header."
          >
            <textarea
              id="committee-create-description"
              value={wizard.description}
              onChange={(e) => wizard.setDescription(e.target.value)}
              rows={4}
              placeholder="What does this committee do?"
              className={`${gInputClass()} min-h-[96px] resize-y`}
            />
          </GardenField>
        </div>
      ) : stepIndex === 2 ? (
        <div className="space-y-4">
          <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">What school year or term is this for?</p>
          <GardenField id="committee-create-term" label="Term" optional hint="e.g. 2025–2026 School Year or Fall Festival 2025">
            <input
              ref={termRef}
              id="committee-create-term"
              type="text"
              value={wizard.termLabel}
              onChange={(e) => wizard.setTermLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") wizard.goNext();
              }}
              placeholder={selected?.defaultTermLabel || "School year or term"}
              className={gInputClass()}
            />
          </GardenField>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="m-0 rounded-2xl bg-[var(--sf-mint)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--sf-ink)]/85">
            Ready to create your committee workspace? You&apos;ll land on Members so you can invite people right away.
          </p>
          <ReviewRow label="Template" onEdit={() => wizard.goToStep(0)}>
            <p className="m-0 text-[14.5px] font-extrabold text-[var(--sf-ink)]">{selected?.name ?? "—"}</p>
          </ReviewRow>
          <ReviewRow label="Name" onEdit={() => wizard.goToStep(1)}>
            <p className="m-0 text-[14.5px] font-extrabold text-[var(--sf-ink)]">{wizard.name.trim() || "—"}</p>
            {wizard.description.trim() ? (
              <p className="m-0 mt-1 whitespace-pre-wrap text-[13px] font-semibold text-[var(--sf-soft)]">
                {wizard.description.trim()}
              </p>
            ) : null}
          </ReviewRow>
          <ReviewRow label="Term" onEdit={() => wizard.goToStep(2)}>
            <p className="m-0 text-[14.5px] font-extrabold text-[var(--sf-ink)]">{wizard.termLabel.trim() || "—"}</p>
          </ReviewRow>
        </div>
      )}
    </GDialog>
  );
}
