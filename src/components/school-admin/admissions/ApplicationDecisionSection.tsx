"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  postSubmitSummaryBadgeStyle,
  type IncompletePostSubmitNotice,
} from "@/lib/admissions/admin-post-submit-steps";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import {
  getApplicationDecisionActions,
  type ApplicationDecisionAction,
} from "@/lib/admissions/application-status-transitions";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminApplicationStatusLabel } from "@/lib/admissions/application-status-ui";
import { detailButtonProps, useIsGardenDetail, type DetailButtonKind } from "./detail-garden";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type ApplicationDecisionSectionProps = {
  C: AdminThemeTokens;
  organizationId: string;
  applicationId: string;
  currentStatus: string;
  onStatusChanged: (status: string) => void;
  onAccept?: () => void;
  postSubmitNotice?: IncompletePostSubmitNotice & { onClick: () => void };
};

function buttonKind(variant: ApplicationDecisionAction["variant"]): DetailButtonKind {
  return variant === "primary" ? "primary" : variant === "danger" ? "danger" : "secondary";
}

export default function ApplicationDecisionSection({
  C,
  organizationId,
  applicationId,
  currentStatus,
  onStatusChanged,
  onAccept,
  postSubmitNotice,
}: ApplicationDecisionSectionProps) {
  const garden = useIsGardenDetail();
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawnActions, setWithdrawnActions] = useState<
    ApplicationDecisionAction[]
  >([]);
  const [withdrawnLoading, setWithdrawnLoading] = useState(
    currentStatus === "withdrawn",
  );

  const staticActions = useMemo(
    () =>
      currentStatus !== "withdrawn"
        ? getApplicationDecisionActions(currentStatus)
        : null,
    [currentStatus],
  );

  const actions = staticActions ?? withdrawnActions;
  const loadingActions = currentStatus === "withdrawn" && withdrawnLoading;

  useEffect(() => {
    if (currentStatus !== "withdrawn") return;

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setWithdrawnLoading(true);
        setError(null);
      }
    });

    void fetch(`/api/admissions/applications/${applicationId}/status`)
      .then(async (response) => {
        const body = (await response.json()) as {
          decisionActions?: ApplicationDecisionAction[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(body.error ?? "Failed to load status actions.");
        }
        if (!cancelled) {
          setWithdrawnActions(body.decisionActions ?? []);
        }
      })
      .catch((err) => {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "admissions.submission.load_status_actions",
          error: "",
        }, err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load status actions.",
          );
          setWithdrawnActions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setWithdrawnLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId, currentStatus, organizationId]);

  if (!loadingActions && actions.length === 0) {
    return null;
  }

  function handleActionClick(action: ApplicationDecisionAction) {
    if (action.status === "accepted" && onAccept) {
      onAccept();
      return;
    }
    void handleAction(action.status);
  }

  async function handleAction(nextStatus: string) {
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
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.submission.update_status",
        error: "",
      }, err);
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

  const postSubmitNoticeBadge = postSubmitNotice
    ? (() => {
        const badgeStyle = postSubmitSummaryBadgeStyle(postSubmitNotice.tone, C);
        return (
          <button
            type="button"
            onClick={postSubmitNotice.onClick}
            className="inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold transition-opacity hover:opacity-90"
            style={badgeStyle}
            aria-label="Jump to post-application steps"
          >
            <span className="truncate">
              Post-application steps · {postSubmitNotice.label}
            </span>
            <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
          </button>
        );
      })()
    : undefined;

  return (
    <DetailPanelSection
      C={C}
      title="Decision"
      description="Move this application through your admissions workflow."
      badge={postSubmitNoticeBadge}
    >
      {loadingActions ? (
        <div className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading actions…
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const isPending = pendingStatus === action.status;
            const isDisabled = pendingStatus !== null;
            const buttonProps = detailButtonProps(garden, buttonKind(action.variant), C);

            return (
              <button
                key={action.status}
                type="button"
                disabled={isDisabled}
                onClick={() => handleActionClick(action)}
                aria-busy={isPending || undefined}
                className={buttonProps.className}
                style={buttonProps.style}
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
                {isPending && garden ? "Saving…" : action.label}
              </button>
            );
          })}
        </div>
      )}

      {error ? (
        <p
          role="alert"
          className={garden ? "m-0 mt-2.5 text-[12.5px] font-bold text-[#9a3422]" : "mt-2 text-xs"}
          style={garden ? undefined : { color: C.error }}
        >
          {error}
        </p>
      ) : null}
    </DetailPanelSection>
  );
}
