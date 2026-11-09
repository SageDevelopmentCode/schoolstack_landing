"use client";

import { useState } from "react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { patchAdminStaffHoursAdjustmentSettings } from "@/lib/school-admin/staff-hours/fetch-admin-staff-hours";
import {
  parseOperationalError,
  reportClientOperationalError,
  shouldReportPortalClientError,
} from "@/lib/operational-errors-client";
import { isBenignPortalErrorCode } from "@/lib/portal-operational-errors";
import {
  portalJsonApiErrorCode,
  portalJsonApiErrorStatus,
} from "@/lib/portal-json-api-error";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type StaffHoursSettingsPanelProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  adjustmentsRequireApproval: boolean;
  onChange: (requireApproval: boolean) => void;
};

export default function StaffHoursSettingsPanel({
  theme,
  organizationId,
  adjustmentsRequireApproval,
  onChange,
}: StaffHoursSettingsPanelProps) {
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    if (saving) return;
    const next = !adjustmentsRequireApproval;
    setSaving(true);
    onChange(next);
    try {
      await patchAdminStaffHoursAdjustmentSettings({
        organizationId,
        adjustmentsRequireApproval: next,
      });
      adminToast.success(
        next
          ? "Hour adjustments now wait for approval."
          : "Hour adjustments now save immediately.",
      );
    } catch (err) {
      onChange(!next);
      const message = formatActionError(err, "Failed to save staff hours settings.");
      adminToast.error(message);
      if (shouldReportPortalClientError(err, portalJsonApiErrorStatus(err))) {
        const parsed = parseOperationalError(err);
        const code = portalJsonApiErrorCode(err) ?? parsed.code;
        if (!isBenignPortalErrorCode(code)) {
          void reportClientOperationalError({
            organizationId,
            operation: "staff_hours.adjustment_settings",
            error: message,
            code,
          });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminCard theme={theme} className="p-5" data-testid="staff-hours-settings-panel">
      <button
        type="button"
        role="switch"
        aria-checked={adjustmentsRequireApproval}
        aria-label="Require approval for hour adjustments"
        disabled={saving}
        onClick={() => void toggle()}
        className="flex w-full min-h-[44px] items-center justify-between gap-4 text-left"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium" style={{ color: theme.ink }}>
            Require approval for hour adjustments
          </span>
          <span className="mt-1 block text-sm" style={{ color: theme.muted }}>
            When this is on, teacher changes stay pending until you approve them.
          </span>
        </span>
        <span
          aria-hidden="true"
          className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
          style={{
            backgroundColor: adjustmentsRequireApproval ? theme.primary : theme.line,
          }}
        >
          <span
            className="inline-block h-5 w-5 rounded-full bg-white transition-transform"
            style={{
              transform: adjustmentsRequireApproval
                ? "translateX(22px)"
                : "translateX(4px)",
            }}
          />
        </span>
      </button>
    </AdminCard>
  );
}
