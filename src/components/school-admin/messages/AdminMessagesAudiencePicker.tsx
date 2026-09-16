"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { STUDENT_GRADE_OPTIONS } from "@/lib/admissions/apply-system-fields";
import { filterContactsForPicker } from "@/lib/messages/contact-filters";
import type { MessageContact } from "@/lib/messages/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import MessagesAvatar from "@/components/messages/MessagesAvatar";
import MessageStudentSubtitle from "@/components/messages/MessageStudentSubtitle";

export type AdminBroadcastAudienceState = {
  programIds: string[];
  classroomIds: string[];
  gradeValues: string[];
  guardianIds: string[];
};

export type AdminBroadcastOptionProgram = {
  id: string;
  name: string;
};

export type AdminBroadcastOptionClassroom = {
  id: string;
  name: string;
  programId: string | null;
  programName: string | null;
};

type AdminMessagesAudiencePickerProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  audience: AdminBroadcastAudienceState;
  onAudienceChange: (next: AdminBroadcastAudienceState) => void;
  programs: AdminBroadcastOptionProgram[];
  classrooms: AdminBroadcastOptionClassroom[];
  parentContacts: MessageContact[];
  previewCount: number;
  previewSampleNames: string[];
  previewLoading: boolean;
  previewExceedsLimit: boolean;
};

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

function FilterSection({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: ParentThemeTokens;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function SelectableChip({
  label,
  selected,
  onClick,
  theme,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  theme: ParentThemeTokens;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer"
      style={{
        borderColor: selected ? theme.primary : theme.line,
        backgroundColor: selected ? "#E8F2E9" : theme.white,
        color: selected ? theme.primary : theme.ink,
      }}
    >
      {label}
    </button>
  );
}

export default function AdminMessagesAudiencePicker({
  theme,
  C,
  audience,
  onAudienceChange,
  programs,
  classrooms,
  parentContacts,
  previewCount,
  previewSampleNames,
  previewLoading,
  previewExceedsLimit,
}: AdminMessagesAudiencePickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredParents = useMemo(
    () => filterContactsForPicker(parentContacts, "parents", searchQuery),
    [parentContacts, searchQuery],
  );

  const updateAudience = (patch: Partial<AdminBroadcastAudienceState>) => {
    onAudienceChange({ ...audience, ...patch });
  };

  const previewLabel = previewLoading
    ? "Calculating recipients…"
    : previewCount === 0
      ? "No parents selected yet"
      : previewExceedsLimit
        ? `${previewCount} parents selected (limit is 200)`
        : `${previewCount} parent${previewCount === 1 ? "" : "s"} selected`;

  return (
    <div className="space-y-5">
      <FilterSection title="Program" theme={theme}>
        {programs.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            No programs available.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {programs.map((program) => (
              <SelectableChip
                key={program.id}
                label={program.name}
                selected={audience.programIds.includes(program.id)}
                onClick={() =>
                  updateAudience({
                    programIds: toggleValue(audience.programIds, program.id),
                  })
                }
                theme={theme}
              />
            ))}
          </div>
        )}
      </FilterSection>

      <FilterSection title="Class / group" theme={theme}>
        {classrooms.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            No classes available.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {classrooms.map((classroom) => {
              const label = classroom.programName
                ? `${classroom.name} · ${classroom.programName}`
                : classroom.name;
              return (
                <SelectableChip
                  key={classroom.id}
                  label={label}
                  selected={audience.classroomIds.includes(classroom.id)}
                  onClick={() =>
                    updateAudience({
                      classroomIds: toggleValue(audience.classroomIds, classroom.id),
                    })
                  }
                  theme={theme}
                />
              );
            })}
          </div>
        )}
      </FilterSection>

      <FilterSection title="Grade" theme={theme}>
        <div className="flex flex-wrap gap-2">
          {STUDENT_GRADE_OPTIONS.map((grade) => (
            <SelectableChip
              key={grade.value}
              label={grade.label}
              selected={audience.gradeValues.includes(grade.value)}
              onClick={() =>
                updateAudience({
                  gradeValues: toggleValue(audience.gradeValues, grade.value),
                })
              }
              theme={theme}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Individual parents" theme={theme}>
        <div className="relative mb-3">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: theme.muted }}
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search parents"
            className="w-full rounded-full border py-2 pl-9 pr-3 text-[16px] outline-none transition-colors focus:ring-1 sm:text-[13px]"
            style={{
              backgroundColor: "#F4F7F5",
              borderColor: theme.line,
              color: theme.ink,
            }}
          />
        </div>

        <div
          className="max-h-48 overflow-y-auto rounded-xl border"
          style={{ borderColor: theme.line }}
        >
          {filteredParents.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm" style={{ color: theme.muted }}>
              No parents match this search.
            </p>
          ) : (
            filteredParents.map((contact) => {
              const selected =
                contact.guardianId != null &&
                audience.guardianIds.includes(contact.guardianId);
              return (
                <button
                  key={contact.key}
                  type="button"
                  onClick={() => {
                    if (!contact.guardianId) return;
                    updateAudience({
                      guardianIds: toggleValue(audience.guardianIds, contact.guardianId),
                    });
                  }}
                  className="flex w-full items-center gap-3 border-b px-4 py-3 text-left cursor-pointer transition hover:bg-black/[0.02]"
                  style={{
                    borderColor: theme.line,
                    backgroundColor: selected ? "#F4F7F5" : theme.white,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    className="h-4 w-4 shrink-0 accent-[#346A4E]"
                    aria-hidden
                  />
                  <MessagesAvatar
                    name={contact.name}
                    color={contact.color}
                    photoUrl={contact.profilePhotoUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: theme.ink }}>
                      {contact.name}
                    </p>
                    <MessageStudentSubtitle
                      students={contact.subtitleStudents}
                      subtitle={contact.subtitle}
                      C={C}
                      truncate
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </FilterSection>

      <div
        className="rounded-xl border px-4 py-3"
        style={{
          borderColor: previewExceedsLimit ? theme.warning : theme.line,
          backgroundColor: previewExceedsLimit ? theme.warningBg : "#F4F7F5",
        }}
      >
        <p
          className="text-sm font-medium"
          style={{ color: previewExceedsLimit ? theme.warning : theme.ink }}
        >
          {previewLabel}
        </p>
        {previewSampleNames.length > 0 ? (
          <p className="mt-1 text-xs" style={{ color: theme.muted }}>
            {previewSampleNames.join(", ")}
            {previewCount > previewSampleNames.length ? "…" : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function emptyAdminBroadcastAudience(): AdminBroadcastAudienceState {
  return {
    programIds: [],
    classroomIds: [],
    gradeValues: [],
    guardianIds: [],
  };
}

export function hasAdminBroadcastAudienceSelection(
  audience: AdminBroadcastAudienceState,
): boolean {
  return (
    audience.programIds.length > 0 ||
    audience.classroomIds.length > 0 ||
    audience.gradeValues.length > 0 ||
    audience.guardianIds.length > 0
  );
}
