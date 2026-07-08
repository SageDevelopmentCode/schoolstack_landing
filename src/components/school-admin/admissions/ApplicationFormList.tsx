"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ClipboardList, FileText, Plus } from "lucide-react";
import {
  formatFormUpdatedAt,
  type ApplicationFormStatus,
  type ApplicationFormVersion,
} from "@/lib/admissions/application-form-schema";
import {
  ENROLLMENT_CHECKLIST_PATH,
  enrollmentChecklistRelativePath,
  type EnrollmentChecklistTemplate,
} from "@/lib/admissions/enrollment-checklist-templates";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const STATUS_STYLES: Record<
  ApplicationFormStatus,
  { bg: string; color: string; label: string }
> = {
  draft: { bg: "rgba(217, 119, 6, 0.1)", color: "#D97706", label: "Draft" },
  published: { bg: "rgba(22, 163, 74, 0.1)", color: "#16A34A", label: "Published" },
  archived: { bg: "rgba(113, 113, 122, 0.1)", color: "#71717A", label: "Archived" },
};

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
            style={{ backgroundColor: C.accentLight, color: C.accent }}
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
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs disabled:opacity-50"
                style={{ color: C.textPrimary }}
              >
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.accent }} />
                <span>
                  <span className="block font-semibold">Apply form</span>
                  <span className="block" style={{ color: C.textTertiary }}>
                    /forms/apply
                  </span>
                </span>
              </button>
              <button
                type="button"
                disabled={hasEnrollmentChecklist || creating}
                onClick={() => {
                  setMenuOpen(false);
                  onCreateChecklist();
                }}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs disabled:opacity-50"
                style={{ color: C.textPrimary }}
              >
                <ClipboardList
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: C.accent }}
                />
                <span>
                  <span className="block font-semibold">Enrollment checklist</span>
                  <span className="block" style={{ color: C.textTertiary }}>
                    {enrollmentChecklistRelativePath(ENROLLMENT_CHECKLIST_PATH)}
                  </span>
                </span>
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
              const statusStyle = STATUS_STYLES[form.status];
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
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px]" style={{ color: C.textTertiary }}>
                    Apply · v{form.version}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
                    {form.public_slug ? `/forms/${form.public_slug} · ` : ""}
                    {form.schema.sections.length} step
                    {form.schema.sections.length === 1 ? "" : "s"} ·{" "}
                    {formatFormUpdatedAt(form.updated_at)}
                  </p>
                </button>
              );
            })}
            {checklists.map((checklist) => {
              const isActive =
                selected?.kind === "checklist" && selected.id === checklist.id;
              const statusStyle =
                checklist.status === "published"
                  ? STATUS_STYLES.published
                  : checklist.status === "archived"
                    ? STATUS_STYLES.archived
                    : STATUS_STYLES.draft;

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
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px]" style={{ color: C.textTertiary }}>
                    Checklist
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
                    {enrollmentChecklistRelativePath(checklist.enrollmentPath)} ·{" "}
                    {formatFormUpdatedAt(checklist.updatedAt)}
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

export { StatusBadge } from "./ApplicationFormListBadges";
