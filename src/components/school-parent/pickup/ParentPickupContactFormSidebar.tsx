"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import { G_FOCUS, G_INPUT, G_LABEL, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatPhoneNumberInput, stripPhoneDigits } from "@/lib/phone-format";

export type PickupContactFormValues = {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  notes: string;
};

type ParentPickupContactFormSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  mode: "create" | "edit";
  initialValues: PickupContactFormValues;
  readOnly?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (values: PickupContactFormValues) => void;
  onDelete?: () => void;
  /** Child's first name for helper copy. */
  studentFirstName?: string;
};

function pickupFormTitle(mode: "create" | "edit"): string {
  return mode === "edit" ? "Edit pickup contact" : "Add pickup contact";
}

function normalizePickupFormValues(values: PickupContactFormValues): PickupContactFormValues {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    relationship: values.relationship.trim(),
    phone: values.phone ? formatPhoneNumberInput(values.phone) : "",
    notes: values.notes.trim(),
  };
}

function arePickupFormValuesEqual(
  a: PickupContactFormValues,
  b: PickupContactFormValues,
): boolean {
  const left = normalizePickupFormValues(a);
  const right = normalizePickupFormValues(b);

  return (
    left.firstName === right.firstName &&
    left.lastName === right.lastName &&
    left.relationship === right.relationship &&
    left.notes === right.notes &&
    stripPhoneDigits(left.phone) === stripPhoneDigits(right.phone)
  );
}

function FieldLabel({
  htmlFor,
  children,
  required,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={G_LABEL}>
      {children}
      {required ? (
        <span className="text-[var(--sf-clay-deep)]" aria-hidden="true">
          {" "}*
        </span>
      ) : null}
      {required ? <span className="sr-only"> (required)</span> : null}
      {hint ? <span className="mt-0.5 block text-xs font-semibold text-[var(--sf-soft)]">{hint}</span> : null}
    </label>
  );
}

/**
 * Add / edit an authorized pickup contact (Garden drawer). Same values,
 * dirty check, save and delete callbacks as before; delete and discard ask
 * first in Garden confirm dialogs.
 */
