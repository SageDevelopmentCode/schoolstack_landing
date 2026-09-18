"use client";

import { useState } from "react";
import SchoolAdminDatePicker, {
  schoolAdminDateRangeBounds,
} from "@/components/school-admin/ui/SchoolAdminDatePicker";
import {
  FridayBranchFieldLabel,
  FridayBranchTextInput,
} from "@/components/school-admin/friday-branch/FridayBranchFormFields";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  FRIDAY_BRANCH_FIELD_INPUT_CLASS,
  fridayBranchFieldInputStyle,
} from "@/lib/school-admin/friday-branch/friday-branch-form-options";
import {
  formatBlockCompletionStatus,
  formatBlockStats,
  formatBlockTabDateRange,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";

type FridayBranchBlockContextProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  block: FridayBranchBlock;
  onChange: (block: FridayBranchBlock) => void;
};

const META_LABEL_CLASS =
  "text-[10px] font-extrabold uppercase tracking-[0.08em]";

export default function FridayBranchBlockContext({
  C,
  theme,
  block,
  onChange,
}: FridayBranchBlockContextProps) {
  const [showDates, setShowDates] = useState(false);
  const { minDate, maxDate } = schoolAdminDateRangeBounds();
  const dateRange = formatBlockTabDateRange(block.startDate, block.endDate);
  const scheduleStats = formatBlockStats(block);
  const completionStatus = formatBlockCompletionStatus(block);
  const fieldInputStyle = fridayBranchFieldInputStyle(theme, C);

  return (
    <div
      className="mt-4 rounded-xl border px-4 py-4"
      style={{ borderColor: "#E0E7E0", backgroundColor: "#fff", fontFamily: theme.fontBody }}
    >
      <div className="mb-4">
        <h2
          className="font-heading text-xl font-semibold"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          Block details
        </h2>
        <p className="mt-0.5 text-[11px]" style={{ color: "#7B898D" }}>
          Name this block and set its Friday date range.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <FridayBranchFieldLabel C={C}>Block name (optional)</FridayBranchFieldLabel>
          <FridayBranchTextInput
            theme={theme}
            C={C}
            value={block.label}
            onChange={(label) => onChange({ ...block, label })}
            placeholder="e.g. Block 3, Winter rhythm"
            ariaLabel="Block name"
          />
        </label>

        <label className="block">
          <FridayBranchFieldLabel C={C}>Description (optional)</FridayBranchFieldLabel>
          <textarea
            value={block.description ?? ""}
            onChange={(event) => onChange({ ...block, description: event.target.value })}
            rows={2}
            className={`${FRIDAY_BRANCH_FIELD_INPUT_CLASS} resize-none leading-relaxed`}
            style={fieldInputStyle}
            placeholder="Optional note about this block's Friday rhythm…"
            aria-label="Block description"
          />
        </label>
      </div>

      <div
        className="mt-4 grid gap-4 rounded-lg px-3 py-3 sm:grid-cols-3"
        style={{ backgroundColor: "#FBFCFB" }}
      >
        <div>
          <div className={META_LABEL_CLASS} style={{ color: theme.muted }}>
            Dates
          </div>
          <div className="mt-1 text-sm font-medium" style={{ color: theme.ink }}>
            {dateRange}
          </div>
        </div>
        <div>
          <div className={META_LABEL_CLASS} style={{ color: theme.muted }}>
            Schedule
          </div>
          <div className="mt-1 text-sm font-medium" style={{ color: theme.ink }}>
            {scheduleStats}
          </div>
        </div>
        <div>
          <div className={META_LABEL_CLASS} style={{ color: theme.muted }}>
            Status
          </div>
          <div className="mt-1 text-sm font-medium" style={{ color: theme.ink }}>
            {completionStatus}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowDates((current) => !current)}
        className="mt-3 border-0 bg-transparent p-0 text-xs font-semibold"
        style={{ color: theme.primary }}
      >
        {showDates ? "Hide dates" : "Edit dates"}
      </button>

      {showDates ? (
        <div className="mt-3 border-t pt-3" style={{ borderColor: "#EEF2EE" }}>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1">
              <span className={META_LABEL_CLASS} style={{ color: theme.muted }}>
                Starts
              </span>
              <SchoolAdminDatePicker
                id={`fb-context-${block.id}-start`}
                value={block.startDate}
                onChange={(iso) => onChange({ ...block, startDate: iso })}
                C={C}
                minDate={minDate}
                maxDate={block.endDate || maxDate}
              />
            </label>
            <span className="pb-2 text-xs" style={{ color: theme.muted }}>through</span>
            <label className="space-y-1">
              <span className={META_LABEL_CLASS} style={{ color: theme.muted }}>
                Ends
              </span>
              <SchoolAdminDatePicker
                id={`fb-context-${block.id}-end`}
                value={block.endDate}
                onChange={(iso) => onChange({ ...block, endDate: iso })}
                C={C}
                minDate={block.startDate || minDate}
                maxDate={maxDate}
              />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
