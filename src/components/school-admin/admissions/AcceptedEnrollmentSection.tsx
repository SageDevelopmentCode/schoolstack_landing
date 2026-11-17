"use client";

import { SkinPortalScope } from "@/components/school-admin/garden/skin";
import { adminApplicationStatusLabel } from "@/lib/admissions/application-status-ui";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DetailButton } from "@/components/school-admin/admissions/detail-garden";
import { createPortal } from "react-dom";
import { Loader2, MoreHorizontal } from "lucide-react";
import MarkEnrolledDialog from "@/components/school-admin/admissions/MarkEnrolledDialog";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import { getApplicationDecisionActions } from "@/lib/admissions/application-status-transitions";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { useSubmissionDetailPreview } from "./SubmissionDetailPreviewContext";

type AcceptedEnrollmentSectionProps = {
  C: AdminThemeTokens;
  organizationId: string;
  applicationId: string;
  applicationStatus?: "accepted" | "enrolling";
  programName?: string | null;
  enrollmentChecklistName?: string | null;
  showStartEnrollment?: boolean;
  hasPublishedChecklist?: boolean;
  onStartEnrollment?: () => void;
  onStatusChanged: (status: string) => void;
};

type MenuPosition = {
  top: number;
  left: number;
};

const MENU_GAP = 4;