export default function ParentPickupContactFormSidebar({
  theme,
  open,
  mode,
  initialValues,
  readOnly = false,
  saving = false,
  onClose,
  onSave,
  onDelete,
  studentFirstName,
}: ParentPickupContactFormSidebarProps) {
  const [values, setValues] = useState<PickupContactFormValues>(initialValues);
  const [baselineValues, setBaselineValues] = useState<PickupContactFormValues>(initialValues);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const title = pickupFormTitle(mode);

  useEffect(() => {
    if (open) {
      const normalized = normalizePickupFormValues(initialValues);
      queueMicrotask(() => {
        setValues(normalized);
        setBaselineValues(normalized);
        setConfirmDelete(false);
        setDiscardDialogOpen(false);
      });
    }
  }, [open, initialValues]);

  const isDirty = useMemo(
    () => !readOnly && !arePickupFormValuesEqual(values, baselineValues),
    [baselineValues, readOnly, values],
  );

  const requestClose = useCallback(() => {
    if (saving) return;
    // Escape while a confirm dialog is up closes just that dialog (as before).
    if (discardDialogOpen) {
      setDiscardDialogOpen(false);
      return;
    }
    if (confirmDelete) {
      setConfirmDelete(false);
      return;
    }

    if (!isDirty) {
      onClose();
      return;
    }

    setDiscardDialogOpen(true);
  }, [confirmDelete, discardDialogOpen, isDirty, onClose, saving]);

  const handleConfirmDiscard = () => {
    setDiscardDialogOpen(false);
    onClose();
  };

  const canSave =
    values.firstName.trim().length > 0 && values.lastName.trim().length > 0;
  const childLabel = studentFirstName ? `${studentFirstName}` : "your child";

  const submit = () => {
    if (readOnly || saving || !canSave) return;
    onSave(values);
  };

  return (
    <>
      <GSidePanel
        theme={theme}
        open={open}
        title={title}
        kicker="Authorized pickup"
        subtitle={`People allowed to pick up ${childLabel}. They do not need a MudKitchen account.`}
        onClose={requestClose}
        testId="parent-pickup-contact-sidebar"
        panelId="parent-pickup-contact-panel"
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            {mode === "edit" && onDelete && !readOnly ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-extrabold text-[#b42318] hover:bg-[#b42318]/[0.08] disabled:opacity-50 ${G_FOCUS}`}
                data-testid="parent-pickup-contact-remove"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Remove
              </button>
            ) : (
              <span className="text-xs font-semibold text-[var(--sf-soft)]" aria-live="polite">
                {!readOnly && !canSave ? "Add a first and last name to save." : ""}
              </span>
            )}
            <div className="ml-auto flex flex-wrap gap-2">
              <button type="button" className={gBtnOutlineSm} onClick={requestClose} disabled={saving}>
                Cancel
              </button>
              <button
                type="button"
                className={gBtnPopSm}
                disabled={readOnly || saving || !canSave}
                aria-busy={saving || undefined}
                onClick={submit}
                data-testid="parent-pickup-contact-save"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  "Save contact"
                )}
              </button>
            </div>
          </div>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="pickup-first-name" required>
                What is their first name?
              </FieldLabel>
              <input
                id="pickup-first-name"
                type="text"
                autoComplete="given-name"
                value={values.firstName}
                onChange={(event) =>
                  setValues((current) => ({ ...current, firstName: event.target.value }))
                }
                className={G_INPUT}
                disabled={readOnly || saving}
              />
            </div>
            <div>
              <FieldLabel htmlFor="pickup-last-name" required>
                What is their last name?
              </FieldLabel>
              <input
                id="pickup-last-name"
                type="text"
                autoComplete="family-name"
                value={values.lastName}
                onChange={(event) =>
                  setValues((current) => ({ ...current, lastName: event.target.value }))
                }
                className={G_INPUT}
                disabled={readOnly || saving}
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="pickup-relationship">
              How are they related to your child?
            </FieldLabel>
            <input
              id="pickup-relationship"
              type="text"
              value={values.relationship}
              onChange={(event) =>
                setValues((current) => ({ ...current, relationship: event.target.value }))
              }
              placeholder="e.g. Grandparent, Nanny"
              className={G_INPUT}
              disabled={readOnly || saving}
            />
          </div>
          <div>
            <FieldLabel htmlFor="pickup-phone">
              What is their phone number?
            </FieldLabel>
            <input
              id="pickup-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  phone: formatPhoneNumberInput(event.target.value),
                }))
              }
              className={G_INPUT}
              disabled={readOnly || saving}
            />
          </div>
          <div>
            <FieldLabel htmlFor="pickup-notes">
              Any notes for school staff?
            </FieldLabel>
            <textarea
              id="pickup-notes"
              value={values.notes}
              onChange={(event) =>
                setValues((current) => ({ ...current, notes: event.target.value }))
              }
              rows={3}
              className={`${G_INPUT} resize-y`}
              disabled={readOnly || saving}
            />
          </div>
          <button type="submit" hidden tabIndex={-1} aria-hidden="true" />
        </form>
      </GSidePanel>

      <GConfirmDialog
        theme={theme}
        open={open && confirmDelete}
        title="Remove this contact?"
        description={`${[values.firstName, values.lastName].filter(Boolean).join(" ") || "This person"} will no longer be on ${childLabel}'s authorized pickup list.`}
        confirmLabel="Remove"
        loadingLabel="Removing…"
        destructive
        loading={saving}
        onConfirm={() => onDelete?.()}
        onClose={() => {
          if (!saving) setConfirmDelete(false);
        }}
        data-testid="parent-pickup-remove-confirm"
      />

      <GConfirmDialog
        theme={theme}
        open={open && discardDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you close now, your changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        destructive
        onConfirm={handleConfirmDiscard}
        onClose={() => setDiscardDialogOpen(false)}
        data-testid="parent-pickup-discard-dialog"
      />
    </>
  );
}
