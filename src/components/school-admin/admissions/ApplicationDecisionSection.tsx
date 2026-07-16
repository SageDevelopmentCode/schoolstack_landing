"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import {
  getApplicationDecisionActions,
  type ApplicationDecisionAction,
} from "@/lib/admissions/application-status-transitions";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

type ApplicationDecisionSectionProps = {
  C: AdminThemeTokens;
  applicationId: string;
  currentStatus: string;
  onStatusChanged: (status: string) => void;
};

function buttonStyle(
  variant: ApplicationDecisionAction["variant"],
  C: AdminThemeTokens,
): CSSProperties {
  switch (variant) {
    case "primary":
      return getAdminButtonStyle(C, "primary");
    case "danger":
      return getAdminButtonStyle(C, "danger");
    default:
      return getAdminButtonStyle(C, "secondary");
  }
}

export default function ApplicationDecisionSection({
  C,
  applicationId,
  currentStatus,
  onStatusChanged,
}: ApplicationDecisionSectionProps) {
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actions, setActions] = useState<ApplicationDecisionAction[]>(() =>
    getApplicationDecisionActions(currentStatus),
  );
  const [loadingActions, setLoadingActions] = useState(
    currentStatus === "withdrawn",
  );

  useEffect(() => {
    if (currentStatus !== "withdrawn") {
      setActions(getApplicationDecisionActions(currentStatus));
      setLoadingActions(false);
      return;
    }

    let cancelled = false;
    setLoadingActions(true);
    setError(null);

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
          setActions(body.decisionActions ?? []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load status actions.",
          );
          setActions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingActions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId, currentStatus]);

  if (!loadingActions && actions.length === 0) {
    return null;
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

      onStatusChanged(String(body.status));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <DetailPanelSection
      C={C}
      title="Decision"
      description="Move this application through your admissions workflow."
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

            return (
              <button
                key={action.status}
                type="button"
                disabled={isDisabled}
                onClick={() => void handleAction(action.status)}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-opacity disabled:opacity-60"
                style={buttonStyle(action.variant, C)}
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {error ? (
        <p className="mt-2 text-xs" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}
    </DetailPanelSection>
  );
}