export default function AcceptedEnrollmentSection({
  C,
  organizationId,
  applicationId,
  applicationStatus = "accepted",
  programName,
  enrollmentChecklistName,
  showStartEnrollment = true,
  hasPublishedChecklist = false,
  onStartEnrollment,
  onStatusChanged,
}: AcceptedEnrollmentSectionProps) {
  const { previewMode } = useSubmissionDetailPreview();
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [markingEnrolled, setMarkingEnrolled] = useState(false);
  const [confirmMarkEnrolledOpen, setConfirmMarkEnrolledOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const secondaryActions = useMemo(
    () => getApplicationDecisionActions(applicationStatus),
    [applicationStatus],
  );

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + MENU_GAP,
      left: rect.right,
    });
  };

  useLayoutEffect(() => {
    if (!menuOpen) return;

    updateMenuPosition();

    let frameId = 0;
    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateMenuPosition();
      });
    };

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  async function handleAction(nextStatus: string) {
    setMenuOpen(false);
    // Preview: status changes are disabled.
    if (previewMode) return;
    setPendingStatus(nextStatus);
    setError(null);

    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to update application status.");
      }

      const next = String(body.status);
      onStatusChanged(next);
      adminToast.dismiss(`application-status-${applicationId}-error`);
      adminToast.success(
        next === "enrolled" && nextStatus === "accepted"
          ? "Accepted and enrolled"
          : "Application status updated",
        {
          id: `application-status-${applicationId}`,
          description: `This application is now “${adminApplicationStatusLabel(next)}”. The submissions list is updated.`,
        },
      );
    } catch (err) {
      void reportPortalOperationalError(
        "school_admin",
        {
          organizationId,
          operation: "admissions.submission.update_status",
          error: "",
        },
        err,
      );
      const message = formatActionError(err, "Failed to update status.");
      setError(message);
      adminToast.error("Couldn't update the application", {
        id: `application-status-${applicationId}-error`,
        description: `${message} The status hasn't changed.`,
        action: { label: "Retry", onClick: () => void handleAction(nextStatus) },
      });
    } finally {
      setPendingStatus(null);
    }
  }

  async function handleMarkEnrolled(completeChecklist: boolean) {
    if (previewMode) return;
    setMarkingEnrolled(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/mark-enrolled`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completeChecklist }),
        },
      );

      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          body.error ?? "Failed to mark application as enrolled.",
        );
      }

      setConfirmMarkEnrolledOpen(false);
      onStatusChanged("enrolled");
      adminToast.dismiss(`application-mark-enrolled-${applicationId}-error`);
      adminToast.success(
        completeChecklist
          ? "Application marked as enrolled with checklist completed"
          : "Application marked as enrolled",
        {
          id: `application-mark-enrolled-${applicationId}`,
          description: "The student now counts as enrolled across your admin.",
        },
      );
    } catch (err) {
      void reportPortalOperationalError(
        "school_admin",
        {
          organizationId,
          operation: "admissions.submission.mark_enrolled",
          error: "",
        },
        err,
      );
      const message = formatActionError(
        err,
        "Failed to mark application as enrolled.",
      );
      setError(message);
      adminToast.error("Couldn't mark as enrolled", {
        id: `application-mark-enrolled-${applicationId}-error`,
        description: `${message} The application hasn't changed.`,
        action: {
          label: "Retry",
          onClick: () => void handleMarkEnrolled(completeChecklist),
        },
      });
    } finally {
      setMarkingEnrolled(false);
    }
  }

  const isDisabled = pendingStatus !== null || markingEnrolled;

  const menu =
    menuOpen && menuPosition
      ? createPortal(
<SkinPortalScope>
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[200] min-w-[10rem] -translate-x-full rounded-md border py-1 shadow-lg"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              borderColor: C.border,
              backgroundColor: C.surface,
            }}
          >
            <button
              type="button"
              role="menuitem"
              disabled={isDisabled}
              onClick={() => {
                setMenuOpen(false);
                setConfirmMarkEnrolledOpen(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-opacity disabled:opacity-60"
              style={{ color: C.textPrimary }}
            >
              Mark as enrolled
            </button>

            {secondaryActions.map((action) => {
              const isPending = pendingStatus === action.status;

              return (
                <button
                  key={action.status}
                  type="button"
                  role="menuitem"
                  disabled={isDisabled}
                  onClick={() => void handleAction(action.status)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-opacity disabled:opacity-60"
                  style={{
                    color:
                      action.variant === "danger" ? C.error : C.textPrimary,
                  }}
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                  ) : null}
                  {action.label}
                </button>
              );
            })}
          </div></SkinPortalScope>,
          document.body,
        )
      : null;

  const enrollmentDescription = (() => {
    if (showStartEnrollment) {
      if (enrollmentChecklistName && programName) {
        return `Uses ${enrollmentChecklistName} for ${programName}. Choose the enrollment agreement and send the checklist to the family.`;
      }
      if (enrollmentChecklistName) {
        return `Uses ${enrollmentChecklistName}. Choose the enrollment agreement and send the checklist to the family.`;
      }
      return "Choose the enrollment agreement and send the checklist to the family.";
    }

    if (programName) {
      return `${programName} has no enrollment checklist — mark enrolled when paperwork and fees were handled offline.`;
    }

    return "Complete enrollment on the family's behalf when paperwork and fees were handled offline.";
  })();

  return (
    <>
      <DetailPanelSection
        C={C}
        title="Enrollment"
        description={enrollmentDescription}
      >
        <div className="flex items-center gap-2">
          {showStartEnrollment && onStartEnrollment ? (
            <DetailButton
              kind="primary"
              C={C}
              type="button"
              onClick={onStartEnrollment}
              disabled={isDisabled}
              storyClassName="inline-flex h-10 shrink-0 items-center justify-center rounded-md px-4 text-sm font-semibold transition-opacity disabled:opacity-60"
            >
              Start enrollment
            </DetailButton>
          ) : (
            <DetailButton
              kind="primary"
              C={C}
              type="button"
              disabled={isDisabled}
              onClick={() => setConfirmMarkEnrolledOpen(true)}
              storyClassName="inline-flex h-10 shrink-0 items-center justify-center rounded-md px-4 text-sm font-semibold transition-opacity disabled:opacity-60"
            >
              Mark as enrolled
            </DetailButton>
          )}

          <div className="shrink-0">
            <DetailButton
              kind="neutral"
              C={C}
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              disabled={isDisabled}
              aria-label="More enrollment actions"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              storyClassName="inline-flex h-10 w-10 items-center justify-center rounded-md transition-opacity disabled:opacity-60"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DetailButton>
          </div>
        </div>

        {error ? (
          <p className="mt-2 text-xs" style={{ color: C.error }}>
            {error}
          </p>
        ) : null}
      </DetailPanelSection>

      {menu}

      <MarkEnrolledDialog
        C={C}
        open={confirmMarkEnrolledOpen}
        loading={markingEnrolled}
        hasPublishedChecklist={hasPublishedChecklist}
        onCompleteChecklist={() => void handleMarkEnrolled(true)}
        onEnrollOnly={() => void handleMarkEnrolled(false)}
        onClose={() => {
          if (!markingEnrolled) {
            setConfirmMarkEnrolledOpen(false);
          }
        }}
      />
    </>
  );
}
