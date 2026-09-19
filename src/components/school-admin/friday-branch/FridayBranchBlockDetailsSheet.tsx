"use client";

import SchoolAdminDatePicker, {
  schoolAdminDateRangeBounds,
} from "@/components/school-admin/ui/SchoolAdminDatePicker";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
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

type FridayBranchBlockDetailsSheetProps = {
  open: boolean;
  onClose: () => void;
  block: FridayBranchBlock | null;
  onChange: (block: FridayBranchBlock) => void;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
};

const META_LABEL_CLASS =
  "text-[10px] font-extrabold uppercase tracking-[0.08em]";

export default function FridayBranchBlockDetailsSheet({
  open,
  onClose,
  block,
  onChange,
  theme,
  C,
}: FridayBranchBlockDetailsSheetProps) {
  if (!block) return null;

  const { minDate, maxDate } = schoolAdminDateRangeBounds();
  const dateRange = formatBlockTabDateRange(block.startDate, block.endDate);
  const scheduleStats = formatBlockStats(block);
  const completionStatus = formatBlockCompletionStatus(block);
  const fieldInputStyle = fridayBranchFieldInputStyle(theme, C);

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title="Block details"
      subtitle="Name this block and set its Friday date range."
      C={C}
      footer={
        <AdminButton theme={theme} variant="primary" type="button" onClick={onClose}>
          Done
        </AdminButton>
      }
    >
      <div className="space-y-5" style={{ fontFamily: theme.fontBody }}>
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
            rows={3}
            className={`${FRIDAY_BRANCH_FIELD_INPUT_CLASS} resize-none leading-relaxed`}
            style={fieldInputStyle}
            placeholder="Optional note about this block's Friday rhythm…"
            aria-label="Block description"
          />
        </label>

        <div>
          <FridayBranchFieldLabel C={C}>Friday date range</FridayBranchFieldLabel>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <label className="space-y-1">
              <span className={META_LABEL_CLASS} style={{ color: theme.muted }}>
                Starts
              </span>
              <SchoolAdminDatePicker
                id={`fb-sheet-${block.id}-start`}
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
                id={`fb-sheet-${block.id}-end`}
                value={block.endDate}
                onChange={(iso) => onChange({ ...block, endDate: iso })}
                C={C}
                minDate={block.startDate || minDate}
                maxDate={maxDate}
              />
            </label>
          </div>
        </div>

        <div
          className="grid gap-4 rounded-lg px-3 py-3 sm:grid-cols-3"
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
      </div>
    </SchoolAdminSlideOverShell>
  );
}
