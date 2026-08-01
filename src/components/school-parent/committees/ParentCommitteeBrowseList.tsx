"use client";

import { ArrowRight, Heart } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentCommitteeBrowseItem } from "@/lib/committees/types";
import ParentCommitteeRequestStatus from "./ParentCommitteeRequestStatus";

export default function ParentCommitteeBrowseList({
  committees,
  C,
  onOpenCommittee,
}: {
  committees: ParentCommitteeBrowseItem[];
  C: AdminThemeTokens;
  onOpenCommittee: (id: string) => void;
}) {
  if (committees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: C.accentLight }}
        >
          <Heart className="w-7 h-7" style={{ color: C.accent }} />
        </div>
        <h3 className="font-semibold text-lg mb-2" style={{ color: C.textPrimary }}>
          No committees available
        </h3>
        <p className="text-sm text-center max-w-xs" style={{ color: C.textSecondary }}>
          When the school opens volunteer committees, they will appear here for you to explore.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {committees.map((committee) => (
        <button
          key={committee.id}
          type="button"
          onClick={() => onOpenCommittee(committee.id)}
          className="text-left p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-sm group"
          style={{ backgroundColor: C.surface, borderColor: C.border }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {committee.name}
                </h3>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  {committee.termLabel}
                </span>
              </div>
              <p className="text-xs line-clamp-3" style={{ color: C.textSecondary }}>
                {committee.description}
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {committee.isMember && (
                  <span
                    className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: C.successBg, color: C.success }}
                  >
                    Member
                  </span>
                )}
                {committee.requestStatus && !committee.isMember && (
                  <ParentCommitteeRequestStatus status={committee.requestStatus} C={C} />
                )}
                {committee.dutyRoles.length > 0 && (
                  <span className="text-[10px]" style={{ color: C.textTertiary }}>
                    {committee.dutyRoles.length} role
                    {committee.dutyRoles.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            <ArrowRight
              className="w-5 h-5 shrink-0 mt-1 transition-colors"
              style={{ color: C.textTertiary }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
