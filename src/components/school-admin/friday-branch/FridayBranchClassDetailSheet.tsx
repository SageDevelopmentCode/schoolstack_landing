"use client";

import { useEffect, useState } from "react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import { SkeletonBlock } from "@/components/school-admin/skeletons";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { reportClientOperationalError } from "@/lib/operational-errors-client";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type {
  FridayBranchClass,
  FridayBranchClassDetail,
  FridayBranchClassEnrollmentStatus,
} from "@/lib/school-admin/friday-branch/friday-branch-types";
import FridayBranchStatusTag from "./FridayBranchStatusTag";

type FridayBranchClassDetailSheetProps = {
  open: boolean;
  organizationId: string;
  classId: string | null;
  fallbackClass?: FridayBranchClass | null;
  fallbackSlotTime?: string;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  onClose: () => void;
  onEditClass: (classEntry: FridayBranchClass) => void;
};

const META_LABEL_CLASS =
  "text-[10px] font-extrabold uppercase tracking-[0.08em]";

function enrollmentStatusVariant(
  status: FridayBranchClassEnrollmentStatus,
): "green" | "amber" | "purple" {
  if (status === "waitlisted") return "amber";
  if (status === "withdrawn") return "purple";
  return "green";
}

function enrollmentStatusLabel(status: FridayBranchClassEnrollmentStatus): string {
  if (status === "waitlisted") return "Waitlisted";
  if (status === "withdrawn") return "Withdrawn";
  return "Confirmed";
}

function formatCapacityLabel(capacity: number | null | undefined, enrollmentCount: number): string {
  if (!capacity) return "Unlimited";
  return `${enrollmentCount} of ${capacity} spots`;
}

export default function FridayBranchClassDetailSheet({
  open,
  organizationId,
  classId,
  fallbackClass,
  fallbackSlotTime,
  theme,
  C,
  onClose,
  onEditClass,
}: FridayBranchClassDetailSheetProps) {
  const [detail, setDetail] = useState<FridayBranchClassDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !classId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const response = await fetch(
          `/api/school-admin/friday-branch/classes/${encodeURIComponent(classId)}?organizationId=${encodeURIComponent(organizationId)}`,
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Failed to load class detail.");
        }

        const payload = (await response.json()) as FridayBranchClassDetail;
        if (!cancelled) {
          setDetail(payload);
        }
      } catch (err) {
        if (!cancelled) {
          adminToast.error(formatActionError(err, "Failed to load class detail."));
          void reportClientOperationalError({
            organizationId,
            operation: "friday_branch.class.detail.load",
            error: formatActionError(err, "Failed to load class detail."),
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, classId, organizationId]);

  const classEntry = detail?.class ?? fallbackClass;
  const slotTime = detail?.slotTime ?? fallbackSlotTime ?? "";
  const title = classEntry?.name?.trim() || "Class details";
  const subtitle = slotTime ? `${slotTime} · ${detail?.blockLabel ?? "Friday Branch"}` : undefined;

  const handleEdit = () => {
    if (!classEntry) return;
    onEditClass(classEntry);
    onClose();
  };

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      C={C}
      widthClassName="w-[min(100%,32rem)]"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium"
            style={{ color: C.textSecondary }}
          >
            Close
          </button>
          <AdminButton
            theme={theme}
            variant="primary"
            type="button"
            onClick={handleEdit}
            disabled={!classEntry}
          >
            Edit class
          </AdminButton>
        </>
      }
    >
      <div className="space-y-6" style={{ fontFamily: theme.fontBody }}>
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading class detail">
            <SkeletonBlock C={C} className="h-4 w-32" />
            <SkeletonBlock C={C} className="h-4 w-full" />
            <SkeletonBlock C={C} className="h-4 w-3/4" />
            <SkeletonBlock C={C} className="mt-4 h-20 w-full rounded-sm" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 rounded-lg px-3 py-3 sm:grid-cols-2" style={{ backgroundColor: "#FBFCFB" }}>
              <div>
                <div className={META_LABEL_CLASS} style={{ color: theme.muted }}>Location</div>
                <div className="mt-1 text-sm font-medium" style={{ color: theme.ink }}>
                  {classEntry?.location?.trim() || "Not set"}
                </div>
              </div>
              <div>
                <div className={META_LABEL_CLASS} style={{ color: theme.muted }}>Age group</div>
                <div className="mt-1 text-sm font-medium" style={{ color: theme.ink }}>
                  {classEntry?.ageGroup?.trim() || "Not set"}
                </div>
              </div>
              <div>
                <div className={META_LABEL_CLASS} style={{ color: theme.muted }}>Class leader</div>
                <div className="mt-1 text-sm font-medium" style={{ color: theme.ink }}>
                  {classEntry?.teacher?.trim() || "Not assigned"}
                </div>
              </div>
              <div>
                <div className={META_LABEL_CLASS} style={{ color: theme.muted }}>Capacity</div>
                <div className="mt-1 text-sm font-medium" style={{ color: theme.ink }}>
                  {formatCapacityLabel(classEntry?.capacity, detail?.enrollmentCount ?? 0)}
                </div>
              </div>
              {detail ? (
                <div className="sm:col-span-2">
                  <div className={META_LABEL_CLASS} style={{ color: theme.muted }}>Block dates</div>
                  <div className="mt-1 text-sm font-medium" style={{ color: theme.ink }}>
                    {detail.blockDateRange}
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <h3
                className="font-heading text-lg font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                Roster
              </h3>
              <p className="mt-0.5 text-[11px]" style={{ color: "#7B898D" }}>
                Families will sign up from the parent portal.
              </p>

              {detail && detail.enrollments.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {detail.enrollments.map((enrollment) => (
                    <li
                      key={enrollment.id}
                      className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
                      style={{ borderColor: "#E0E7E0", backgroundColor: "#fff" }}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium" style={{ color: theme.ink }}>
                          {enrollment.studentName}
                        </div>
                        <div className="text-[11px]" style={{ color: theme.muted }}>
                          {enrollment.familyName}
                        </div>
                      </div>
                      <FridayBranchStatusTag
                        label={enrollmentStatusLabel(enrollment.status)}
                        variant={enrollmentStatusVariant(enrollment.status)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  className="mt-4 rounded-lg border px-3 py-6 text-center text-sm"
                  style={{ borderColor: "#E0E7E0", color: theme.muted, backgroundColor: "#FBFCFB" }}
                >
                  No families signed up yet.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </SchoolAdminSlideOverShell>
  );
}
