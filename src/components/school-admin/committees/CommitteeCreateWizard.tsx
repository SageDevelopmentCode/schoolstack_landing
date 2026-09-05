"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BuilderQuestionCard,
  BuilderSectionIntro,
} from "@/components/school-admin/admissions/builder-question-card";
import TuitionWizardStepNav from "@/components/school-admin/tuition/TuitionWizardStepNav";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { CUSTOM_COMMITTEE_SLUG } from "@/lib/committees/templates";

export type CommitteeTemplateOption = {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  defaultTermLabel: string;
};

const STEPS = [
  { id: "template", title: "Choose a template", shortLabel: "Template" },
  { id: "name", title: "Name your committee", shortLabel: "Name" },
  { id: "term", title: "Set the term", shortLabel: "Term" },
  { id: "review", title: "Review and create", shortLabel: "Review" },
] as const;

const canvasTransition = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.18, ease: "easeOut" as const },
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

function textareaStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    ...inputStyle(C),
    resize: "vertical",
    minHeight: "88px",
  };
}

function ReviewBlock({
  C,
  title,
  stepIndex,
  onGoToStep,
  children,
}: {
  C: AdminThemeTokens;
  title: string;
  stepIndex: number;
  onGoToStep: (stepIndex: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {title}
        </p>
        <button
          type="button"
          onClick={() => onGoToStep(stepIndex)}
          className="text-sm font-medium shrink-0 cursor-pointer"
          style={{ color: C.accent }}
        >
          Edit
        </button>
      </div>
      <div
        className="rounded-lg p-4 text-sm"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        {children}
      </div>
    </div>
  );
}

function PreloadChecklist({ C }: { C: AdminThemeTokens }) {
  const items = [
    "Role guide & handbook",
    "Meeting dates & deadlines",
    "Starter tasks from template",
  ];

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
    >
      <p className="text-xs font-semibold" style={{ color: C.textSecondary }}>
        Preload checklist
      </p>
      <ul className="space-y-1.5 text-sm" style={{ color: C.textSecondary }}>
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0"
              style={{ backgroundColor: C.successBg, color: C.success }}
            >
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export type CommitteeCreateWizardProps = {
  C: AdminThemeTokens;
  options: CommitteeTemplateOption[];
  initialSelectedSlug?: string;
  onClose: () => void;
  onCreate: (input: {
    templateId: string | null;
    platformSlug: string;
    name: string;
    description: string;
    termLabel: string;
  }) => Promise<void> | void;
  showPreloadChecklist?: boolean;
  showCreateWorkspaceHint?: boolean;
};

export default function CommitteeCreateWizard({
  C,
  options,
  initialSelectedSlug,
  onClose,
  onCreate,
  showPreloadChecklist = false,
  showCreateWorkspaceHint = false,
}: CommitteeCreateWizardProps) {
  const initialSlug = initialSelectedSlug ?? options[0]?.slug ?? "";
  const initialOption = options.find((o) => o.slug === initialSlug) ?? options[0];

  const [stepIndex, setStepIndex] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [name, setName] = useState(
    initialOption?.slug === CUSTOM_COMMITTEE_SLUG ? "" : (initialOption?.name ?? ""),
  );
  const [description, setDescription] = useState(
    initialOption?.slug === CUSTOM_COMMITTEE_SLUG ? "" : (initialOption?.description ?? ""),
  );
  const [termLabel, setTermLabel] = useState(initialOption?.defaultTermLabel ?? "");
  const [saving, setSaving] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.slug === selectedSlug);
  const showHint = showCreateWorkspaceHint && !hintDismissed && stepIndex === STEPS.length - 1;

  const goToStep = (index: number) => {
    setStepIndex(index);
    setMaxReachedStep((prev) => Math.max(prev, index));
  };

  const goBack = () => {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  };

  const validateStep = (index: number): boolean => {
    if (index === 0) return Boolean(selected);
    if (index === 1) return Boolean(name.trim());
    return true;
  };

  const goNext = () => {
    if (!validateStep(stepIndex)) return;
    if (stepIndex < STEPS.length - 1) {
      goToStep(stepIndex + 1);
    }
  };

  const handleSelect = (option: CommitteeTemplateOption) => {
    setSelectedSlug(option.slug);
    if (option.slug === CUSTOM_COMMITTEE_SLUG) {
      setName("");
      setDescription("");
    } else {
      setName(option.name);
      setDescription(option.description);
    }
    setTermLabel(option.defaultTermLabel);
  };

  const handleCreate = async () => {
    if (!selected || !name.trim()) return;
    if (showHint) setHintDismissed(true);

    setSaving(true);
    try {
      await onCreate({
        templateId: selected.id,
        platformSlug: selected.slug,
        name: name.trim(),
        description: description.trim(),
        termLabel: termLabel.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (stepIndex === 1) {
      nameInputRef.current?.focus();
    } else if (stepIndex === 2) {
      termInputRef.current?.focus();
    }
  }, [stepIndex]);

  const canContinue = validateStep(stepIndex);
  const isFinalStep = stepIndex === STEPS.length - 1;

  const createButton = (
    <motion.button
      type="button"
      onClick={() => void handleCreate()}
      disabled={saving || !name.trim()}
      animate={
        showHint
          ? {
              boxShadow: [
                `0 0 0 0 color-mix(in srgb, ${C.accent} 65%, transparent)`,
                `0 0 0 10px color-mix(in srgb, ${C.accent} 0%, transparent)`,
                `0 0 0 0 color-mix(in srgb, ${C.accent} 65%, transparent)`,
              ],
            }
          : undefined
      }
      transition={
        showHint ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : undefined
      }
      style={{
        ...getAdminButtonStyle(C, "primary"),
        ...(showHint ? { outline: `2px solid ${C.accent}`, outlineOffset: "2px" } : {}),
      }}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? "Creating…" : "Create workspace"}
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 pt-6 pb-4 shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-start justify-between gap-4">
            <BuilderSectionIntro
              C={C}
              title="Create committee"
              subtitle="Answer a few questions to spin up a volunteer workspace."
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md shrink-0 cursor-pointer"
              style={{ color: C.textTertiary }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <TuitionWizardStepNav
            C={C}
            steps={STEPS}
            stepIndex={stepIndex}
            maxReachedStep={maxReachedStep}
            disabled={saving}
            onGoToStep={goToStep}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {stepIndex === 0 ? (
              <motion.div key="template" {...canvasTransition}>
                <BuilderQuestionCard
                  C={C}
                  tone="accent"
                  question="What kind of committee are you setting up?"
                  helper="Pick a starting point — we'll preload roles, tasks, and resources from the template."
                >
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {options.map((option, index) => {
                      const isCustom = option.slug === CUSTOM_COMMITTEE_SLUG;
                      const showDivider =
                        isCustom && index > 0 && options[index - 1]?.slug !== CUSTOM_COMMITTEE_SLUG;

                      return (
                        <div key={option.slug}>
                          {showDivider ? (
                            <div
                              className="my-3 border-t"
                              style={{ borderColor: C.border }}
                            />
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleSelect(option)}
                            className="w-full text-left p-3 rounded-lg border transition-colors cursor-pointer"
                            style={{
                              borderColor: selectedSlug === option.slug ? C.accent : C.border,
                              backgroundColor:
                                selectedSlug === option.slug ? C.accentLight : C.surface,
                            }}
                          >
                            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                              {option.name}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
                              {option.description}
                            </p>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {showPreloadChecklist && selected ? (
                    <div className="mt-4">
                      <PreloadChecklist C={C} />
                    </div>
                  ) : null}
                </BuilderQuestionCard>
              </motion.div>
            ) : null}

            {stepIndex === 1 ? (
              <motion.div key="name" {...canvasTransition}>
                <BuilderQuestionCard
                  C={C}
                  tone="clay"
                  question="What should this committee be called?"
                  helper="Families and volunteers will see this name and short description in the portal."
                >
                  <div className="space-y-3">
                    <div>
                      <label
                        className="block text-xs font-medium mb-1.5"
                        style={{ color: C.textSecondary }}
                      >
                        Committee name
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={selected?.slug === CUSTOM_COMMITTEE_SLUG ? "Committee name" : (selected?.name ?? "Committee name")}
                        style={inputStyle(C)}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium mb-1.5"
                        style={{ color: C.textSecondary }}
                      >
                        Short description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A brief summary for the committees list and workspace header…"
                        rows={4}
                        style={textareaStyle(C)}
                      />
                    </div>
                  </div>
                </BuilderQuestionCard>
              </motion.div>
            ) : null}

            {stepIndex === 2 ? (
              <motion.div key="term" {...canvasTransition}>
                <BuilderQuestionCard
                  C={C}
                  tone="info"
                  question="What school year or term is this for?"
                  helper="e.g. 2025–2026 School Year or Fall Festival 2025"
                >
                  <input
                    ref={termInputRef}
                    type="text"
                    value={termLabel}
                    onChange={(e) => setTermLabel(e.target.value)}
                    placeholder={selected?.defaultTermLabel ?? "School year or term"}
                    style={inputStyle(C)}
                  />
                </BuilderQuestionCard>
              </motion.div>
            ) : null}

            {stepIndex === 3 ? (
              <motion.div key="review" {...canvasTransition} className="space-y-4">
                <BuilderQuestionCard
                  C={C}
                  tone="success"
                  question="Ready to create your committee workspace?"
                  helper="You can adjust settings, members, and tasks after the workspace is created."
                />
                <ReviewBlock C={C} title="Template" stepIndex={0} onGoToStep={goToStep}>
                  <p className="font-medium" style={{ color: C.textPrimary }}>
                    {selected?.name ?? "—"}
                  </p>
                  {selected?.description ? (
                    <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
                      {selected.description}
                    </p>
                  ) : null}
                </ReviewBlock>
                <ReviewBlock C={C} title="Committee name" stepIndex={1} onGoToStep={goToStep}>
                  <p style={{ color: C.textPrimary }}>{name.trim() || "—"}</p>
                  {description.trim() ? (
                    <p className="mt-2 text-xs whitespace-pre-wrap" style={{ color: C.textSecondary }}>
                      {description.trim()}
                    </p>
                  ) : null}
                </ReviewBlock>
                <ReviewBlock C={C} title="Term" stepIndex={2} onGoToStep={goToStep}>
                  <p style={{ color: C.textPrimary }}>{termLabel.trim() || "—"}</p>
                </ReviewBlock>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div
          className={`px-6 py-4 flex items-center justify-between gap-3 shrink-0${
            showHint ? " overflow-visible" : ""
          }`}
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <div>
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={saving}
                className="text-sm px-4 py-2 rounded-md cursor-pointer disabled:opacity-50"
                style={{ color: C.textSecondary }}
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="text-sm px-4 py-2 rounded-md cursor-pointer disabled:opacity-50"
                style={{ color: C.textSecondary }}
              >
                Cancel
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {!isFinalStep ? (
              <button
                type="button"
                onClick={goNext}
                disabled={saving || !canContinue}
                style={getAdminButtonStyle(C, "primary")}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : showHint ? (
              <div className="relative inline-flex">
                {createButton}
                <motion.div
                  aria-hidden
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute left-1/2 top-full z-20 flex -translate-x-1/2 pt-1 select-none"
                >
                  <span className="text-3xl leading-none">👆</span>
                </motion.div>
              </div>
            ) : (
              createButton
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
