"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Archive, Plus, Users } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { CommitteeListItem } from "@/lib/committees/types";
import { fadeUp, staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

export default function CommitteeListView({
  committees,
  C,
  pendingRequestCount = 0,
  onOpenCommittee,
  onCreate,
}: {
  committees: CommitteeListItem[];
  C: AdminThemeTokens;
  pendingRequestCount?: number;
  onOpenCommittee: (id: string) => void;
  onCreate: () => void;
}) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="text-xl font-heading font-semibold"
              style={{ color: C.textPrimary }}
            >
              Committees
            </h1>
            {pendingRequestCount > 0 && (
              <span
                className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ backgroundColor: C.warningBg ?? C.accentLight, color: C.warning ?? C.accent }}
              >
                {pendingRequestCount} join request{pendingRequestCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
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
        <motion.div
          variants={fadeUp(reducedMotion)}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <p className="font-semibold mb-2" style={{ color: C.textPrimary }}>
            No committees yet
          </p>
          <p className="text-sm text-center max-w-xs" style={{ color: C.textSecondary }}>
            Create a committee workspace from a template to get started.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key={committees.map((c) => c.id).join("-")}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer(reducedMotion)}
          initial="initial"
          animate="animate"
        >
          {committees.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              variants={staggerItem(reducedMotion)}
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
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
