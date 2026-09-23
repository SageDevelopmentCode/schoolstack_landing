"use client";

import { Bookmark, GraduationCap, Users, type LucideIcon } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  FORM_AUDIENCE_TYPE_LABELS,
  type TeacherFormAudienceType,
} from "@/lib/school-teacher/forms-documents/types";

const AUDIENCE_HELPERS: Record<TeacherFormAudienceType, string> = {
  unassigned: "Choose recipients when you send",
  classrooms: "All families in selected classes",
  families: "One or more families",
};

const AUDIENCE_ICONS: Record<TeacherFormAudienceType, LucideIcon> = {
  unassigned: Bookmark,
  classrooms: GraduationCap,
  families: Users,
};

type TeacherFormAudienceOptionTabsProps = {
  theme: ParentThemeTokens;
  options: TeacherFormAudienceType[];
  value: TeacherFormAudienceType;
  onChange: (mode: TeacherFormAudienceType) => void;
};

export default function TeacherFormAudienceOptionTabs({
  theme,
  options,
  value,
  onChange,
}: TeacherFormAudienceOptionTabsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {options.map((mode) => {
        const selected = value === mode;
        const Icon = AUDIENCE_ICONS[mode];
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className="flex min-h-[56px] cursor-pointer items-start gap-2.5 rounded-md border px-3 py-3 text-left transition-colors"
            style={
              selected
                ? {
                    backgroundColor: theme.primarySoft,
                    borderColor: theme.sage,
                    boxShadow: theme.shadowCard,
                  }
                : {
                    backgroundColor: theme.white,
                    borderColor: theme.line,
                  }
            }
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
              style={{
                backgroundColor: selected ? theme.white : theme.primarySoft,
                color: theme.primary,
              }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span
                className="block text-sm font-semibold"
                style={{ color: selected ? theme.primary : theme.ink }}
              >
                {FORM_AUDIENCE_TYPE_LABELS[mode]}
              </span>
              <span className="mt-0.5 block text-xs leading-snug" style={{ color: theme.muted }}>
                {AUDIENCE_HELPERS[mode]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
