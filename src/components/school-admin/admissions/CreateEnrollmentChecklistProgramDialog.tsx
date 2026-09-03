"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { ProgramOption } from "@/lib/admissions/enrollment-checklist-templates";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";

type CreateEnrollmentChecklistProgramDialogProps = {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  open: boolean;
  programs: ProgramOption[];
  programsWithEnrollmentChecklist: Set<string>;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (programId: string) => void;
};

export default function CreateEnrollmentChecklistProgramDialog({
  C,
  theme,
  open,
  programs,
  programsWithEnrollmentChecklist,
  loading = false,
  onClose,
  onConfirm,
}: CreateEnrollmentChecklistProgramDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onClose]);

  const availablePrograms = programs.filter(
    (program) => !programsWithEnrollmentChecklist.has(program.id),
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={loading ? undefined : onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="w-full max-w-md rounded-2xl p-5 shadow-xl"
            style={{
              backgroundColor: theme?.paper ?? C.surface,
              border: `1px solid ${theme?.line ?? C.border}`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {theme ? (
              <AdminDisplayHeading theme={theme} as="h2" size="section" className="text-lg">
                Create enrollment checklist
              </AdminDisplayHeading>
            ) : (
              <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
                Create enrollment checklist
              </h2>
            )}
            <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              Choose which program this checklist is for. Each program can have one
              enrollment checklist. Programs without a checklist can still be marked enrolled
              directly after acceptance.
            </p>

            {programs.length === 0 ? (
              <p className="mt-4 text-sm" style={{ color: C.textTertiary }}>
                Create a program first, then return here to add an enrollment checklist.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {programs.map((program) => {
                  const hasChecklist = programsWithEnrollmentChecklist.has(program.id);
                  return (
                    <li key={program.id}>
                      <button
                        type="button"
                        disabled={hasChecklist || loading}
                        onClick={() => onConfirm(program.id)}
                        className="flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                          borderColor: theme?.line ?? C.border,
                          backgroundColor: theme?.paper ?? C.bg,
                          color: C.textPrimary,
                        }}
                      >
                        <span className="font-semibold">{program.name}</span>
                        {hasChecklist ? (
                          <span className="text-xs" style={{ color: C.textTertiary }}>
                            Already has a checklist
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-5 flex justify-end gap-2">
              {theme ? (
                <AdminButton
                  theme={theme}
                  variant="soft"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </AdminButton>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-lg px-3 py-2 text-sm font-medium"
                  style={{ color: C.textSecondary }}
                >
                  Cancel
                </button>
              )}
              {availablePrograms.length === 0 && programs.length > 0 ? (
                <span className="self-center text-xs" style={{ color: C.textTertiary }}>
                  All programs already have checklists
                </span>
              ) : null}
              {loading ? (
                <span className="inline-flex items-center gap-2 px-3 py-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: C.accent }} />
                  Creating…
                </span>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
