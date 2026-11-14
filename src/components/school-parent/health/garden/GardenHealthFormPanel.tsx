"use client";

import { Loader2, Trash2 } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import { gBtnOutlineSm, gBtnPopSm, G_FOCUS } from "@/components/school-parent/garden/ui";
import {
  healthFormSidebarTitle,
  ParentHealthFormFields,
  useParentHealthForm,
  type HealthFormValues,
} from "@/components/school-parent/health/ParentHealthFormPanel";
import type { HealthItemType } from "@/components/school-parent/health/parent-health-types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const SAVE_HINT: Record<HealthItemType, string> = {
  allergy: "Add the allergen to save.",
  medication: "Add the medication name and time at school to save.",
  update: "Add a short title to save.",
};

/**
 * Parent health add/edit drawer (Garden). Same form hook and callbacks as the
 * staff modal (`ParentHealthFormSidebar variant="modal"`); delete asks first
 * in a Garden confirm dialog.
 */
export default function GardenHealthFormPanel({
  theme,
  adminCompat,
  open,
  mode,
  itemType,
  initialValues,
  readOnly = false,
  saving = false,
  studentFirstName,
  onClose,
  onSave,
  onDelete,
}: {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  open: boolean;
  mode: "create" | "edit";
  itemType: HealthItemType;
  initialValues?: HealthFormValues | null;
  readOnly?: boolean;
  saving?: boolean;
  studentFirstName: string;
  onClose: () => void;
  onSave: (type: HealthItemType, values: HealthFormValues) => void;
  onDelete?: () => void;
}) {
  const form = useParentHealthForm({
    mode,
    initialType: itemType,
    initialValues,
    readOnly,
    saving,
    onSave,
  });
  const { confirmDelete, setConfirmDelete, handleSubmit, canSave } = form;
  const title = healthFormSidebarTitle(mode, form.itemType);

  const handleClose = () => {
    if (saving) return;
    if (confirmDelete) {
      setConfirmDelete(false);
      return;
    }
    onClose();
  };

  return (
    <>
      <GSidePanel
        theme={theme}
        open={open}
        title={title}
        kicker={`${studentFirstName}'s health profile`}
        subtitle={
          mode === "create"
            ? "Teachers and the school office are notified when you share updates here."
            : "Changes are shared with teachers and the school office."
        }
        onClose={handleClose}
        testId="parent-health-form-sidebar"
        panelId="parent-health-form-panel"
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            {mode === "edit" && onDelete && !readOnly ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-extrabold text-[#b42318] hover:bg-[#b42318]/[0.08] disabled:opacity-50 ${G_FOCUS}`}
                data-testid="parent-health-form-delete"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </button>
            ) : (
              <span className="text-xs font-semibold text-[var(--sf-soft)]" aria-live="polite">
                {!readOnly && !canSave ? SAVE_HINT[form.itemType] : ""}
              </span>
            )}
            <div className="ml-auto flex flex-wrap gap-2">
              <button type="button" className={gBtnOutlineSm} onClick={handleClose} disabled={saving}>
                Cancel
              </button>
              <button
                type="button"
                className={gBtnPopSm}
                onClick={handleSubmit}
                disabled={readOnly || saving || !canSave}
                aria-busy={saving || undefined}
                data-testid="parent-health-form-save"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : mode === "edit" ? (
                  "Save changes"
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <ParentHealthFormFields
            theme={theme}
            adminCompat={adminCompat}
            mode={mode}
            readOnly={readOnly}
            form={form}
            appearance="garden"
          />
          <button type="submit" hidden tabIndex={-1} aria-hidden="true" />
        </form>
      </GSidePanel>

      <GConfirmDialog
        theme={theme}
        open={open && confirmDelete}
        title="Delete this item?"
        description={`It will be removed from ${studentFirstName}'s health profile.`}
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        destructive
        loading={saving}
        onConfirm={() => onDelete?.()}
        onClose={() => {
          if (!saving) setConfirmDelete(false);
        }}
        data-testid="parent-health-delete-confirm"
        confirmTestId="parent-health-form-confirm-delete"
      />
    </>
  );
}
