"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip, { type ParentChipTone } from "@/components/school-parent/ui/ParentChip";
import { formatFormDueDate } from "@/lib/school-teacher/forms-documents/utils";
import type { ParentFormListItem } from "@/lib/school-parent/forms-documents/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentFormListCardProps = {
  item: ParentFormListItem;
  theme: ParentThemeTokens;
  onOpen?: () => void;
  href?: string;
  variant?: "default" | "compact";
  testId?: string;
};

function getStatusPresentation(item: ParentFormListItem): {
  statusVariant: ParentChipTone;
  statusLabel: string;
} {
  const statusVariant: ParentChipTone =
    item.listStatus === "signed"
      ? "success"
      : item.response.status === "overdue"
        ? "alert"
        : "warning";
  const statusLabel =
    item.listStatus === "signed"
      ? "Signed"
      : item.response.status === "overdue"
        ? "Overdue"
        : "Needs action";

  return { statusVariant, statusLabel };
}

export default function ParentFormListCard({
  item,
  theme,
  onOpen,
  href,
  variant = "default",
  testId,
}: ParentFormListCardProps) {
  const { statusVariant, statusLabel } = getStatusPresentation(item);
  const isCompact = variant === "compact";
  const iconSize = isCompact ? "h-9 w-9" : "h-10 w-10";
  const iconGlyphSize = isCompact ? "h-4 w-4" : "h-5 w-5";
  const cardClassName = isCompact
    ? "!p-3 transition-shadow hover:shadow-md"
    : "transition-shadow hover:shadow-md";

  const content = (
    <ParentCard theme={theme} className={cardClassName}>
      <div className="flex items-start gap-3">
        <div
          className={`flex ${iconSize} shrink-0 items-center justify-center rounded-xl`}
          style={{ backgroundColor: "#E2E8F0", color: "#475569" }}
        >
          <FileText className={iconGlyphSize} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="text-sm font-semibold"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {item.form.title}
            </h3>
            <ParentChip theme={theme} tone={statusVariant}>
              {statusLabel}
            </ParentChip>
            {item.form.formCategory === "tuition" ? (
              <ParentChip theme={theme} tone="info">
                Tuition
              </ParentChip>
            ) : null}
          </div>
          {item.response.studentNames.length > 0 ? (
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>
              {item.response.studentNames.join(", ")}
            </p>
          ) : null}
          {item.listStatus === "signed" && item.response.signedAt ? (
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>
              Signed on{" "}
              {new Date(item.response.signedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          ) : item.form.dueDate ? (
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>
              Due {formatFormDueDate(item.form.dueDate)}
            </p>
          ) : null}
        </div>
      </div>
    </ParentCard>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block w-full cursor-pointer text-left no-underline"
        data-testid={testId ?? `parent-form-card-${item.form.id}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full cursor-pointer text-left"
      data-testid={testId ?? `parent-form-card-${item.form.id}`}
    >
      {content}
    </button>
  );
}

export function parentFormListItemFromSnapshotItem(
  item: {
    formId: string;
    formTitle: string;
    studentNames: string[];
    listStatus: "needs_action" | "signed";
    responseStatus: "pending" | "overdue" | "signed";
    dueDate: string | null;
    signedAt: string | null;
  },
): ParentFormListItem {
  return {
    form: {
      id: item.formId,
      title: item.formTitle,
      description: "",
      formType: "upload",
      formCategory: "general",
      status: "active",
      audienceType: "classrooms",
      classroomIds: [],
      classroomNames: [],
      familyIds: [],
      familyNames: [],
      dueDate: item.dueDate,
      requireSignature: true,
      totalFamilies: 0,
      signedFamilies: 0,
      createdAt: "",
      updatedAt: "",
    },
    response: {
      id: item.formId,
      formId: item.formId,
      status: item.responseStatus,
      signedAt: item.signedAt,
      studentNames: item.studentNames,
      responses: {},
    },
    listStatus: item.listStatus,
  };
}
