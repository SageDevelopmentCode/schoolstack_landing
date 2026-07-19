"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ClipboardList,
  FileText,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ApplicationFormVersion, ApplicationFormStatus } from "@/lib/admissions/application-form-schema";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import {
  FLOW_TYPE_LABELS,
  getStatusLabel,
  StatusIcon,
} from "./ApplicationFormListBadges";
import type { FlowListSelection } from "./enrollment-flow-selection";

type EnrollmentFlowsSidebarProps = {
  C: AdminThemeTokens;
  open: boolean;
  forms: ApplicationFormVersion[];
  checklists: EnrollmentChecklistTemplate[];
  selected: FlowListSelection;
  creating: boolean;
  hasApplyForm: boolean;
  hasEnrollmentChecklist: boolean;
  onClose: () => void;
  onSelect: (selection: FlowListSelection) => void;
  onCreateApply: () => void;
  onCreateChecklist: () => void;
};

type FlowListItemProps = {
  C: AdminThemeTokens;
  active: boolean;
  title: string;
  typeLabel: string;
  status: ApplicationFormStatus;
  icon: LucideIcon;
  onClick: () => void;
};

function FlowListItem({
  C,
  active,
  title,
  typeLabel,
  status,
  icon: Icon,
  onClick,
}: FlowListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-[4.5rem] px-4 py-4 text-left transition-all"
      style={{
        backgroundColor: active ? C.accentLight : "transparent",
        borderLeft: active ? `3px solid ${C.accent}` : "3px solid transparent",
      }}
    >
      <div className="flex items-start gap-3">
        <Icon
          className="mt-0.5 h-5 w-5 shrink-0"
          style={{ color: C.accent }}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p
            className="line-clamp-2 text-sm font-semibold leading-snug"
            style={{ color: C.textPrimary }}
          >
            {title}
          </p>
          <div
            className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs"
            style={{ color: C.textTertiary }}
          >
            <span>{typeLabel}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <StatusIcon status={status} variant="plain" size="sm" />
              <span>{getStatusLabel(status)}</span>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function EnrollmentFlowsSidebar({
  C,
  open,
  forms,
  checklists,
  selected,
  creating,
  hasApplyForm,
  hasEnrollmentChecklist,
  onClose,
  onSelect,
  onCreateApply,
  onCreateChecklist,
}: EnrollmentFlowsSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

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
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] max-w-full flex-col overflow-hidden"
            style={{
              backgroundColor: C.bg,
              borderLeft: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
            aria-label="Application forms"
          >
            <div
              className="flex h-14 flex-shrink-0 items-center justify-between gap-2 px-4"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <span className="min-w-0 truncate text-sm font-semibold" style={{ color: C.textPrimary }}>
                Application forms
              </span>
              <div className="flex flex-shrink-0 items-center gap-1">
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((isOpen) => !isOpen)}
                    disabled={creating}
                    className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                    style={getAdminButtonStyle(C, "secondary")}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New
                    <ChevronDown className="h-3 w-3 opacity-70" />
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
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded p-1"
                  style={{ color: C.textTertiary }}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isEmpty ? (
                <p className="px-4 py-4 text-xs" style={{ color: C.textTertiary }}>
                  No forms yet. Create an apply form or enrollment checklist to get started.
                </p>
              ) : (
                <>
                  {forms.map((form) => (
                    <FlowListItem
                      key={form.id}
                      C={C}
                      active={selected?.kind === "apply" && selected.id === form.id}
                      title={form.title || "Untitled form"}
                      typeLabel={FLOW_TYPE_LABELS.apply}
                      status={form.status}
                      icon={FileText}
                      onClick={() => onSelect({ kind: "apply", id: form.id })}
                    />
                  ))}
                  {checklists.map((checklist) => (
                    <FlowListItem
                      key={checklist.id}
                      C={C}
                      active={
                        selected?.kind === "checklist" && selected.id === checklist.id
                      }
                      title={checklist.name || "Enrollment checklist"}
                      typeLabel={FLOW_TYPE_LABELS.checklist}
                      status={checklist.status}
                      icon={ClipboardList}
                      onClick={() => onSelect({ kind: "checklist", id: checklist.id })}
                    />
                  ))}
                </>
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
