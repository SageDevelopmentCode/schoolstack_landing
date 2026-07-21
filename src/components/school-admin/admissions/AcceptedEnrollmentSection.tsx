"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MoreHorizontal } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import { getApplicationDecisionActions } from "@/lib/admissions/application-status-transitions";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

type AcceptedEnrollmentSectionProps = {
  C: AdminThemeTokens;
  applicationId: string;
  onStartEnrollment: () => void;
  onStatusChanged: (status: string) => void;
};

export default function AcceptedEnrollmentSection({
  C,
  applicationId,
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
    () => getApplicationDecisionActions("accepted"),
    [],
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setPendingStatus(null);
    }
  }

  async function handleMarkEnrolled() {
    setMarkingEnrolled(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/mark-enrolled`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to mark application as enrolled.");
      }

      setConfirmMarkEnrolledOpen(false);
      onStatusChanged("enrolled");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark application as enrolled.",
      );
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
        description="Choose the enrollment agreement and send the checklist to the family."
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStartEnrollment}
            disabled={isDisabled}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md px-4 text-sm font-semibold transition-opacity disabled:opacity-60"
            style={getAdminButtonStyle(C, "primary")}
          >
            Start enrollment
          </button>

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

      <ConfirmDialog
        C={C}
        open={confirmMarkEnrolledOpen}
        title="Mark as enrolled?"
        description="This skips the enrollment checklist and marks the student as enrolled immediately. The family will be able to access the parent portal once their account is linked."
        confirmLabel="Mark as enrolled"
        loading={markingEnrolled}
        onConfirm={() => void handleMarkEnrolled()}
        onClose={() => {
          if (!markingEnrolled) {
            setConfirmMarkEnrolledOpen(false);
          }
        }}
      />
    </>
  );
}
