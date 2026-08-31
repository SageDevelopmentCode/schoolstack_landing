"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartPulse, Loader2, Trash2, X } from "lucide-react";
import {
  healthFormSidebarTitle,
  ParentHealthFormFields,
  useParentHealthForm,
  type HealthFormValues,
} from "@/components/school-parent/health/ParentHealthFormPanel";
import type { HealthItemType } from "@/components/school-parent/health/parent-health-types";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentHealthFormSidebarProps = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  open: boolean;
  mode: "create" | "edit";
  itemType: HealthItemType;
  initialValues?: HealthFormValues | null;
  readOnly?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (type: HealthItemType, values: HealthFormValues) => void;
  onDelete?: () => void;
};

export default function ParentHealthFormSidebar({
  theme,
  adminCompat,
  open,
  mode,
  itemType,
  initialValues,
  readOnly = false,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: ParentHealthFormSidebarProps) {
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

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, saving]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="parent-health-form-sidebar"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={handleClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-health-form-sidebar-title"
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
                  <HeartPulse className="h-4 w-4" style={{ color: theme.primary }} aria-hidden />
                </div>
                <h2
                  id="parent-health-form-sidebar-title"
                  className="text-sm font-semibold"
                  style={{ color: theme.ink }}
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                aria-label="Close"
                className="border-0 bg-transparent p-0 disabled:opacity-50"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ParentHealthFormFields
                theme={theme}
                adminCompat={adminCompat}
                mode={mode}
                readOnly={readOnly}
                form={form}
              />
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
                    onClick={handleSubmit}
                    disabled={readOnly || saving || !canSave}
                    data-testid="parent-health-form-save"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" aria-hidden />
                        Saving…
                      </>
                    ) : (
                      "Save"
                    )}
                  </ParentButton>
                  <ParentButton
                    theme={theme}
                    variant="outline"
                    onClick={handleClose}
                    disabled={saving}
                  >
                    Cancel
                  </ParentButton>
                </div>

                {mode === "edit" && onDelete && !readOnly ? (
                  confirmDelete ? (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className="text-xs font-bold" style={{ color: theme.alert }}>
                        Delete this item?
                      </span>
                      <ParentButton
                        theme={theme}
                        variant="outline"
                        onClick={onDelete}
                        disabled={saving}
                        style={{ color: theme.alert, borderColor: theme.alert }}
                      >
                        Confirm delete
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
                      Delete
                    </button>
                  )
                ) : null}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
