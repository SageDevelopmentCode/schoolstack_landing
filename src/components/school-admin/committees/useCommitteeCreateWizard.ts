"use client";

import { useState } from "react";
import { CUSTOM_COMMITTEE_SLUG } from "@/lib/committees/templates";

export type CommitteeTemplateOption = {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  defaultTermLabel: string;
};

export const COMMITTEE_CREATE_STEPS = [
  { id: "template", title: "Choose a template", shortLabel: "Template" },
  { id: "name", title: "Name your committee", shortLabel: "Name" },
  { id: "term", title: "Set the term", shortLabel: "Term" },
  { id: "review", title: "Review and create", shortLabel: "Review" },
] as const;

/**
 * Step state for "Create committee", shared by the story wizard (marketing
 * demo) and the admin Garden dialog so both behave the same.
 */
export function useCommitteeCreateWizard(options: CommitteeTemplateOption[], initialSelectedSlug?: string) {
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

  const selected = options.find((o) => o.slug === selectedSlug);

  const goToStep = (index: number) => {
    setStepIndex(index);
    setMaxReachedStep((prev) => Math.max(prev, index));
  };

  const validateStep = (index: number): boolean => {
    if (index === 0) return Boolean(selected);
    if (index === 1) return Boolean(name.trim());
    return true;
  };

  const goBack = () => {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  };

  const goNext = () => {
    if (!validateStep(stepIndex)) return;
    if (stepIndex < COMMITTEE_CREATE_STEPS.length - 1) goToStep(stepIndex + 1);
  };

  const selectTemplate = (option: CommitteeTemplateOption) => {
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

  const input = selected
    ? {
        templateId: selected.id,
        platformSlug: selected.slug,
        name: name.trim(),
        description: description.trim(),
        termLabel: termLabel.trim(),
      }
    : null;

  return {
    stepIndex,
    maxReachedStep,
    selectedSlug,
    selected,
    name,
    setName,
    description,
    setDescription,
    termLabel,
    setTermLabel,
    goToStep,
    goBack,
    goNext,
    validateStep,
    selectTemplate,
    canContinue: validateStep(stepIndex),
    isFinalStep: stepIndex === COMMITTEE_CREATE_STEPS.length - 1,
    /** Ready-to-send create input (null until a template is chosen). */
    input,
  };
}
