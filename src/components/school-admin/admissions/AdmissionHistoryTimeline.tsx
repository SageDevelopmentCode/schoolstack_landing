"use client";

import type { CSSProperties } from "react";
import {
  ClipboardList,
  CreditCard,
  FilePlus,
  PenLine,
  Send,
  type LucideIcon,
} from "lucide-react";
import DetailPanelProgressBar from "@/components/school-admin/admissions/DetailPanelProgressBar";
import { enrollmentProgressBadgeStyle } from "@/lib/admissions/admin-enrollment-progress";
import { applicationStatusBadgeStyle } from "@/lib/admissions/application-status-ui";
import {
  formatShortDate,
  type FamilyAdmissionTimelineEvent,
} from "@/lib/admissions/application-submissions";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AdmissionHistoryTimelineProps = {
  C: AdminThemeTokens;
  events: FamilyAdmissionTimelineEvent[];
  currentApplicationId: string;
  currentApplicationStatus: string;
  onSelect: (applicationId: string) => void;
};

const TIMELINE_ICONS: Record<FamilyAdmissionTimelineEvent["kind"], LucideIcon> = {
  created: FilePlus,
  draft: PenLine,
  submitted: Send,
  fee_paid: CreditCard,
  enrollment: ClipboardList,
};

function isViewingEvent(
  event: FamilyAdmissionTimelineEvent,
  events: FamilyAdmissionTimelineEvent[],
  currentApplicationId: string,
  currentApplicationStatus: string,
): boolean {
  if (event.applicationId !== currentApplicationId) {
    return false;
  }

  if (currentApplicationStatus === "enrolling") {
    return event.kind === "enrollment";
  }

  if (currentApplicationStatus === "draft") {
    return event.kind === "draft";
  }

  const appEvents = events.filter(
    (entry) =>
      entry.applicationId === currentApplicationId && entry.kind !== "enrollment",
  );
  const hasSubmitted = appEvents.some((entry) => entry.kind === "submitted");
  const viewingKind = hasSubmitted ? "submitted" : "created";

  return event.kind === viewingKind;
}

function eventBadgeStyle(
  event: FamilyAdmissionTimelineEvent,
  C: AdminThemeTokens,
): CSSProperties | undefined {
  if (event.kind === "enrollment" && event.enrollmentTone) {
    return enrollmentProgressBadgeStyle(event.enrollmentTone, C);
  }

  if (event.applicationBadgeStatus) {
    return applicationStatusBadgeStyle(event.applicationBadgeStatus, C);
  }

  return undefined;
}

export default function AdmissionHistoryTimeline({
  C,
  events,
  currentApplicationId,
  currentApplicationStatus,
  onSelect,
}: AdmissionHistoryTimelineProps) {
  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const isViewing = isViewingEvent(
          event,
          events,
          currentApplicationId,
          currentApplicationStatus,
        );
        const Icon = TIMELINE_ICONS[event.kind];
        const badgeStyle = eventBadgeStyle(event, C);
        const showConnector = index < events.length - 1;

        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isViewing ? C.accentLight : C.surface,
                  border: isViewing ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                  color: isViewing ? C.accent : C.textTertiary,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              {showConnector ? (
                <div
                  className="my-1 w-px flex-1 min-h-[16px]"
                  style={{ backgroundColor: C.border }}
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1 pb-5">
              <button
                type="button"
                onClick={() => onSelect(event.applicationId)}
                className="w-full rounded-lg border px-3 py-2.5 text-left transition-colors"
                style={{
                  borderColor: isViewing ? C.accent : C.border,
                  backgroundColor: isViewing ? C.accentLight : C.surface,
                }}
              >
                <p className="text-xs" style={{ color: C.textTertiary }}>
                  {formatShortDate(event.occurredAt)}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                    {event.title}
                  </span>
                  {event.statusLabel && badgeStyle ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={badgeStyle}
                    >
                      {event.statusLabel}
                    </span>
                  ) : null}
                  {isViewing ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: C.surface, color: C.accent }}
                    >
                      Viewing
                    </span>
                  ) : null}
                </div>

                {event.subtitle ? (
                  <p className="mt-0.5 text-xs" style={{ color: C.textSecondary }}>
                    {event.subtitle}
                  </p>
                ) : null}

                {event.kind === "enrollment" && event.enrollmentProgress ? (
                  <div className="mt-2">
                    <DetailPanelProgressBar
                      C={C}
                      completed={event.enrollmentProgress.completed}
                      total={event.enrollmentProgress.total}
                      label="Required items"
                    />
                  </div>
                ) : event.progressLabel ? (
                  <p className="mt-1.5 text-xs" style={{ color: C.textTertiary }}>
                    {event.progressLabel}
                  </p>
                ) : null}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
