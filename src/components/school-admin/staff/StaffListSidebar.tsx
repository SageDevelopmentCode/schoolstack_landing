"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { submissionContactAvatarStyle } from "@/components/admissions/ParentPortalLoginIcon";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import {
  employmentStatusLabel,
  staffDisplayName,
} from "@/lib/staff/staff-display";
import { matchesStaffSearch } from "@/lib/school-admin/admin-staff-roster-metrics";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { initialsFromName } from "@/lib/messages/format";

type StaffListSidebarProps = {
  members: StaffMemberRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
  theme: ParentThemeTokens;
  layout?: "sidebar" | "strip";
  onAddStaff?: () => void;
};

function employmentChipTone(
  status: StaffMemberRecord["employmentStatus"],
): "success" | "warning" | "info" {
  if (status === "active") return "success";
  if (status === "on_leave") return "info";
  return "warning";
}

function StaffSidebarRow({
  member,
  isActive,
  onSelect,
  theme,
  compact = false,
}: {
  member: StaffMemberRecord;
  isActive: boolean;
  onSelect: () => void;
  theme: ParentThemeTokens;
  compact?: boolean;
}) {
  const name = staffDisplayName(member);
  const avatarStyle = submissionContactAvatarStyle(name);

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
        className={`grid shrink-0 place-items-center rounded-full font-extrabold ${
          compact ? "h-[31px] w-[31px] text-[10px]" : "h-[37px] w-[37px] text-[11px]"
        }`}
        style={avatarStyle}
        aria-hidden="true"
      >
        {initialsFromName(name).slice(0, 2)}
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-xs font-semibold"
          style={{ color: isActive ? theme.primary : "#2C3E43" }}
        >
          {name}
        </div>
        <div className="mt-0.5 truncate text-[10px]" style={{ color: "#77858A" }}>
          {member.roleTitle || "—"}
        </div>
      </div>
      {!compact ? (
        <AdminChip theme={theme} tone={employmentChipTone(member.employmentStatus)}>
          {employmentStatusLabel(member.employmentStatus)}
        </AdminChip>
      ) : null}
    </button>
  );
}

export default function StaffListSidebar({
  members,
  selectedId,
  onSelect,
  theme,
  layout = "sidebar",
  onAddStaff,
}: StaffListSidebarProps) {
  const [sidebarSearch, setSidebarSearch] = useState("");

  const visibleMembers = useMemo(
    () => members.filter((member) => matchesStaffSearch(member, sidebarSearch)),
    [members, sidebarSearch],
  );

  const inputStyle = {
    borderColor: "#DCE4DC",
    backgroundColor: theme.white,
    color: theme.ink,
  };

  if (layout === "strip") {
    return (
      <div className="mb-2 lg:hidden">
        {onAddStaff ? (
          <AdminButton
            theme={theme}
            variant="primary"
            className="mb-2 w-full"
            onClick={onAddStaff}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add staff
          </AdminButton>
        ) : null}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {visibleMembers.map((member) => (
            <StaffSidebarRow
              key={member.id}
              member={member}
              isActive={member.id === selectedId}
              onSelect={() => onSelect(member.id)}
              theme={theme}
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AdminCard theme={theme} padding="none" className="h-max p-2">
      {onAddStaff ? (
        <AdminButton
          theme={theme}
          variant="primary"
          className="mb-2 w-full"
          onClick={onAddStaff}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add staff
        </AdminButton>
      ) : null}
      <div className="relative mb-2">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
          style={{ color: "#8B9699" }}
          aria-hidden="true"
        />
        <input
          type="search"
          value={sidebarSearch}
          onChange={(event) => setSidebarSearch(event.target.value)}
          placeholder="Search staff"
          className="w-full rounded-[9px] border py-2 pl-8 pr-2.5 text-[11px] outline-none"
          style={inputStyle}
        />
      </div>
      <div className="max-h-[min(70vh,720px)] overflow-y-auto">
        {visibleMembers.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs" style={{ color: theme.muted }}>
            No staff match your search.
          </p>
        ) : (
          visibleMembers.map((member) => (
            <StaffSidebarRow
              key={member.id}
              member={member}
              isActive={member.id === selectedId}
              onSelect={() => onSelect(member.id)}
              theme={theme}
            />
          ))
        )}
      </div>
    </AdminCard>
  );
}
