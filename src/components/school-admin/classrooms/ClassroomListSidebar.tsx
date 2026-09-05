"use client";

import { useMemo, useState } from "react";
import { Home, Plus, Search } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import type { ClassroomStatus, ClassroomSummary } from "@/lib/school-admin/classrooms";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ClassroomListSidebarProps = {
  classrooms: ClassroomSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  theme: ParentThemeTokens;
  layout?: "sidebar" | "strip";
  onAddClassroom?: () => void;
};

const STATUS_LABELS: Record<ClassroomStatus, string> = {
  open: "Open",
  full: "Full",
  inactive: "Inactive",
};

function statusChipTone(
  status: ClassroomStatus,
): "success" | "warning" | "info" {
  if (status === "open") return "success";
  if (status === "full") return "warning";
  return "info";
}

function ClassroomSidebarRow({
  classroom,
  isActive,
  onSelect,
  theme,
  compact = false,
}: {
  classroom: ClassroomSummary;
  isActive: boolean;
  onSelect: () => void;
  theme: ParentThemeTokens;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 rounded-[11px] border text-left transition-colors ${
        compact ? "min-w-[170px] shrink-0 px-2.5 py-2" : "mb-[3px] px-[11px] py-[11px]"
      }`}
      style={
        isActive
          ? {
              backgroundColor: "#EDF5EE",
              borderColor: "#CCE0CF",
            }
          : {
              backgroundColor: "transparent",
              borderColor: "transparent",
            }
      }
    >
      <span
        className={`grid shrink-0 place-items-center rounded-full ${
          compact ? "h-[31px] w-[31px]" : "h-[37px] w-[37px]"
        }`}
        style={{ backgroundColor: "#E9F2EA", color: theme.primary }}
        aria-hidden="true"
      >
        <Home className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-xs font-semibold"
          style={{ color: isActive ? theme.primary : "#2C3E43" }}
        >
          {classroom.name}
        </div>
        <div className="mt-0.5 truncate text-[10px]" style={{ color: "#77858A" }}>
          {classroom.studentCount} students · {classroom.staffCount} staff
        </div>
      </div>
      {!compact ? (
        <AdminChip theme={theme} tone={statusChipTone(classroom.status)}>
          {STATUS_LABELS[classroom.status]}
        </AdminChip>
      ) : null}
    </button>
  );
}

export default function ClassroomListSidebar({
  classrooms,
  selectedId,
  onSelect,
  theme,
  layout = "sidebar",
  onAddClassroom,
}: ClassroomListSidebarProps) {
  const [sidebarSearch, setSidebarSearch] = useState("");

  const visibleClassrooms = useMemo(() => {
    const normalized = sidebarSearch.trim().toLowerCase();
    if (!normalized) return classrooms;
    return classrooms.filter((classroom) => {
      const haystack = [
        classroom.name,
        classroom.programName ?? "",
        STATUS_LABELS[classroom.status],
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [classrooms, sidebarSearch]);

  const inputStyle = {
    borderColor: "#DCE4DC",
    backgroundColor: theme.white,
    color: theme.ink,
  };

  if (layout === "strip") {
    return (
      <div className="mb-3 lg:hidden">
        <div className="mb-2 flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: "#9AA8AD" }}
            />
            <input
              value={sidebarSearch}
              onChange={(event) => setSidebarSearch(event.target.value)}
              placeholder="Search classrooms"
              className="w-full rounded-[9px] border py-2 pl-8 pr-3 text-xs"
              style={inputStyle}
            />
          </div>
          {onAddClassroom ? (
            <AdminButton theme={theme} variant="soft" onClick={onAddClassroom}>
              <Plus className="h-3.5 w-3.5" />
              Add
            </AdminButton>
          ) : null}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {visibleClassrooms.map((classroom) => (
            <ClassroomSidebarRow
              key={classroom.id}
              classroom={classroom}
              isActive={classroom.id === selectedId}
              onSelect={() => onSelect(classroom.id)}
              theme={theme}
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AdminCard theme={theme} padding="compact" className="sticky top-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#77858A" }}>
          Classrooms
        </span>
        {onAddClassroom ? (
          <button
            type="button"
            onClick={onAddClassroom}
            className="inline-flex items-center gap-1 text-[11px] font-medium"
            style={{ color: theme.primary }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        ) : null}
      </div>

      <div className="relative mb-2">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
          style={{ color: "#9AA8AD" }}
        />
        <input
          value={sidebarSearch}
          onChange={(event) => setSidebarSearch(event.target.value)}
          placeholder="Search classrooms"
          className="w-full rounded-[9px] border py-2 pl-8 pr-3 text-xs"
          style={inputStyle}
        />
      </div>

      <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
        {visibleClassrooms.length === 0 ? (
          <p className="px-1 py-3 text-xs" style={{ color: "#77858A" }}>
            No classrooms match your search.
          </p>
        ) : (
          visibleClassrooms.map((classroom) => (
            <ClassroomSidebarRow
              key={classroom.id}
              classroom={classroom}
              isActive={classroom.id === selectedId}
              onSelect={() => onSelect(classroom.id)}
              theme={theme}
            />
          ))
        )}
      </div>
    </AdminCard>
  );
}
