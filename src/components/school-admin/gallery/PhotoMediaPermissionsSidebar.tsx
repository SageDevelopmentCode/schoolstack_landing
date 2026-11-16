"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, GSkeleton, gLinkSm } from "@/components/school-parent/garden/ui";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { GardenFilterChips, GardenLoadError, GardenNotice } from "@/components/school-admin/garden/kit";
import { GardenAvatar, GardenSearchInput } from "@/components/school-admin/garden/blocks";
import type { OrgPhotoMediaConsentRosterRow } from "@/lib/students/load-org-photo-media-consent-roster";
import { photoMediaConsentAdminChipTone } from "@/lib/students/photo-media-consent";
import { formatActionError } from "@/lib/school-admin/admin-toast";

type PhotoMediaPermissionsSidebarProps = {
  organizationId: string;
  open: boolean;
  onClose: () => void;
};

type ConsentFilter = "all" | "full" | "limited" | "none" | "unknown";

const FILTER_LABELS: Record<ConsentFilter, string> = {
  all: "Everyone",
  full: "OK to share",
  limited: "Limited",
  none: "No photos",
  unknown: "Not answered",
};

function consentKey(row: OrgPhotoMediaConsentRosterRow): Exclude<ConsentFilter, "all"> {
  return row.consent ?? "unknown";
}

function formatUpdatedAt(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Garden drawer: stored photo/media consent for enrolled students (read-only). */
export default function PhotoMediaPermissionsSidebar({
  organizationId,
  open,
  onClose,
}: PhotoMediaPermissionsSidebarProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const [students, setStudents] = useState<OrgPhotoMediaConsentRosterRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConsentFilter>("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ organizationId });
      const response = await fetch(`/api/school-admin/photo-media-consents?${params}`);
      const payload = (await response.json().catch(() => ({}))) as {
        students?: OrgPhotoMediaConsentRosterRow[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load photo permissions.");
      }
      setStudents(payload.students ?? []);
    } catch (err) {
      setError(formatActionError(err, "Could not load photo permissions."));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      void load();
    });
  }, [open, load]);

  const counts = useMemo(() => {
    const result: Record<ConsentFilter, number> = { all: students.length, full: 0, limited: 0, none: 0, unknown: 0 };
    for (const row of students) result[consentKey(row)] += 1;
    return result;
  }, [students]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return students.filter((row) => {
      if (filter !== "all" && consentKey(row) !== filter) return false;
      if (!needle) return true;
      return `${row.firstName} ${row.lastName} ${row.familyName ?? ""} ${row.programLabel}`.toLowerCase().includes(needle);
    });
  }, [filter, query, students]);

  const restricted = counts.limited + counts.none;
  const options = (["all", "full", "limited", "none", "unknown"] as ConsentFilter[])
    .filter((key) => key === "all" || counts[key] > 0)
    .map((key) => ({ key, label: FILTER_LABELS[key], count: counts[key] }));

  return (
    <GSidePanel
      theme={theme}
      open={open}
      onClose={onClose}
      title="Photo permissions"
      kicker="Before you share"
      subtitle="Stored consent for enrolled students (from enrollment and parent updates)."
      testId="admin-photo-media-permissions-sidebar"
      panelId="admin-photo-media-permissions"
      headerAside={!loading && !error && students.length > 0 ? <GChip tone="neutral">{students.length} students</GChip> : null}
    >
      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading photo permissions">
          {Array.from({ length: 7 }, (_, index) => (
            <GSkeleton key={index} className="h-[52px] rounded-[14px]" />
          ))}
        </div>
      ) : error ? (
        <GardenLoadError title="Couldn't load photo permissions." description={error} onRetry={() => void load()} />
      ) : students.length === 0 ? (
        <GardenNotice tone="info" icon={Camera}>
          No enrolled students yet.
        </GardenNotice>
      ) : (
        <div className="flex flex-col gap-3">
          {restricted > 0 ? (
            <GardenNotice tone="warning" title={`${restricted} ${restricted === 1 ? "student has" : "students have"} limited or no photo permission.`}>
              Check this list before sharing photos where they appear.
            </GardenNotice>
          ) : null}
          <GardenSearchInput value={query} onChange={setQuery} placeholder="Search students or programs" label="Search students" />
          <GardenFilterChips
            options={options}
            value={filter}
            onChange={(key) => setFilter(key as ConsentFilter)}
            ariaLabel="Filter by photo permission"
          />
          {visible.length === 0 ? (
            <div className="rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-4 py-6 text-center">
              <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">No students match this filter.</p>
              <button
                type="button"
                className={`${gLinkSm} mt-1`}
                onClick={() => {
                  setFilter("all");
                  setQuery("");
                }}
              >
                Show everyone
              </button>
            </div>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-1 p-0" aria-label="Students">
              {visible.map((row) => {
                const name = `${row.firstName} ${row.lastName}`.trim();
                return (
                  <li
                    key={row.studentId}
                    className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/[0.07] bg-white px-3 py-2.5"
                  >
                    <GardenAvatar name={name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{name}</p>
                      <p className="m-0 truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                        {row.programLabel} · updated {formatUpdatedAt(row.updatedAt)}
                      </p>
                    </div>
                    <GChip tone={photoMediaConsentAdminChipTone(row.consent)}>{row.consentLabel}</GChip>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </GSidePanel>
  );
}
