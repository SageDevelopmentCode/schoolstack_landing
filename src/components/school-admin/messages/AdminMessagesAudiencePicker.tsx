"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Search } from "lucide-react";
import { STUDENT_GRADE_OPTIONS } from "@/lib/admissions/apply-system-fields";
import { filterContactsForPicker } from "@/lib/messages/contact-filters";
import type { MessageContact } from "@/lib/messages/types";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import MessagesAvatar from "@/components/messages/MessagesAvatar";
import MessageStudentSubtitle from "@/components/messages/MessageStudentSubtitle";
import { GKicker, G_FOCUS, gLinkSm } from "@/components/school-parent/garden/ui";

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
  C: AdminThemeTokens;
  audience: AdminBroadcastAudienceState;
  onAudienceChange: (next: AdminBroadcastAudienceState) => void;
  programs: AdminBroadcastOptionProgram[];
  classrooms: AdminBroadcastOptionClassroom[];
  parentContacts: MessageContact[];
};

const PROGRAMS_COLLAPSED_COUNT = 3;
const CLASSROOMS_COLLAPSED_COUNT = 3;
const GRADES_COLLAPSED_COUNT = 5;

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

function FilterSection({
  title,
  selectedCount,
  onClear,
  children,
}: {
  title: string;
  selectedCount: number;
  onClear: () => void;
  children: ReactNode;
}) {
  return (
    <section aria-label={title}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <GKicker>
          {title}
          {selectedCount > 0 ? (
            <span className="ml-1.5 tabular-nums text-[var(--sf-clay-deep)]">· {selectedCount} selected</span>
          ) : null}
        </GKicker>
        {selectedCount > 0 ? (
          <button type="button" className={`${gLinkSm} !text-[12px]`} onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SelectableChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 text-[13px] font-extrabold transition-all ${
        selected
          ? "border-[var(--sf-ink)] bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)] shadow-[0_2px_0_0_rgba(43,36,29,0.12)]"
          : "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/80 hover:border-[var(--sf-ink)]/40"
      } ${G_FOCUS} focus-visible:ring-offset-0`}
    >
      {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
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
            />
          );
        })}
      </div>
      {canCollapse ? (
        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          className={`${gLinkSm} mt-2 !text-[12.5px]`}
          aria-expanded={expanded}
        >
          {expanded ? showFewerLabel : `${showMoreLabel} (${items.length - collapsedCount})`}
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

function ParentSelectRow({
  contact,
  selected,
  onToggle,
  C,
}: {
  contact: MessageContact;
  selected: boolean;
  onToggle: () => void;
  C: AdminThemeTokens;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-[14px] border-[1.5px] px-3 py-2.5 text-left transition-colors ${
        selected
          ? "border-[var(--sf-clay)]/45 bg-[var(--sf-accent-wash)]"
          : "border-[var(--sf-ink)]/10 bg-white hover:bg-[var(--sf-ink)]/[0.03]"
      } ${G_FOCUS} focus-visible:ring-offset-0`}
    >
      <span
        aria-hidden
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] ${
          selected ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white" : "border-[var(--sf-ink)]/25 bg-white"
        }`}
      >
        {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
      </span>
      <MessagesAvatar
        name={contact.name}
        color={contact.color}
        photoUrl={contact.profilePhotoUrl}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{contact.name}</p>
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

/**
 * Step 1 of Bulk message (Garden): programs, classes, grades and individual
 * parents. Choices combine; each parent receives the message once.
 */
export default function AdminMessagesAudiencePicker({
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
  const expandPrograms = useCallback(() => setProgramsExpanded(true), []);
  const expandClassrooms = useCallback(() => setClassroomsExpanded(true), []);
  const expandGrades = useCallback(() => setGradesExpanded(true), []);

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

  useAutoExpandWhenHiddenSelected(audience.programIds, collapsedProgramIds, expandPrograms);
  useAutoExpandWhenHiddenSelected(audience.classroomIds, collapsedClassroomIds, expandClassrooms);
  useAutoExpandWhenHiddenSelected(audience.gradeValues, collapsedGradeValues, expandGrades);

  const filteredParents = useMemo(
    () => filterContactsForPicker(parentContacts, "parents", searchQuery),
    [parentContacts, searchQuery],
  );

  const updateAudience = (patch: Partial<AdminBroadcastAudienceState>) => {
    onAudienceChange({ ...audience, ...patch });
  };

  return (
    <div className="space-y-5">
      <p className="sf-paper m-0 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/75">
        Mix any choices below. Everyone who matches gets the message once, privately, in their school
        office conversation.
      </p>

      <FilterSection
        title="Program"
        selectedCount={audience.programIds.length}
        onClear={() => updateAudience({ programIds: [] })}
      >
        {programs.length === 0 ? (
          <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">No programs available.</p>
        ) : (
          <CollapsibleChipRow
            items={programs}
            collapsedCount={PROGRAMS_COLLAPSED_COUNT}
            selectedIds={audience.programIds}
            expanded={programsExpanded}
            onExpandedChange={setProgramsExpanded}
            getKey={(program) => program.id}
            getLabel={(program) => program.name}
            onToggle={(id) => updateAudience({ programIds: toggleValue(audience.programIds, id) })}
            showMoreLabel="Show more programs"
            showFewerLabel="Show fewer programs"
          />
        )}
      </FilterSection>

      <FilterSection
        title="Class / group"
        selectedCount={audience.classroomIds.length}
        onClear={() => updateAudience({ classroomIds: [] })}
      >
        {classrooms.length === 0 ? (
          <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">No classes available.</p>
        ) : (
          <CollapsibleChipRow
            items={classrooms}
            collapsedCount={CLASSROOMS_COLLAPSED_COUNT}
            selectedIds={audience.classroomIds}
            expanded={classroomsExpanded}
            onExpandedChange={setClassroomsExpanded}
            getKey={(classroom) => classroom.id}
            getLabel={(classroom) =>
              classroom.programName ? `${classroom.name} · ${classroom.programName}` : classroom.name
            }
            onToggle={(id) => updateAudience({ classroomIds: toggleValue(audience.classroomIds, id) })}
            showMoreLabel="Show more classes"
            showFewerLabel="Show fewer classes"
          />
        )}
      </FilterSection>

      <FilterSection
        title="Grade"
        selectedCount={audience.gradeValues.length}
        onClear={() => updateAudience({ gradeValues: [] })}
      >
        <CollapsibleChipRow
          items={STUDENT_GRADE_OPTIONS}
          collapsedCount={GRADES_COLLAPSED_COUNT}
          selectedIds={audience.gradeValues}
          expanded={gradesExpanded}
          onExpandedChange={setGradesExpanded}
          getKey={(grade) => grade.value}
          getLabel={(grade) => grade.label}
          onToggle={(value) => updateAudience({ gradeValues: toggleValue(audience.gradeValues, value) })}
          showMoreLabel="Show more grades"
          showFewerLabel="Show fewer grades"
        />
      </FilterSection>

      <FilterSection
        title="Individual parents"
        selectedCount={audience.guardianIds.length}
        onClear={() => updateAudience({ guardianIds: [] })}
      >
        <div className="relative mb-3">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/45"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search parents"
            aria-label="Search parents"
            className="w-full rounded-full border-2 border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] py-2 pl-10 pr-4 text-[16px] font-semibold text-[var(--sf-ink)] outline-none placeholder:text-[var(--sf-ink)]/40 focus:border-[var(--sf-ink)] sm:text-sm"
          />
        </div>

        <div className="max-h-56 space-y-1.5 overflow-y-auto overscroll-contain pr-0.5">
          {filteredParents.length === 0 ? (
            <div className="py-5 text-center">
              <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
                {searchQuery.trim() ? "No parents match this search." : "No parents to show."}
              </p>
              {searchQuery.trim() ? (
                <button type="button" className={`${gLinkSm} mt-1.5`} onClick={() => setSearchQuery("")}>
                  Clear search
                </button>
              ) : null}
            </div>
          ) : (
            filteredParents.map((contact) => {
              const selected =
                contact.guardianId != null && audience.guardianIds.includes(contact.guardianId);
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
