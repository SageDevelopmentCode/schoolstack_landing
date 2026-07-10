"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  getApplicationDecisionActions,
  type ApplicationDecisionAction,
} from "@/lib/admissions/application-status-transitions";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

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
      return {
        backgroundColor: C.accent,
        color: "#FFFFFF",
        border: `1px solid ${C.accent}`,
      };
    case "danger":
      return {
        backgroundColor: C.surface,
        color: C.error,
        border: `1px solid ${C.error}`,
      };
    default:
      return {
        backgroundColor: C.surface,
        color: C.textPrimary,
        border: `1px solid ${C.border}`,
      };
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

  const actions = getApplicationDecisionActions(currentStatus);
  if (actions.length === 0) {
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
    <div
      className="mb-5 rounded-lg border px-4 py-4"
      style={{ borderColor: C.border, backgroundColor: C.elevated }}
    >
      <h4 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
        Decision
      </h4>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textTertiary }}>
        Move this application through your admissions workflow.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
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

      {error ? (
        <p className="mt-2 text-xs" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
