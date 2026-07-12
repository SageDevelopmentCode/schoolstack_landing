"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ClipboardList, FileText, Plus } from "lucide-react";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { FLOW_TYPE_LABELS, StatusBadge } from "./ApplicationFormListBadges";

export type FlowListSelection = {
  kind: "apply" | "checklist";
  id: string;
} | null;

type ApplicationFormListProps = {
  C: AdminThemeTokens;
  forms: ApplicationFormVersion[];
  checklists: EnrollmentChecklistTemplate[];
  selected: FlowListSelection;
  creating: boolean;
  hasApplyForm: boolean;
  hasEnrollmentChecklist: boolean;
  onSelect: (selection: FlowListSelection) => void;
  onCreateApply: () => void;
  onCreateChecklist: () => void;
};

export default function ApplicationFormList({
  C,
  forms,
  checklists,
  selected,
  creating,
  hasApplyForm,
  hasEnrollmentChecklist,
  onSelect,
  onCreateApply,
  onCreateChecklist,
}: ApplicationFormListProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const isEmpty = forms.length === 0 && checklists.length === 0;

  return (
    <div
      className="flex flex-col flex-shrink-0 overflow-hidden h-full"
      style={{
        width: 240,
        borderRight: `1px solid ${C.border}`,
        backgroundColor: C.bg,
      }}
    >
      <div
        className="flex h-14 flex-shrink-0 items-center justify-between px-3"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Application forms
        </span>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            disabled={creating}
            className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
            style={getAdminButtonStyle(C, "secondary")}
          >
            <Plus className="w-3.5 h-3.5" />
            New
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {menuOpen ? (
            <div
              className="absolute right-0 top-full z-20 mt-1 w-52 rounded-md border py-1 shadow-lg"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <button
                type="button"
                disabled={hasApplyForm || creating}
                onClick={() => {
                  setMenuOpen(false);
                  onCreateApply();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs disabled:opacity-50"
                style={{ color: C.textPrimary }}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: C.accent }} />
                <span className="font-semibold">Apply form</span>
              </button>
              <button
                type="button"
                disabled={hasEnrollmentChecklist || creating}
                onClick={() => {
                  setMenuOpen(false);
                  onCreateChecklist();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs disabled:opacity-50"
                style={{ color: C.textPrimary }}
              >
                <ClipboardList
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: C.accent }}
                />
                <span className="font-semibold">Enrollment checklist</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <p className="px-3 py-4 text-xs" style={{ color: C.textTertiary }}>
            No forms yet. Create an apply form or enrollment checklist to get started.
          </p>
        ) : (
          <>
            {forms.map((form) => {
              const isActive =
                selected?.kind === "apply" && selected.id === form.id;

              return (
                <button
                  key={form.id}
                  type="button"
                  onClick={() => onSelect({ kind: "apply", id: form.id })}
                  className="w-full text-left px-3 py-3 transition-all"
                  style={{
                    backgroundColor: isActive ? C.accentLight : "transparent",
                    borderLeft: isActive
                      ? `3px solid ${C.accent}`
                      : "3px solid transparent",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-medium leading-snug"
                      style={{ color: C.textPrimary }}
                    >
                      {form.title}
                    </p>
                    <StatusBadge C={C} status={form.status} />
                  </div>
                  <p className="mt-1 text-[11px]" style={{ color: C.textTertiary }}>
                    {FLOW_TYPE_LABELS.apply}
                  </p>
                </button>
              );
            })}
            {checklists.map((checklist) => {
              const isActive =
                selected?.kind === "checklist" && selected.id === checklist.id;

              return (
                <button
                  key={checklist.id}
                  type="button"
                  onClick={() => onSelect({ kind: "checklist", id: checklist.id })}
                  className="w-full text-left px-3 py-3 transition-all"
                  style={{
                    backgroundColor: isActive ? C.accentLight : "transparent",
                    borderLeft: isActive
                      ? `3px solid ${C.accent}`
                      : "3px solid transparent",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-medium leading-snug"
                      style={{ color: C.textPrimary }}
                    >
                      {checklist.name}
                    </p>
                    <StatusBadge C={C} status={checklist.status} />
                  </div>
                  <p className="mt-1 text-[11px]" style={{ color: C.textTertiary }}>
                    {FLOW_TYPE_LABELS.checklist}
                  </p>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export { FLOW_TYPE_LABELS, StatusBadge } from "./ApplicationFormListBadges";
