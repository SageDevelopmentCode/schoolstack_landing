"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Check, Search } from "lucide-react";
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
};

type BroadcastChipVariant = "program" | "classroom" | "grade";

const PROGRAMS_COLLAPSED_COUNT = 3;
const CLASSROOMS_COLLAPSED_COUNT = 3;
const GRADES_COLLAPSED_COUNT = 5;

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

function chipStyle(theme: ParentThemeTokens, variant: BroadcastChipVariant, selected: boolean) {
  if (selected) {
    switch (variant) {
      case "program":
        return {
          borderColor: theme.primary,
          backgroundColor: theme.primarySoft,
          color: theme.primary,
        };
      case "classroom":
        return {
          borderColor: theme.sky,
          backgroundColor: theme.infoBg,
          color: theme.ink,
        };
      case "grade":
        return {
          borderColor: theme.sun,
          backgroundColor: theme.warningBg,
          color: theme.ink,
        };
    }
  }

  return {
    borderColor: theme.line,
    backgroundColor: theme.white,
    color: theme.ink,
  };
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
  variant,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  theme: ParentThemeTokens;
  variant: BroadcastChipVariant;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer"
      style={chipStyle(theme, variant, selected)}
    >
      {label}
    </button>
  );
}

function CollapsibleChipRow<T>({
  items,
  collapsedCount,
  selectedIds,
  expanded,
  onExpandedChange,
  getKey,
  getLabel,
  onToggle,
  showMoreLabel,
  showFewerLabel,
  variant,
  theme,
}: {
  items: T[];
  collapsedCount: number;
  selectedIds: string[];
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onToggle: (id: string) => void;
  showMoreLabel: string;
  showFewerLabel: string;
  variant: BroadcastChipVariant;
  theme: ParentThemeTokens;
}) {
  const visibleItems = expanded ? items : items.slice(0, collapsedCount);
  const canCollapse = items.length > collapsedCount;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {visibleItems.map((item) => {
          const id = getKey(item);
          return (
            <SelectableChip
              key={id}
              label={getLabel(item)}
              selected={selectedIds.includes(id)}
              onClick={() => onToggle(id)}
              theme={theme}
              variant={variant}
            />
          );
        })}
      </div>
      {canCollapse ? (
        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          className="mt-2 text-xs font-medium underline-offset-2 hover:underline cursor-pointer"
          style={{ color: theme.muted }}
        >
          {expanded ? showFewerLabel : showMoreLabel}
        </button>
      ) : null}
    </>
  );
}

function useAutoExpandWhenHiddenSelected(
  selectedIds: string[],
  collapsedIds: string[],
  onExpand: () => void,
) {
  const hasHiddenSelection = useMemo(
    () => selectedIds.some((id) => !collapsedIds.includes(id)),
    [collapsedIds, selectedIds],
  );

  useEffect(() => {
    if (hasHiddenSelection) {
      onExpand();
    }
  }, [hasHiddenSelection, onExpand]);
}

function ParentSelectIndicator({
  selected,
  theme,
}: {
  selected: boolean;
  theme: ParentThemeTokens;
}) {
  return (
    <span
      aria-hidden
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
      style={{
        borderColor: selected ? theme.primary : theme.line,
        backgroundColor: selected ? theme.primary : "transparent",
      }}
    >
      {selected ? <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden /> : null}
    </span>
  );
}

function ParentSelectRow({
  contact,
  selected,
  onToggle,
  theme,
  C,
}: {
  contact: MessageContact;
  selected: boolean;
  onToggle: () => void;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
}) {
  const focusRing = { "--tw-ring-color": `${theme.primary}40` } as CSSProperties;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 cursor-pointer"
      style={
        selected
          ? {
              backgroundColor: theme.primarySoft,
              borderColor: theme.primary,
              ...focusRing,
            }
          : {
              backgroundColor: theme.white,
              borderColor: theme.line,
              ...focusRing,
            }
      }
    >
      <ParentSelectIndicator selected={selected} theme={theme} />
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
}

