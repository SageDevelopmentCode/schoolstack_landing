"use client";

import { Archive, Plus, Users } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { CommitteeListItem } from "@/lib/committees/types";

export default function CommitteeListView({
  committees,
  C,
  onOpenCommittee,
  onCreate,
}: {
  committees: CommitteeListItem[];
  C: AdminThemeTokens;
  onOpenCommittee: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-xl font-heading font-semibold"
            style={{ color: C.textPrimary }}
          >
            Committees
          </h1>
          <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
            Structured parent workspaces for volunteer groups, coordinators, and
            festival teams.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl cursor-pointer"
          style={{ backgroundColor: C.accent }}
        >
          <Plus className="w-4 h-4" />
          Create committee
        </button>
      </div>

      {committees.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <p className="font-semibold mb-2" style={{ color: C.textPrimary }}>
            No committees yet
          </p>
          <p className="text-sm text-center max-w-xs" style={{ color: C.textSecondary }}>
            Create a committee workspace from a template to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {committees.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onOpenCommittee(c.id)}
              className="text-left p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-sm"
              style={{
                backgroundColor: C.surface,
                borderColor: C.border,
              }}
            >
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {c.name}
                </h3>
                <span
                  className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor:
                      c.status === "active" ? C.successBg : C.border,
                    color: c.status === "active" ? C.success : C.textSecondary,
                  }}
                >
                  {c.status}
                </span>
              </div>
              <p className="text-xs line-clamp-2" style={{ color: C.textSecondary }}>
                {c.description}
              </p>
              <div
                className="flex items-center gap-3 mt-3 text-xs"
                style={{ color: C.textTertiary }}
              >
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {c.memberCount} members
                </span>
                <span>{c.termLabel}</span>
              </div>
              {c.status === "archived" && (
                <span
                  className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium"
                  style={{ color: C.textTertiary }}
                >
                  <Archive className="w-3 h-3" />
                  History preserved
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
