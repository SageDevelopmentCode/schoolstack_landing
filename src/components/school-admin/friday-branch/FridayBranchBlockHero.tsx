"use client";

import { useState } from "react";
import SchoolAdminDatePicker, {
  schoolAdminDateRangeBounds,
} from "@/components/school-admin/ui/SchoolAdminDatePicker";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  countClassesWithField,
  formatFridayDateLong,
  getBlockSummaryText,
  getBlockSummaryTitle,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";

type FridayBranchBlockHeroProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  block: FridayBranchBlock;
  onChange: (block: FridayBranchBlock) => void;
};

export default function FridayBranchBlockHero({
  C,
  theme,
  block,
  onChange,
}: FridayBranchBlockHeroProps) {
  const [editingDates, setEditingDates] = useState(false);
  const { minDate, maxDate } = schoolAdminDateRangeBounds();
  const locationStats = countClassesWithField(block, "location");
  const ageStats = countClassesWithField(block, "ageGroup");

  return (
    <div className="grid gap-[15px] lg:grid-cols-[1.2fr_0.8fr]">
      <AdminCard
        theme={theme}
        padding="none"
        className="relative overflow-hidden !border-[#E0E7E0] bg-gradient-to-br from-[#fffdf8] to-[#eef7ef] p-[22px]"
      >
        <span
          className="pointer-events-none absolute right-5 top-1 font-heading text-[75px] leading-none opacity-[0.18]"
          style={{ color: "#E4BD65", fontFamily: theme.fontDisplay }}
          aria-hidden
        >
          ✦
        </span>
        <AdminSectionKicker theme={theme}>Active planning block</AdminSectionKicker>
        <input
          value={block.label}
          onChange={(event) => onChange({ ...block, label: event.target.value })}
          className="mt-1.5 w-full border-0 bg-transparent p-0 font-heading text-2xl font-semibold outline-none"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          aria-label="Block name"
        />
        <textarea
          value={block.description ?? ""}
          onChange={(event) => onChange({ ...block, description: event.target.value })}
          rows={3}
          className="mt-2 w-full max-w-[520px] resize-none border-0 bg-transparent p-0 text-xs leading-relaxed outline-none"
          style={{ color: "#6E7D80" }}
          placeholder="Describe this block's Friday rhythm..."
          aria-label="Block description"
        />

        {editingDates ? (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.07em]" style={{ color: "#879397" }}>
                Starts
              </span>
              <SchoolAdminDatePicker
                id={`fb-hero-${block.id}-start`}
                value={block.startDate}
                onChange={(iso) => onChange({ ...block, startDate: iso })}
                C={C}
                minDate={minDate}
                maxDate={block.endDate || maxDate}
              />
            </label>
            <span className="pb-2 text-[11px]" style={{ color: "#7D8B8E" }}>through</span>
            <label className="space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.07em]" style={{ color: "#879397" }}>
                Ends
              </span>
              <SchoolAdminDatePicker
                id={`fb-hero-${block.id}-end`}
                value={block.endDate}
                onChange={(iso) => onChange({ ...block, endDate: iso })}
                C={C}
                minDate={block.startDate || minDate}
                maxDate={maxDate}
              />
            </label>
            <AdminButton theme={theme} variant="soft" type="button" onClick={() => setEditingDates(false)}>
              Done
            </AdminButton>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-[9px]">
            <div
              className="rounded-[10px] border px-2.5 py-2 text-[11px]"
              style={{ borderColor: "#DCE6DD", backgroundColor: "#fff", color: "#44555A" }}
            >
              <b className="mb-0.5 block text-[9px] uppercase tracking-[0.07em]" style={{ color: "#879397" }}>
                Starts
              </b>
              {formatFridayDateLong(block.startDate)}
            </div>
            <span className="text-[11px]" style={{ color: "#7D8B8E" }}>through</span>
            <div
              className="rounded-[10px] border px-2.5 py-2 text-[11px]"
              style={{ borderColor: "#DCE6DD", backgroundColor: "#fff", color: "#44555A" }}
            >
              <b className="mb-0.5 block text-[9px] uppercase tracking-[0.07em]" style={{ color: "#879397" }}>
                Ends
              </b>
              {formatFridayDateLong(block.endDate)}
            </div>
            <AdminButton theme={theme} variant="outline" type="button" onClick={() => setEditingDates(true)}>
              Edit dates
            </AdminButton>
          </div>
        )}
      </AdminCard>

      <div
        className="rounded-[17px] p-[21px]"
        style={{ backgroundColor: "#315E4F", color: "#fff" }}
      >
        <p className="text-[10px] font-extrabold uppercase tracking-[0.13em]" style={{ color: "#C4E2CA" }}>
          Block rhythm
        </p>
        <h2
          className="mt-1.5 font-heading text-[21px] font-semibold"
          style={{ fontFamily: theme.fontDisplay }}
        >
          {getBlockSummaryTitle(block)}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#D7E6DA" }}>
          {getBlockSummaryText(block)}
        </p>
        <div
          className="mt-[11px] flex justify-between border-t pt-[11px] text-[11px]"
          style={{ borderColor: "rgba(255,255,255,0.17)", color: "#D7E6DA" }}
        >
          <span>Class locations set</span>
          <b>{locationStats.filled} of {locationStats.total}</b>
        </div>
        <div
          className="mt-[11px] flex justify-between border-t pt-[11px] text-[11px]"
          style={{ borderColor: "rgba(255,255,255,0.17)", color: "#D7E6DA" }}
        >
          <span>Age groups assigned</span>
          <b>{ageStats.filled} of {ageStats.total}</b>
        </div>
      </div>
    </div>
  );
}