export default function AdminMessagesAudiencePicker({
  theme,
  C,
  audience,
  onAudienceChange,
  programs,
  classrooms,
  parentContacts,
}: AdminMessagesAudiencePickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [programsExpanded, setProgramsExpanded] = useState(false);
  const [classroomsExpanded, setClassroomsExpanded] = useState(false);
  const [gradesExpanded, setGradesExpanded] = useState(false);

  const collapsedProgramIds = useMemo(
    () => programs.slice(0, PROGRAMS_COLLAPSED_COUNT).map((program) => program.id),
    [programs],
  );

  const collapsedClassroomIds = useMemo(
    () => classrooms.slice(0, CLASSROOMS_COLLAPSED_COUNT).map((classroom) => classroom.id),
    [classrooms],
  );

  const collapsedGradeValues = useMemo(
    () => STUDENT_GRADE_OPTIONS.slice(0, GRADES_COLLAPSED_COUNT).map((grade) => grade.value),
    [],
  );

  useAutoExpandWhenHiddenSelected(
    audience.programIds,
    collapsedProgramIds,
    () => setProgramsExpanded(true),
  );

  useAutoExpandWhenHiddenSelected(
    audience.classroomIds,
    collapsedClassroomIds,
    () => setClassroomsExpanded(true),
  );

  useAutoExpandWhenHiddenSelected(
    audience.gradeValues,
    collapsedGradeValues,
    () => setGradesExpanded(true),
  );

  const filteredParents = useMemo(
    () => filterContactsForPicker(parentContacts, "parents", searchQuery),
    [parentContacts, searchQuery],
  );

  const updateAudience = (patch: Partial<AdminBroadcastAudienceState>) => {
    onAudienceChange({ ...audience, ...patch });
  };

  return (
    <div className="space-y-5">
      <FilterSection title="Program" theme={theme}>
        {programs.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            No programs available.
          </p>
        ) : (
          <CollapsibleChipRow
            items={programs}
            collapsedCount={PROGRAMS_COLLAPSED_COUNT}
            selectedIds={audience.programIds}
            expanded={programsExpanded}
            onExpandedChange={setProgramsExpanded}
            getKey={(program) => program.id}
            getLabel={(program) => program.name}
            onToggle={(id) =>
              updateAudience({ programIds: toggleValue(audience.programIds, id) })
            }
            showMoreLabel="Show more programs"
            showFewerLabel="Show fewer programs"
            variant="program"
            theme={theme}
          />
        )}
      </FilterSection>

      <FilterSection title="Class / group" theme={theme}>
        {classrooms.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            No classes available.
          </p>
        ) : (
          <CollapsibleChipRow
            items={classrooms}
            collapsedCount={CLASSROOMS_COLLAPSED_COUNT}
            selectedIds={audience.classroomIds}
            expanded={classroomsExpanded}
            onExpandedChange={setClassroomsExpanded}
            getKey={(classroom) => classroom.id}
            getLabel={(classroom) =>
              classroom.programName
                ? `${classroom.name} · ${classroom.programName}`
                : classroom.name
            }
            onToggle={(id) =>
              updateAudience({ classroomIds: toggleValue(audience.classroomIds, id) })
            }
            showMoreLabel="Show more classes"
            showFewerLabel="Show fewer classes"
            variant="classroom"
            theme={theme}
          />
        )}
      </FilterSection>

      <FilterSection title="Grade" theme={theme}>
        <CollapsibleChipRow
          items={STUDENT_GRADE_OPTIONS}
          collapsedCount={GRADES_COLLAPSED_COUNT}
          selectedIds={audience.gradeValues}
          expanded={gradesExpanded}
          onExpandedChange={setGradesExpanded}
          getKey={(grade) => grade.value}
          getLabel={(grade) => grade.label}
          onToggle={(value) =>
            updateAudience({ gradeValues: toggleValue(audience.gradeValues, value) })
          }
          showMoreLabel="Show more grades"
          showFewerLabel="Show fewer grades"
          variant="grade"
          theme={theme}
        />
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

        <div className="max-h-48 space-y-2 overflow-y-auto pr-0.5">
          {filteredParents.length === 0 ? (
            <p className="py-6 text-center text-sm" style={{ color: theme.muted }}>
              No parents match this search.
            </p>
          ) : (
            filteredParents.map((contact) => {
              const selected =
                contact.guardianId != null &&
                audience.guardianIds.includes(contact.guardianId);
              return (
                <ParentSelectRow
                  key={contact.key}
                  contact={contact}
                  selected={selected}
                  onToggle={() => {
                    if (!contact.guardianId) return;
                    updateAudience({
                      guardianIds: toggleValue(audience.guardianIds, contact.guardianId),
                    });
                  }}
                  theme={theme}
                  C={C}
                />
              );
            })
          )}
        </div>
      </FilterSection>
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
