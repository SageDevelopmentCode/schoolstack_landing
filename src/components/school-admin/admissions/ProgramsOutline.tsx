"use client";

import { motion } from "framer-motion";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import {
  programStatusLabel,
  type Program,
} from "@/lib/admissions/programs";
import { isProgramParentPortalCoopMode } from "@/lib/admissions/program-parent-portal";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { outlineActiveRowStyle } from "./outline-item-styles";
import { programStatusChipTone } from "./program-status-chip";

const NEW_PROGRAM_ID = "__new__";
const MAX_ROW_STAGGER = 5;

type ProgramsOutlineProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  programs: Program[];
  selectedId: string | null;
  isNew: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

function ProgramOutlineRow({
  C,
  theme,
  program,
  active,
  index,
  onSelect,
}: {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  program: Program;
  active: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index, MAX_ROW_STAGGER) * 0.03, duration: 0.18 }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="mb-1 w-full rounded-[11px] border px-3 py-3 text-left transition-colors"
        style={outlineActiveRowStyle(active, theme)}
      >
        <p
          className="truncate text-xs font-semibold"
          style={{ color: active ? theme.primary : C.textPrimary }}
        >
          {program.name}
        </p>
        {program.description ? (
          <p
            className="mt-0.5 truncate text-[10px] leading-snug"
            style={{ color: C.textTertiary }}
          >
            {program.description}
          </p>
        ) : null}
        <span className="mt-1.5 inline-flex flex-wrap gap-1">
          <AdminChip theme={theme} tone={programStatusChipTone(program.status)}>
            {programStatusLabel(program.status)}
          </AdminChip>
          {isProgramParentPortalCoopMode(program.parent_portal_settings) ? (
            <AdminChip theme={theme} tone="info">
              Co-op mode
            </AdminChip>
          ) : null}
        </span>
      </button>
    </motion.div>
  );
}

export default function ProgramsOutline({
  C,
  theme,
  programs,
  selectedId,
  isNew,
  onSelect,
  onCreate,
}: ProgramsOutlineProps) {
  return (
    <div
      className="flex h-full w-[240px] shrink-0 flex-col overflow-hidden border-r bg-white"
      style={{ borderColor: "#EDF1ED" }}
    >
      <div
        className="flex shrink-0 items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "#EDF1ED" }}
      >
        <AdminSectionKicker theme={theme}>Programs</AdminSectionKicker>
        <AdminButton
          theme={theme}
          variant="soft"
          size="compact"
          onClick={onCreate}
          disabled={isNew}
        >
          + New
        </AdminButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {programs.length === 0 && !isNew ? (
          <p className="px-2 py-3 text-[11px] leading-relaxed" style={{ color: C.textTertiary }}>
            No programs yet. Create one before linking an application form.
          </p>
        ) : (
          <>
            {isNew ? (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
              >
                <div
                  className="mb-1 w-full rounded-[11px] border px-3 py-3 text-left"
                  style={outlineActiveRowStyle(true, theme)}
                >
                  <p className="text-xs font-semibold" style={{ color: theme.primary }}>
                    New program
                  </p>
                  <span className="mt-1.5 inline-flex">
                    <AdminChip theme={theme} tone="info">
                      Draft
                    </AdminChip>
                  </span>
                </div>
              </motion.div>
            ) : null}
            {programs.map((program, index) => (
              <ProgramOutlineRow
                key={program.id}
                C={C}
                theme={theme}
                program={program}
                active={program.id === selectedId}
                index={index}
                onSelect={() => onSelect(program.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export { NEW_PROGRAM_ID };
