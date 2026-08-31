"use client";

import { Pencil } from "lucide-react";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import type {
  HealthAllergyItem,
  HealthMedicationItem,
  HealthUpdateItem,
} from "@/components/school-parent/health/parent-health-types";
import {
  formatHealthDate,
  formatMedicationSchedule,
  medicationStatusLabel,
  medicationStatusTone,
  severityChipTone,
  SEVERITY_LABELS,
  type HealthItemAddedBy,
} from "@/components/school-parent/health/parent-health-types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentHealthItemCardProps = {
  theme: ParentThemeTokens;
  item: HealthAllergyItem | HealthMedicationItem | HealthUpdateItem;
  readOnly?: boolean;
  onEdit?: () => void;
};

const ADDED_BY_LABELS: Record<HealthItemAddedBy, string> = {
  parent: "Parent",
  school: "School",
};

function addedByChipTone(addedBy: HealthItemAddedBy): "info" | "success" {
  return addedBy === "parent" ? "info" : "success";
}

function AddedByChip({
  theme,
  addedBy,
}: {
  theme: ParentThemeTokens;
  addedBy: HealthItemAddedBy;
}) {
  return (
    <ParentChip theme={theme} tone={addedByChipTone(addedBy)}>
      {ADDED_BY_LABELS[addedBy]}
    </ParentChip>
  );
}

export default function ParentHealthItemCard({
  theme,
  item,
  readOnly = false,
  onEdit,
}: ParentHealthItemCardProps) {
  if (item.type === "allergy") {
    return (
      <div
        className="rounded-2xl border px-4 py-3.5 sm:px-5"
        style={{ borderColor: theme.line, backgroundColor: theme.white }}
        data-testid={`parent-health-allergy-${item.id}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="m-0 text-sm font-semibold" style={{ color: theme.ink }}>
                {item.allergen}
              </p>
              <ParentChip theme={theme} tone={severityChipTone(item.severity)}>
                {SEVERITY_LABELS[item.severity]}
              </ParentChip>
              <AddedByChip theme={theme} addedBy={item.addedBy} />
            </div>
            {item.treatmentNotes ? (
              <p className="m-0 mt-1.5 text-xs leading-relaxed" style={{ color: theme.muted }}>
                {item.treatmentNotes}
              </p>
            ) : null}
            <p className="m-0 mt-1.5 text-[11px]" style={{ color: theme.muted }}>
              Updated {formatHealthDate(item.updatedAt)}
            </p>
          </div>
          {!readOnly && onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border-0 bg-transparent px-2 py-1 text-[11px] font-bold"
              style={{ color: theme.primary }}
              aria-label={`Edit ${item.allergen} allergy`}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Edit
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (item.type === "medication") {
    return (
      <div
        className="rounded-2xl border px-4 py-3.5 sm:px-5"
        style={{ borderColor: theme.line, backgroundColor: theme.white }}
        data-testid={`parent-health-medication-${item.id}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="m-0 text-sm font-semibold" style={{ color: theme.ink }}>
                {item.name}
              </p>
              <ParentChip theme={theme} tone={medicationStatusTone(item)}>
                {medicationStatusLabel(item)}
              </ParentChip>
              <AddedByChip theme={theme} addedBy={item.addedBy} />
            </div>
            <p className="m-0 mt-1.5 text-xs leading-relaxed" style={{ color: theme.muted }}>
              {formatMedicationSchedule(item)}
            </p>
          </div>
          {!readOnly && onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border-0 bg-transparent px-2 py-1 text-[11px] font-bold"
              style={{ color: theme.primary }}
              aria-label={`Edit ${item.name} medication`}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Edit
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border px-4 py-3.5 sm:px-5"
      style={{ borderColor: theme.line, backgroundColor: theme.white }}
      data-testid={`parent-health-update-${item.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 text-sm font-semibold" style={{ color: theme.ink }}>
              {item.title}
            </p>
            <AddedByChip theme={theme} addedBy={item.addedBy} />
          </div>
          {item.details ? (
            <p className="m-0 mt-1.5 text-xs leading-relaxed" style={{ color: theme.muted }}>
              {item.details}
            </p>
          ) : null}
          <p className="m-0 mt-1.5 text-[11px]" style={{ color: theme.muted }}>
            {formatHealthDate(item.createdAt)}
            {item.endDate && item.endDate !== item.startDate
              ? ` · Through ${formatHealthDate(item.endDate)}`
              : null}
          </p>
        </div>
        {!readOnly && onEdit ? (
          <ParentTextLink theme={theme} onClick={onEdit} className="shrink-0 !text-[11px]">
            Edit
          </ParentTextLink>
        ) : null}
      </div>
    </div>
  );
}
