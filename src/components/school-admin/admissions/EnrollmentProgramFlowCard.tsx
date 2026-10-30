"use client";

import { ClipboardList, FileText } from "lucide-react";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import type {
  ApplicationFormStatus,
  ApplicationFormVersion,
} from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  FLOW_TYPE_LABELS,
  getStatusLabel,
  StatusIcon,
} from "./ApplicationFormListBadges";

export function enrollmentFlowStatusChipTone(
  status: ApplicationFormStatus,
): "success" | "warning" | "info" | "alert" {
  switch (status) {
    case "published":
      return "success";
    case "draft":
      return "warning";
    case "archived":
      return "alert";
    default:
      return "info";
  }
}

export type EnrollmentProgramFlowCardProps = {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  variant: "compact" | "featured";
  programName: string;
  programMeta?: string | null;
  applyForm?: ApplicationFormVersion;
  checklist?: EnrollmentChecklistTemplate;
  onSelectApply?: () => void;
  onSelectChecklist?: () => void;
  className?: string;
};

export default function EnrollmentProgramFlowCard({
  C,
  theme,
  variant,
  programName,
  programMeta,
  applyForm,
  checklist,
  onSelectApply,
  onSelectChecklist,
  className = "",
}: EnrollmentProgramFlowCardProps) {
  const story = Boolean(theme);
  const lineColor = theme?.line ?? C.border;
  const isFeatured = variant === "featured";

  function renderStepContent({
    stepLabel,
    title,
    status,
    emptyLabel,
    onClick,
  }: {
    stepLabel: string;
    title?: string | null;
    status?: ApplicationFormStatus | "none";
    emptyLabel?: string;
    onClick?: () => void;
  }) {
    const isInteractive = Boolean(onClick && (title || onClick));
    const canClick = Boolean(onClick);
    const inner = (
      <div
        className={`flex min-w-0 flex-1 flex-col gap-1 ${isFeatured ? "py-1.5" : "py-1"}`}
      >
        <p
          className={`font-semibold uppercase tracking-wide ${
            isFeatured ? "text-xs" : "text-[11px]"
          }`}
          style={{ color: C.textTertiary }}
        >
          {stepLabel}
        </p>
        {title ? (
          <p
            className={`font-medium leading-snug ${isFeatured ? "text-sm" : "text-xs"}`}
            style={{ color: C.textPrimary }}
          >
            {title}
          </p>
        ) : (
          <p
            className={`leading-snug ${isFeatured ? "text-sm" : "text-xs"}`}
            style={{ color: C.textTertiary }}
          >
            {emptyLabel ?? "None"}
          </p>
        )}
        {title && status && status !== "none" ? (
          story && theme ? (
            <AdminChip theme={theme} tone={enrollmentFlowStatusChipTone(status)}>
              {getStatusLabel(status)}
            </AdminChip>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-[11px]"
              style={{ color: C.textTertiary }}
            >
              <StatusIcon status={status} variant="plain" size="sm" />
              <span>{getStatusLabel(status)}</span>
            </span>
          )
        ) : null}
        {isFeatured && canClick && title ? (
          <span className="text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100" style={{ color: theme?.primary ?? C.accent }}>
            Edit →
          </span>
        ) : null}
      </div>
    );

    if (isInteractive || (canClick && !title)) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={`w-full rounded-lg px-1.5 text-left transition-colors hover:bg-black/[0.04] ${
            isFeatured ? "py-0.5" : ""
          }`}
        >
          {inner}
        </button>
      );
    }

    return <div className="px-1">{inner}</div>;
  }

  function renderIcon(kind: "apply" | "enrollment", hasItem: boolean) {
    const Icon = kind === "apply" ? FileText : ClipboardList;
    const size = isFeatured ? "h-9 w-9 rounded-xl" : "h-7 w-7 rounded-md";
    const iconSize = isFeatured ? "h-4 w-4" : "h-3.5 w-3.5";

    return (
      <div
        className={`flex shrink-0 items-center justify-center ${size}`}
        style={{
          backgroundColor: hasItem
            ? (theme?.primarySoft ?? C.accentLight)
            : (theme?.paper ?? C.bg),
          border: hasItem ? "none" : `1px dashed ${lineColor}`,
        }}
      >
        <Icon
          className={iconSize}
          style={{ color: hasItem ? (theme?.primary ?? C.accent) : C.textTertiary }}
        />
      </div>
    );
  }

  const shellClass = isFeatured
    ? `group rounded-2xl border p-4 transition-shadow hover:shadow-md ${className}`
    : `rounded-lg border px-2.5 py-2.5 ${className}`;

  const Wrapper = isFeatured ? "div" : "li";

  return (
    <Wrapper
      className={shellClass}
      style={{
        borderColor: lineColor,
        backgroundColor: theme?.paper ?? C.surface,
        boxShadow: isFeatured ? (theme?.shadowCard ?? undefined) : undefined,
      }}
    >
      <div className={isFeatured ? "mb-3" : "mb-1.5 px-1"}>
        <p
          className={`font-semibold ${isFeatured ? "font-heading text-base" : "text-sm"}`}
          style={{
            color: C.textPrimary,
            fontFamily: isFeatured ? theme?.fontDisplay : undefined,
          }}
        >
          {programName}
        </p>
        {programMeta ? (
          <p className="mt-0.5 text-xs" style={{ color: C.textSecondary }}>
            {programMeta}
          </p>
        ) : null}
      </div>
      <div className={`flex gap-2.5 ${isFeatured ? "gap-3" : ""}`}>
        <div className="flex flex-col items-center pt-1">
          {renderIcon("apply", Boolean(applyForm))}
          <div
            className={`my-1 w-px flex-1 ${isFeatured ? "min-h-[28px]" : "min-h-[20px]"}`}
            style={
              applyForm
                ? { backgroundColor: lineColor }
                : { borderLeft: `1px dashed ${lineColor}` }
            }
          />
          {renderIcon("enrollment", Boolean(checklist))}
        </div>
        <div className="min-w-0 flex-1">
          {renderStepContent({
            stepLabel: FLOW_TYPE_LABELS.apply,
            title: applyForm?.title,
            status: applyForm?.status ?? "none",
            emptyLabel: "No apply form yet",
            onClick: onSelectApply,
          })}
          {renderStepContent({
            stepLabel: "Enrollment",
            title: checklist?.name,
            status: checklist?.status ?? "none",
            emptyLabel: "None — mark enrolled directly",
            onClick: onSelectChecklist,
          })}
        </div>
      </div>
    </Wrapper>
  );
}
