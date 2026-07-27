"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MoreHorizontal } from "lucide-react";
import MarkEnrolledDialog from "@/components/school-admin/admissions/MarkEnrolledDialog";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import { getApplicationDecisionActions } from "@/lib/admissions/application-status-transitions";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type AcceptedEnrollmentSectionProps = {
  C: AdminThemeTokens;
  applicationId: string;
  applicationStatus?: "accepted" | "enrolling";
  showStartEnrollment?: boolean;
  hasPublishedChecklist?: boolean;
  onStartEnrollment?: () => void;
  onStatusChanged: (status: string) => void;
};

export default function AcceptedEnrollmentSection({
  C,
  applicationId,
  applicationStatus = "accepted",
  showStartEnrollment = true,
  hasPublishedChecklist = false,
  onStartEnrollment,
  onStatusChanged,
}: AcceptedEnrollmentSectionProps) {
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [markingEnrolled, setMarkingEnrolled] = useState(false);
  const [confirmMarkEnrolledOpen, setConfirmMarkEnrolledOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const secondaryActions = useMemo(
    () => getApplicationDecisionActions(applicationStatus),
    [applicationStatus],
  );

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleAction(nextStatus: string) {
    setMenuOpen(false);
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

      onStatusChanged(String(body.status));
      adminToast.success("Application status updated");
    } catch (err) {
      const message = formatActionError(err, "Failed to update status.");
      setError(message);
      adminToast.error(message);
    } finally {
      setPendingStatus(null);
    }
  }

  async function handleMarkEnrolled(completeChecklist: boolean) {
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
        throw new Error(body.error ?? "Failed to mark application as enrolled.");
      }

      setConfirmMarkEnrolledOpen(false);
      onStatusChanged("enrolled");
      adminToast.success(
        completeChecklist
          ? "Application marked as enrolled with checklist completed"
          : "Application marked as enrolled",
      );
    } catch (err) {
      const message = formatActionError(err, "Failed to mark application as enrolled.");
      setError(message);
      adminToast.error(message);
    } finally {
      setMarkingEnrolled(false);
    }
  }

  const isDisabled = pendingStatus !== null || markingEnrolled;

  return (
    <>
      <DetailPanelSection
        C={C}
        title="Enrollment"
        description={
          showStartEnrollment
            ? "Choose the enrollment agreement and send the checklist to the family."
            : "Complete enrollment on the family's behalf when paperwork and fees were handled offline."
        }
      >
        <div className="flex items-center gap-2">
          {showStartEnrollment && onStartEnrollment ? (
            <button
              type="button"
              onClick={onStartEnrollment}
              disabled={isDisabled}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-md px-4 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={getAdminButtonStyle(C, "primary")}
            >
              Start enrollment
            </button>
          ) : (
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => setConfirmMarkEnrolledOpen(true)}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-md px-4 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={getAdminButtonStyle(C, "primary")}
            >
              Mark as enrolled
            </button>
          )}

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              disabled={isDisabled}
              aria-label="More enrollment actions"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md transition-opacity disabled:opacity-60"
              style={getAdminButtonStyle(C, "neutral")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-md border py-1 shadow-lg"
                style={{ borderColor: C.border, backgroundColor: C.surface }}
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
                        color: action.variant === "danger" ? C.error : C.textPrimary,
                      }}
                    >
                      {isPending ? (
                        <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                      ) : null}
                      {action.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="mt-2 text-xs" style={{ color: C.error }}>
            {error}
          </p>
        ) : null}
      </DetailPanelSection>

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
