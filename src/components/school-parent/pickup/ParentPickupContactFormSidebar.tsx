"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Loader2, Trash2, X } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
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
  theme,
  htmlFor,
  children,
  required,
}: {
  theme: ParentThemeTokens;
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold" style={{ color: theme.ink }}>
      {children}
      {required ? <span style={{ color: theme.alert }}> *</span> : null}
    </label>
  );
}

function inputClassName(): string {
  return "w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2";
}

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
}: ParentPickupContactFormSidebarProps) {
  const [values, setValues] = useState<PickupContactFormValues>(initialValues);
  const [baselineValues, setBaselineValues] = useState<PickupContactFormValues>(initialValues);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const titleId = "parent-pickup-contact-sidebar-title";
  const discardTitleId = "parent-pickup-discard-dialog-title";
  const title = pickupFormTitle(mode);

  useEffect(() => {
    if (open) {
      const normalized = normalizePickupFormValues(initialValues);
      setValues(normalized);
      setBaselineValues(normalized);
      setConfirmDelete(false);
      setDiscardDialogOpen(false);
    }
  }, [open, initialValues]);

  const isDirty = useMemo(
    () => !readOnly && !arePickupFormValuesEqual(values, baselineValues),
    [baselineValues, readOnly, values],
  );

  const requestClose = useCallback(() => {
    if (saving) return;

    if (!isDirty) {
      onClose();
      return;
    }

    setDiscardDialogOpen(true);
  }, [isDirty, onClose, saving]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        if (discardDialogOpen) {
          setDiscardDialogOpen(false);
          return;
        }
        requestClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [discardDialogOpen, open, requestClose, saving]);

  const handleConfirmDiscard = () => {
    setDiscardDialogOpen(false);
    onClose();
  };

  const canSave =
    values.firstName.trim().length > 0 && values.lastName.trim().length > 0;

  const inputStyle: React.CSSProperties = {
    borderColor: theme.line,
    backgroundColor: theme.white,
    color: theme.ink,
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="parent-pickup-contact-sidebar"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={requestClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: theme.line }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: theme.primarySoft }}
                >
                  <Car className="h-4 w-4" style={{ color: theme.primary }} aria-hidden />
                </div>
                <h2 id={titleId} className="text-sm font-semibold" style={{ color: theme.ink }}>
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={requestClose}
                disabled={saving}
                aria-label="Close"
                className="border-0 bg-transparent p-0 disabled:opacity-50"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel theme={theme} htmlFor="pickup-first-name" required>
                      What is their first name?
                    </FieldLabel>
                    <input
                      id="pickup-first-name"
                      type="text"
                      value={values.firstName}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, firstName: event.target.value }))
                      }
                      className={inputClassName()}
                      style={inputStyle}
                      disabled={readOnly || saving}
                    />
                  </div>
                  <div>
                    <FieldLabel theme={theme} htmlFor="pickup-last-name" required>
                      What is their last name?
                    </FieldLabel>
                    <input
                      id="pickup-last-name"
                      type="text"
                      value={values.lastName}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, lastName: event.target.value }))
                      }
                      className={inputClassName()}
                      style={inputStyle}
                      disabled={readOnly || saving}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel theme={theme} htmlFor="pickup-relationship">
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
                    className={inputClassName()}
                    style={inputStyle}
                    disabled={readOnly || saving}
                  />
                </div>
                <div>
                  <FieldLabel theme={theme} htmlFor="pickup-phone">
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
                    className={inputClassName()}
                    style={inputStyle}
                    disabled={readOnly || saving}
                  />
                </div>
                <div>
                  <FieldLabel theme={theme} htmlFor="pickup-notes">
                    Any notes for school staff?
                  </FieldLabel>
                  <textarea
                    id="pickup-notes"
                    value={values.notes}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, notes: event.target.value }))
                    }
                    rows={3}
                    className={inputClassName()}
                    style={inputStyle}
                    disabled={readOnly || saving}
                  />
                </div>
              </div>
            </div>

            <div
              className="border-t px-5 py-4"
              style={{ borderColor: theme.line, backgroundColor: theme.paper }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <ParentButton
                    theme={theme}
                    variant="primary"
                    type="button"
                    disabled={readOnly || saving || !canSave}
                    onClick={() => onSave(values)}
                    data-testid="parent-pickup-contact-save"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" aria-hidden />
                        Saving…
                      </>
                    ) : (
                      "Save contact"
                    )}
                  </ParentButton>
                  <ParentButton
                    theme={theme}
                    variant="outline"
                    type="button"
                    onClick={requestClose}
                    disabled={saving}
                  >
                    Cancel
                  </ParentButton>
                </div>

                {mode === "edit" && onDelete && !readOnly ? (
                  confirmDelete ? (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className="text-xs font-bold" style={{ color: theme.alert }}>
                        Remove this contact?
                      </span>
                      <ParentButton
                        theme={theme}
                        variant="outline"
                        onClick={onDelete}
                        disabled={saving}
                        style={{ color: theme.alert, borderColor: theme.alert }}
                      >
                        Confirm remove
                      </ParentButton>
                      <ParentButton
                        theme={theme}
                        variant="soft"
                        onClick={() => setConfirmDelete(false)}
                        disabled={saving}
                      >
                        Keep
                      </ParentButton>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1 border-0 bg-transparent text-xs font-bold"
                      style={{ color: theme.alert }}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Remove
                    </button>
                  )
                ) : null}
              </div>
            </div>
          </motion.aside>

          <AnimatePresence>
            {discardDialogOpen ? (
              <motion.div
                className="fixed inset-0 z-[120] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                data-testid="parent-pickup-discard-dialog"
              >
                <button
                  type="button"
                  aria-label="Close discard dialog"
                  className="absolute inset-0 border-0"
                  style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                  onClick={() => setDiscardDialogOpen(false)}
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={discardTitleId}
                  className="relative w-full max-w-sm rounded-xl border p-5"
                  style={{
                    backgroundColor: theme.white,
                    borderColor: theme.line,
                    boxShadow: theme.shadowCard,
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <h3
                    id={discardTitleId}
                    className="text-sm font-semibold"
                    style={{ color: theme.ink }}
                  >
                    Unsaved changes
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.muted }}>
                    You have unsaved changes. If you close now, your changes will be lost.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <ParentButton
                      theme={theme}
                      variant="outline"
                      type="button"
                      onClick={() => setDiscardDialogOpen(false)}
                    >
                      Keep editing
                    </ParentButton>
                    <ParentButton
                      theme={theme}
                      variant="outline"
                      type="button"
                      onClick={handleConfirmDiscard}
                      style={{ color: theme.alert, borderColor: theme.alert }}
                    >
                      Discard changes
                    </ParentButton>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
