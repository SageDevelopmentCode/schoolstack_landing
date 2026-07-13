"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight, Circle, CircleDot, MinusCircle } from "lucide-react";
import { outlineItemCardStyle } from "@/components/school-admin/admissions/outline-item-styles";
import {
  checklistItemStatusIconColor,
  checklistItemStatusLabel,
} from "@/lib/admissions/enrollment-checklist-item-status-ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type DetailPanelStepTimelineStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "waived";

export type DetailPanelStepTimelineItem = {
  id: string;
  title: string;
  status: DetailPanelStepTimelineStatus;
  kindLabel?: string;
  meta?: string;
  optional?: boolean;
  onClick?: () => void;
};

type DetailPanelStepTimelineProps = {
  C: AdminThemeTokens;
  items: DetailPanelStepTimelineItem[];
  activeItemId?: string | null;
  showStatusText?: boolean;
};

function StepStatusCircle({
  status,
  C,
}: {
  status: DetailPanelStepTimelineStatus;
  C: AdminThemeTokens;
}) {
  if (status === "completed") {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: C.success, color: "#FFFFFF" }}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </div>
    );
  }

  if (status === "waived") {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: C.elevated,
          border: `1px solid ${C.border}`,
          color: checklistItemStatusIconColor(status, C),
        }}
      >
        <MinusCircle className="h-3.5 w-3.5" aria-hidden />
      </div>
    );
  }

  if (status === "in_progress") {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: C.accentLight,
          border: `2px solid ${C.accent}`,
          color: C.accent,
        }}
      >
        <CircleDot className="h-3.5 w-3.5" aria-hidden />
      </div>
    );
  }

  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
        color: C.textTertiary,
      }}
    >
      <Circle className="h-3 w-3" aria-hidden />
    </div>
  );
}

function connectorColor(
  status: DetailPanelStepTimelineStatus,
  C: AdminThemeTokens,
): string {
  if (status === "completed" || status === "waived") {
    return C.success;
  }
  if (status === "in_progress") {
    return C.accent;
  }
  return C.border;
}

function TimelineRowBody({
  item,
  index,
  isActive,
  isClickable,
  showStatusText,
  C,
}: {
  item: DetailPanelStepTimelineItem;
  index: number;
  isActive: boolean;
  isClickable: boolean;
  showStatusText: boolean;
  C: AdminThemeTokens;
}) {
  const statusColor = checklistItemStatusIconColor(item.status, C);
  const statusLabel = checklistItemStatusLabel(item.status);
  const rowStyle = isActive ? outlineItemCardStyle(C, true) : undefined;

  return (
    <div
      data-timeline-row
      className="rounded-md px-3 py-2.5 transition-colors duration-150"
      style={rowStyle}
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 shrink-0 text-[10px] font-semibold tabular-nums"
          style={{ color: C.textQuaternary }}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium leading-snug" style={{ color: C.textPrimary }}>
              {item.title}
            </p>
            {item.optional ? (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: C.elevated, color: C.textTertiary }}
              >
                Optional
              </span>
            ) : null}
            {isActive ? (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: C.surface, color: C.accent }}
              >
                Viewing
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {item.kindLabel ? (
              <span className="text-[11px]" style={{ color: C.textTertiary }}>
                {item.kindLabel}
              </span>
            ) : null}
            {showStatusText && item.status !== "completed" ? (
              <span className="text-[11px]" style={{ color: statusColor }}>
                {statusLabel}
              </span>
            ) : null}
            {item.meta ? (
              <span
                className="text-[11px]"
                style={{
                  color: item.status === "completed" ? C.success : C.textTertiary,
                }}
              >
                {item.meta}
              </span>
            ) : null}
          </div>
        </div>
        {isClickable ? (
          <ChevronRight
            className="mt-0.5 h-4 w-4 shrink-0 opacity-40"
            style={{ color: isActive ? C.accent : C.textQuaternary }}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}

export default function DetailPanelStepTimeline({
  C,
  items,
  activeItemId,
  showStatusText = true,
}: DetailPanelStepTimelineProps) {
  if (items.length === 0) return null;

  return (
    <div className="mt-4 space-y-0">
      {items.map((item, index) => {
        const isActive = activeItemId === item.id;
        const isClickable = Boolean(item.onClick);
        const showConnector = index < items.length - 1;

        const rail = (
          <div className="flex flex-col items-center">
            <StepStatusCircle status={item.status} C={C} />
            {showConnector ? (
              <div
                className="my-1 w-px flex-1 min-h-[12px]"
                style={{ backgroundColor: connectorColor(item.status, C) }}
              />
            ) : null}
          </div>
        );

        const body = (
          <div className="min-w-0 flex-1 pb-4">
            <TimelineRowBody
              item={item}
              index={index}
              isActive={isActive}
              isClickable={isClickable}
              showStatusText={showStatusText}
              C={C}
            />
          </div>
        );

        if (isClickable) {
          return (
            <motion.div
              key={item.id}
              layout
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <button
                type="button"
                onClick={item.onClick}
                aria-current={isActive ? "step" : undefined}
                className="flex w-full gap-3 text-left"
                onMouseEnter={(e) => {
                  if (!isActive) {
                    const inner = e.currentTarget.querySelector<HTMLElement>("[data-timeline-row]");
                    if (inner) inner.style.backgroundColor = C.elevated;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    const inner = e.currentTarget.querySelector<HTMLElement>("[data-timeline-row]");
                    if (inner) inner.style.backgroundColor = "transparent";
                  }
                }}
              >
                {rail}
                {body}
              </button>
            </motion.div>
          );
        }

        return (
          <div key={item.id} className="flex gap-3">
            {rail}
            {body}
          </div>
        );
      })}
    </div>
  );
}
