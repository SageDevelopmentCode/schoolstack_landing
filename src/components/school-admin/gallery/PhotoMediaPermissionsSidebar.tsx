"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip, { type AdminChipTone } from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import type { OrgPhotoMediaConsentRosterRow } from "@/lib/students/load-org-photo-media-consent-roster";

type PhotoMediaPermissionsSidebarProps = {
  organizationId: string;
  open: boolean;
  onClose: () => void;
};

function formatUpdatedAt(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function consentChipTone(
  consent: OrgPhotoMediaConsentRosterRow["consent"],
): AdminChipTone {
  if (consent === "full") return "success";
  if (consent === "limited") return "warning";
  if (consent === "none") return "alert";
  return "info";
}

export default function PhotoMediaPermissionsSidebar({
  organizationId,
  open,
  onClose,
}: PhotoMediaPermissionsSidebarProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [students, setStudents] = useState<OrgPhotoMediaConsentRosterRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ organizationId });
      const response = await fetch(`/api/school-admin/photo-media-consents?${params}`);
      const payload = (await response.json()) as {
        students?: OrgPhotoMediaConsentRosterRow[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load photo permissions.");
      }
      setStudents(payload.students ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load photo permissions.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      void load();
    });
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(41, 57, 67, 0.35)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden"
            style={{
              backgroundColor: theme.paper,
              borderLeft: `1px solid ${theme.line}`,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
            data-testid="admin-photo-media-permissions-sidebar"
            aria-label="Photo permissions"
          >
            <div
              className="flex h-16 flex-shrink-0 items-center justify-between gap-2 px-4"
              style={{ borderBottom: `1px solid ${theme.line}` }}
            >
              <AdminDisplayHeading theme={theme} as="h2" size="section" className="text-lg">
                Photo permissions
              </AdminDisplayHeading>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5"
                style={{ color: theme.muted }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <p className="mb-4 text-sm" style={{ color: theme.muted }}>
                Stored consent for enrolled students (from enrollment and parent updates).
              </p>

              {loading ? (
                <SchoolAdminTableSkeleton
                  C={C}
                  showFilters={false}
                  columns={4}
                  compact
                  rows={8}
                  label="Loading photo permissions"
                />
              ) : error ? (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-sm" style={{ color: theme.alert }}>{error}</p>
                  <AdminButton theme={theme} variant="outline" onClick={() => void load()}>
                    Try again
                  </AdminButton>
                </div>
              ) : students.length === 0 ? (
                <p className="text-sm" style={{ color: theme.muted }}>
                  No enrolled students yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px] border-collapse text-left text-sm">
                    <thead>
                      <tr style={{ color: theme.muted }}>
                        <th className="pb-2 pr-3 font-semibold">Student</th>
                        <th className="pb-2 pr-3 font-semibold">Program</th>
                        <th className="pb-2 pr-3 font-semibold">Permission</th>
                        <th className="pb-2 font-semibold">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((row) => (
                        <tr
                          key={row.studentId}
                          className="border-t"
                          style={{ borderColor: theme.line, color: theme.ink }}
                        >
                          <td className="py-2.5 pr-3 font-medium">
                            {row.firstName} {row.lastName}
                          </td>
                          <td className="py-2.5 pr-3" style={{ color: theme.muted }}>
                            {row.programLabel}
                          </td>
                          <td className="py-2.5 pr-3">
                            <AdminChip
                              theme={theme}
                              tone={consentChipTone(row.consent)}
                              className="normal-case font-semibold !text-[11px]"
                            >
                              {row.consentLabel}
                            </AdminChip>
                          </td>
                          <td className="py-2.5" style={{ color: theme.muted }}>
                            {formatUpdatedAt(row.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
