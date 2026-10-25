"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Copy, FileText } from "lucide-react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import { isApplyFormVersion } from "@/lib/admissions/application-forms";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import type { EnrollmentFlowProgramSummary } from "@/lib/school-admin/load-enrollment-flows-list-data";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { FLOW_TYPE_LABELS, getStatusLabel } from "./ApplicationFormListBadges";
import { enrollmentFlowStatusChipTone } from "./EnrollmentProgramFlowCard";
import type { FlowListSelection } from "./enrollment-flow-selection";

type FormRowKind = "apply" | "checklist";

type UnifiedFormRow = {
  id: string;
  kind: FormRowKind;
  title: string;
  typeLabel: string;
  status: ApplicationFormVersion["status"];
  programId: string | null;
  programName: string;
};

type EnrollmentFlowsFormsTableProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  forms: ApplicationFormVersion[];
  checklists: EnrollmentChecklistTemplate[];
  programs: EnrollmentFlowProgramSummary[];
  searchQuery: string;
  onSelect: (selection: FlowListSelection) => void;
  onDuplicateForm: (formId: string) => void;
  duplicating?: boolean;
};

const filterSelectClass =
  "max-w-[220px] flex-1 min-w-[100px] rounded-[9px] border border-[#DCE4D8] bg-white px-2.5 py-2 text-[10px] text-[#5D7563] focus:outline focus:outline-2 focus:outline-offset-2";

function buildUnifiedRows(
  forms: ApplicationFormVersion[],
  checklists: EnrollmentChecklistTemplate[],
  programNameById: Map<string, string>,
): UnifiedFormRow[] {
  const applyRows: UnifiedFormRow[] = forms.map((form) => ({
    id: form.id,
    kind: "apply",
    title: form.title || "Untitled form",
    typeLabel: isApplyFormVersion(form) ? FLOW_TYPE_LABELS.apply : "Custom form",
    status: form.status,
    programId: isApplyFormVersion(form) ? form.program_id : null,
    programName:
      isApplyFormVersion(form) && form.program_id
        ? programNameById.get(form.program_id) ?? "Unassigned"
        : "Unassigned",
  }));

  const checklistRows: UnifiedFormRow[] = checklists.map((checklist) => ({
    id: checklist.id,
    kind: "checklist",
    title: checklist.name || "Enrollment checklist",
    typeLabel: FLOW_TYPE_LABELS.checklist,
    status: checklist.status,
    programId: checklist.programId,
    programName: checklist.programId
      ? programNameById.get(checklist.programId) ?? "Unassigned"
      : "Unassigned",
  }));

  return [...applyRows, ...checklistRows];
}

export default function EnrollmentFlowsFormsTable({
  C,
  theme,
  forms,
  checklists,
  programs,
  searchQuery,
  onSelect,
  onDuplicateForm,
  duplicating = false,
}: EnrollmentFlowsFormsTableProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | "apply" | "checklist">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [programFilter, setProgramFilter] = useState<string>("all");

  const programNameById = useMemo(
    () => new Map(programs.map((program) => [program.id, program.name])),
    [programs],
  );

  const allRows = useMemo(
    () => buildUnifiedRows(forms, checklists, programNameById),
    [forms, checklists, programNameById],
  );

  const filteredRows = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return allRows.filter((row) => {
      if (typeFilter !== "all" && row.kind !== typeFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (programFilter === "unassigned") {
        if (row.programId) return false;
      } else if (programFilter !== "all" && row.programId !== programFilter) {
        return false;
      }
      if (!query) return true;
      const haystack = [row.title, row.programName, row.typeLabel].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [allRows, typeFilter, statusFilter, programFilter, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className={filterSelectClass}
          style={{ outlineColor: theme.primary }}
          aria-label="Filter by form type"
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as "all" | "apply" | "checklist")
          }
        >
          <option value="all">All types</option>
          <option value="apply">Apply forms</option>
          <option value="checklist">Enrollment checklists</option>
        </select>
        <select
          className={filterSelectClass}
          style={{ outlineColor: theme.primary }}
          aria-label="Filter by form status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | "published" | "draft")
          }
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          className={filterSelectClass}
          style={{ outlineColor: theme.primary }}
          aria-label="Filter by program"
          value={programFilter}
          onChange={(event) => setProgramFilter(event.target.value)}
        >
          <option value="all">All programs</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      <AdminCard theme={theme} padding="none" className="overflow-hidden shadow-[0_3px_10px_rgba(50,72,61,0.035)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr
                className="border-b text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#8A9786]"
                style={{ backgroundColor: "#FCFDFB", borderColor: theme.line }}
              >
                <th scope="col" className="px-5 py-4 sm:px-[22px]">Form</th>
                <th scope="col" className="hidden px-5 py-4 sm:table-cell sm:px-[22px] program-col">
                  Program
                </th>
                <th scope="col" className="hidden px-5 py-4 md:table-cell sm:px-[22px] type-col">
                  Type
                </th>
                <th scope="col" className="px-5 py-4 sm:px-[22px]">Status</th>
                <th scope="col" className="px-5 py-4 sm:px-[22px]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 sm:px-[22px]">
                    <p className="text-center text-xs leading-relaxed" style={{ color: theme.muted }}>
                      No forms match these filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const Icon = row.kind === "apply" ? FileText : ClipboardList;
                  return (
                    <tr
                      key={`${row.kind}-${row.id}`}
                      className="border-b border-[#E9EFEA] last:border-0"
                    >
                      <td className="px-5 py-5 text-[11px] leading-relaxed sm:px-[22px]">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] text-[#789374]"
                            style={{ backgroundColor: "#EFF4EB" }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                onSelect(
                                  row.kind === "apply"
                                    ? { kind: "apply", id: row.id }
                                    : { kind: "checklist", id: row.id },
                                )
                              }
                              className="border-0 bg-transparent p-0 text-left text-xs font-semibold leading-relaxed"
                              style={{ color: theme.primary }}
                            >
                              {row.title}
                            </button>
                            <small className="block text-[9px]" style={{ color: theme.muted }}>
                              {row.typeLabel}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td
                        className="hidden px-5 py-5 text-[11px] sm:table-cell sm:px-[22px]"
                        style={{ color: C.textPrimary }}
                      >
                        {row.programName}
                      </td>
                      <td
                        className="hidden px-5 py-5 text-[11px] md:table-cell sm:px-[22px]"
                        style={{ color: C.textPrimary }}
                      >
                        {row.typeLabel}
                      </td>
                      <td className="px-5 py-5 sm:px-[22px]">
                        <AdminChip theme={theme} tone={enrollmentFlowStatusChipTone(row.status)}>
                          {getStatusLabel(row.status)}
                        </AdminChip>
                      </td>
                      <td className="px-5 py-5 sm:px-[22px]">
                        <div className="flex items-center justify-end gap-2">
                          <AdminTextLink
                            theme={theme}
                            className="text-[10px]"
                            onClick={() =>
                              onSelect(
                                row.kind === "apply"
                                  ? { kind: "apply", id: row.id }
                                  : { kind: "checklist", id: row.id },
                              )
                            }
                          >
                            Open
                          </AdminTextLink>
                          {row.kind === "apply" ? (
                            <button
                              type="button"
                              disabled={duplicating}
                              onClick={() => onDuplicateForm(row.id)}
                              className="grid place-items-center rounded-lg border border-[#E4E8E1] bg-white p-1.5 text-[#859282] disabled:opacity-50"
                              aria-label={`Duplicate ${row.title}`}
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
