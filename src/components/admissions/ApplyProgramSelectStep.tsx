"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type ApplyProgramOption = {
  formVersionId: string;
  programName: string;
  formTitle: string;
  intro?: string | null;
};

type ApplyProgramSelectStepProps = {
  options: ApplyProgramOption[];
  disabled?: boolean;
  onSelect: (formVersionId: string) => void;
  C: AdminThemeTokens;
};

export default function ApplyProgramSelectStep({
  options,
  disabled = false,
  onSelect,
  C,
}: ApplyProgramSelectStepProps) {
  return (
    <ul className="space-y-3">
      {options.map((option) => (
        <li key={option.formVersionId}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.formVersionId)}
            className="flex w-full items-center justify-between rounded-xl border p-4 text-left shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:p-5"
            style={{
              borderColor: C.border,
              backgroundColor: C.surface,
            }}
          >
            <div className="min-w-0 pr-3">
              <p className="text-base font-semibold" style={{ color: C.textPrimary }}>
                {option.programName}
              </p>
              {option.intro ? (
                <p
                  className="mt-1 line-clamp-2 text-sm leading-relaxed"
                  style={{ color: C.textSecondary }}
                >
                  {option.intro}
                </p>
              ) : (
                <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                  {option.formTitle}
                </p>
              )}
            </div>
            <span
              className="shrink-0 text-sm font-semibold"
              style={{ color: C.accent }}
            >
              Apply
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function buildApplyProgramOptions(
  forms: { id: string; title: string; intro: string | null; program_id: string | null }[],
  programsById: Map<string, string>,
): ApplyProgramOption[] {
  return forms.map((form) => ({
    formVersionId: form.id,
    programName:
      (form.program_id && programsById.get(form.program_id)) ||
      form.title ||
      "Application",
    formTitle: form.title,
    intro: form.intro,
  }));
}
