"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import {
  MAX_ADJUSTMENT_REASON_LENGTH,
  sanitizeAdjustmentReasonDraft,
} from "@/lib/tuition/adjustment-reasons";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionAdjustmentReasonsModalProps = {
  open: boolean;
  organizationId: string;
  reasons: string[];
  C: AdminThemeTokens;
  onClose: () => void;
  onSaved: (reasons: string[]) => void;
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
}

export default function TuitionAdjustmentReasonsModal({
  open,
  organizationId,
  reasons,
  C,
  onClose,
  onSaved,
}: TuitionAdjustmentReasonsModalProps) {
  const [draftReasons, setDraftReasons] = useState<string[]>(reasons);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraftReasons(reasons);
    setError(null);
  }, [open, reasons]);

  const canDelete = draftReasons.length > 1;

  const updateReason = (index: number, value: string) => {
    setDraftReasons((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
    setError(null);
  };

  const removeReason = (index: number) => {
    if (!canDelete) return;
    setDraftReasons((current) => current.filter((_, i) => i !== index));
    setError(null);
  };

  const addReason = () => {
    setDraftReasons((current) => [...current, ""]);
    setError(null);
  };

  const handleSave = async () => {
    const validation = sanitizeAdjustmentReasonDraft(draftReasons);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/tuition/org-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          settings: { adjustmentReasons: validation.reasons },
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        settings?: { adjustmentReasons?: string[] };
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save adjustment reasons.");
      }

      const savedReasons = payload.settings?.adjustmentReasons ?? validation.reasons;
      adminToast.success("Adjustment reasons saved");
      onSaved(savedReasons);
      onClose();
    } catch (err) {
      const message = formatActionError(err, "Failed to save adjustment reasons.");
      setError(message);
      adminToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const panelStyle = useMemo(
    () => ({ backgroundColor: C.surface, border: `1px solid ${C.border}` }),
    [C.border, C.surface],
  );

  return (
    <SchoolAdminModalShell
      open={open}
      onClose={onClose}
      maxWidth="md"
      ariaLabel="Manage adjustment reasons"
      panelStyle={panelStyle}
      zIndex={120}
    >
      <div className="flex max-h-[min(80vh,640px)] flex-col">
        <div className="border-b px-5 py-4" style={{ borderColor: C.border }}>
          <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
            Manage adjustment reasons
          </h2>
          <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
            These options appear when you apply tuition adjustments.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {draftReasons.map((reason, index) => (
            <div key={`reason-${index}`} className="flex items-center gap-2">
              <input
                type="text"
                value={reason}
                maxLength={MAX_ADJUSTMENT_REASON_LENGTH}
                onChange={(event) => updateReason(index, event.target.value)}
                placeholder="Reason label"
                style={inputStyle(C)}
                aria-label={`Adjustment reason ${index + 1}`}
              />
              <button
                type="button"
                aria-label={`Delete reason ${index + 1}`}
                disabled={!canDelete}
                onClick={() => removeReason(index)}
                className="shrink-0 rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ color: C.error, backgroundColor: C.errorBg }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addReason}
            className="flex w-fit items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: C.accentLight,
              color: C.accent,
              border: `1px solid ${C.secondaryBtnBorder}`,
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add reason
          </button>

          {error ? (
            <p className="text-sm" style={{ color: C.error }}>
              {error}
            </p>
          ) : null}
        </div>

        <div
          className="flex justify-end gap-2 border-t px-5 py-4"
          style={{ borderColor: C.border }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md"
            style={{ color: C.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            {saving ? "Saving…" : "Save reasons"}
          </button>
        </div>
      </div>
    </SchoolAdminModalShell>
  );
}
