"use client";

import { Search } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import { familyStatusLabel } from "@/components/school-admin/tuition/tuition-family-status";
import {
  familyEnrollmentBadgeLabel,
  familyEnrollmentStatusBadges,
  formatEnrollmentStatusLabel,
  type FamilyEnrollmentBadgeKind,
} from "@/lib/tuition/enrollment-status-labels";
import type { EnrollmentBillingStatus, FamilyBillingSummary } from "@/lib/tuition/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TuitionFamilyListSidebarProps = {
  families: FamilyBillingSummary[];
  selectedId: string | null;
  onSelect: (familyId: string) => void;
  theme: ParentThemeTokens;
  layout?: "sidebar" | "strip";
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
};

function familyEnrollmentChipTone(kind: FamilyEnrollmentBadgeKind): "info" | "success" {
  return kind === "enrolling" ? "info" : "success";
}

function FamilySidebarRow({
  family,
  isActive,
  onSelect,
  theme,
  compact = false,
}: {
  family: FamilyBillingSummary;
  isActive: boolean;
  onSelect: () => void;
  theme: ParentThemeTokens;
  compact?: boolean;
}) {
  const enrollmentBadges = familyEnrollmentStatusBadges(family.enrollments);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col gap-0.5 rounded-[11px] border text-left transition-colors ${
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
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="text-[12px] font-bold"
          style={{ color: theme.ink }}
        >
          {family.familyName}
        </span>
        {enrollmentBadges.map((kind) => (
          <AdminChip key={kind} theme={theme} tone={familyEnrollmentChipTone(kind)}>
            {familyEnrollmentBadgeLabel(kind)}
          </AdminChip>
        ))}
      </div>
      <span className="text-[10px]" style={{ color: theme.muted }}>
        {familyStatusLabel(family)}
      </span>
    </button>
  );
}

export function enrollmentStatusChipTone(
  status: EnrollmentBillingStatus,
): "info" | "success" | "warning" {
  if (status === "pending") return "info";
  if (status === "enrolled") return "success";
  return "warning";
}

export function EnrollmentStatusChip({
  status,
  theme,
}: {
  status: EnrollmentBillingStatus;
  theme: ParentThemeTokens;
}) {
  return (
    <AdminChip theme={theme} tone={enrollmentStatusChipTone(status)}>
      {formatEnrollmentStatusLabel(status)}
    </AdminChip>
  );
}

export default function TuitionFamilyListSidebar({
  families,
  selectedId,
  onSelect,
  theme,
  layout = "sidebar",
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  searchQuery = "",
  onSearchChange,
}: TuitionFamilyListSidebarProps) {
  const filteredFamilies = searchQuery.trim()
    ? families.filter((family) =>
        family.familyName.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : families;

  if (layout === "strip") {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filteredFamilies.map((family) => (
          <FamilySidebarRow
            key={family.familyId}
            family={family}
            isActive={family.familyId === selectedId}
            onSelect={() => onSelect(family.familyId)}
            theme={theme}
            compact
          />
        ))}
      </div>
    );
  }

  return (
    <AdminCard theme={theme} padding="none" className="flex h-full min-h-0 flex-col">
      {onSearchChange ? (
        <div className="border-b px-3 py-2.5" style={{ borderColor: "#E1E8E1" }}>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: theme.muted }}
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search families"
              className="w-full rounded-[9px] border py-2 pl-8 pr-3 text-[11px]"
              style={{
                borderColor: "#DCE4DC",
                backgroundColor: theme.white,
                color: theme.ink,
              }}
            />
          </div>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filteredFamilies.map((family) => (
          <FamilySidebarRow
            key={family.familyId}
            family={family}
            isActive={family.familyId === selectedId}
            onSelect={() => onSelect(family.familyId)}
            theme={theme}
          />
        ))}
        {filteredFamilies.length === 0 ? (
          <p className="px-2 py-3 text-[11px]" style={{ color: theme.muted }}>
            No families match your search.
          </p>
        ) : null}
      </div>
      {hasMore && onLoadMore ? (
        <div className="border-t p-2.5" style={{ borderColor: "#E1E8E1" }}>
          <AdminButton
            theme={theme}
            variant="outline"
            className="w-full"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more families"}
          </AdminButton>
        </div>
      ) : null}
    </AdminCard>
  );
}
