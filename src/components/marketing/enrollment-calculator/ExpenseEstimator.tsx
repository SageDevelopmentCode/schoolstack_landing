"use client";

import { useState } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import CalculatorDialog from "@/components/marketing/enrollment-calculator/CalculatorDialog";
import {
  CalculatorMoneyField,
  calculatorFocusClass,
} from "@/components/marketing/enrollment-calculator/CalculatorFields";
import { CALCULATOR_COPY } from "@/components/marketing/enrollment-calculator/enrollment-copy";
import { formatCalculatorMoney } from "@/lib/marketing/enrollment-calculator";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type ExpenseCategory = {
  id: string;
  label: string;
  cents: number;
};

export const STARTER_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: "rent", label: "Rent and facilities", cents: 0 },
  { id: "payroll", label: "Payroll and staff costs", cents: 0 },
  { id: "insurance", label: "Insurance", cents: 0 },
  { id: "materials", label: "Learning materials and supplies", cents: 0 },
  { id: "software", label: "Software and technology", cents: 0 },
  { id: "utilities", label: "Utilities", cents: 0 },
  { id: "food", label: "Food and other student-related costs", cents: 0 },
  { id: "marketing", label: "Marketing and administration", cents: 0 },
  { id: "other", label: "Other expenses", cents: 0 },
];

type ExpenseEstimatorProps = {
  theme: ParentThemeTokens;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "manual" | "estimated";
  onModeChange: (mode: "manual" | "estimated") => void;
  categories: ExpenseCategory[];
  onCategoriesChange: (categories: ExpenseCategory[]) => void;
};

export function expenseCategoryTotal(categories: ExpenseCategory[]): number {
  return categories.reduce((sum, category) => sum + category.cents, 0);
}

export default function ExpenseEstimator({
  theme,
  open,
  onOpenChange,
  mode,
  onModeChange,
  categories,
  onCategoriesChange,
}: ExpenseEstimatorProps) {
  return (
    <div className="print:hidden mt-2.5">
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className={`inline-flex items-center gap-1.5 text-[12px] font-bold ${calculatorFocusClass}`}
        style={{ color: theme.primary, fontFamily: theme.fontBody, borderRadius: theme.radiusButton }}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        {mode === "estimated" ? CALCULATOR_COPY.editEstimate : CALCULATOR_COPY.estimateAction}
      </button>
      {open ? (
        <EstimateDialog
          theme={theme}
          initialCategories={categories}
          showSingleAmount={mode === "estimated"}
          onClose={() => onOpenChange(false)}
          onApply={(next) => {
            onCategoriesChange(next);
            onModeChange("estimated");
            onOpenChange(false);
          }}
          onUseSingleAmount={() => {
            onModeChange("manual");
            onOpenChange(false);
          }}
        />
      ) : null}
    </div>
  );
}

function EstimateDialog({
  theme,
  initialCategories,
  showSingleAmount,
  onClose,
  onApply,
  onUseSingleAmount,
}: {
  theme: ParentThemeTokens;
  initialCategories: ExpenseCategory[];
  showSingleAmount: boolean;
  onClose: () => void;
  onApply: (categories: ExpenseCategory[]) => void;
  onUseSingleAmount: () => void;
}) {
  const [draft, setDraft] = useState<ExpenseCategory[]>(() =>
    initialCategories.map((category) => ({ ...category })),
  );
  const totalCents = expenseCategoryTotal(draft);

  const updateCategory = (id: string, patch: Partial<ExpenseCategory>) => {
    setDraft((current) =>
      current.map((category) => (category.id === id ? { ...category, ...patch } : category)),
    );
  };

  const addCategory = () => {
    const id = `custom-${Date.now()}`;
    setDraft((current) => [...current, { id, label: "", cents: 0 }]);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(`expense-label-${id}`)?.focus();
      });
    });
  };

  return (
    <CalculatorDialog
      theme={theme}
      kicker={CALCULATOR_COPY.estimateKicker}
      title={CALCULATOR_COPY.estimateTitle}
      onClose={onClose}
      actions={
        <>
          {showSingleAmount ? (
            <ParentButton theme={theme} variant="outline" onClick={onUseSingleAmount}>
              {CALCULATOR_COPY.useSingleAmount}
            </ParentButton>
          ) : null}
          <ParentButton theme={theme} onClick={() => onApply(draft)}>
            <span className="inline-flex items-center gap-1.5">
              {CALCULATOR_COPY.useEstimate}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </ParentButton>
        </>
      }
    >
      <p
        className="text-[13px] leading-relaxed"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        {CALCULATOR_COPY.estimateBody}
      </p>
      <ul className="mt-4 space-y-3">
        {draft.map((category) => (
          <li key={category.id} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 sm:flex-1">
              <label htmlFor={`expense-label-${category.id}`} className="sr-only">
                Expense name
              </label>
              <input
                id={`expense-label-${category.id}`}
                type="text"
                value={category.label}
                placeholder="Expense name"
                onChange={(event) => updateCategory(category.id, { label: event.target.value })}
                className={`h-11 w-full px-3 text-[14px] ${calculatorFocusClass}`}
                style={{
                  color: theme.ink,
                  fontFamily: theme.fontBody,
                  border: `1px solid ${theme.line}`,
                  borderRadius: theme.radiusButton,
                  backgroundColor: theme.white,
                }}
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1 sm:w-36 sm:flex-none">
                <CalculatorMoneyField
                  theme={theme}
                  id={`expense-amount-${category.id}`}
                  label={
                    category.label.trim()
                      ? `Monthly amount for ${category.label}`
                      : "Monthly amount"
                  }
                  hideLabel
                  valueCents={category.cents}
                  onChangeCents={(cents) => updateCategory(category.id, { cents })}
                />
              </div>
              <button
                type="button"
                onClick={() => setDraft((current) => current.filter((item) => item.id !== category.id))}
                className={`inline-flex h-12 w-12 shrink-0 items-center justify-center ${calculatorFocusClass}`}
                style={{
                  color: theme.muted,
                  borderRadius: theme.radiusButton,
                  backgroundColor: theme.white,
                  border: `1px solid ${theme.line}`,
                }}
                aria-label={category.label.trim() ? `Remove ${category.label}` : "Remove expense"}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {draft.length === 0 ? (
        <p className="mt-3 text-[13px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          No expenses in the list yet.
        </p>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        <ParentButton theme={theme} variant="outline" onClick={addCategory}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add an expense
          </span>
        </ParentButton>
      </div>
      <div
        className="mt-5 flex items-center justify-between gap-3 border-t pt-4"
        style={{ borderColor: theme.line }}
      >
        <span className="text-[14px] font-bold" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
          {CALCULATOR_COPY.estimateTotal}
        </span>
        <strong
          className="text-[1.6rem] font-semibold tabular-nums"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          {formatCalculatorMoney(totalCents)}
        </strong>
      </div>
    </CalculatorDialog>
  );
}
