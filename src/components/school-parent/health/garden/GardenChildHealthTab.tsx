"use client";

import type { ReactNode } from "react";
import { HeartPulse, MessageSquareText, Pencil, Pill, Plus, ShieldAlert } from "lucide-react";
import {
  GChip,
  GIcon,
  GSkeleton,
  gBtnPopSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import GardenHealthFormPanel from "@/components/school-parent/health/garden/GardenHealthFormPanel";
import type {
  HealthAllergyItem,
  HealthItemAddedBy,
  HealthMedicationItem,
  HealthUpdateItem,
} from "@/components/school-parent/health/parent-health-types";
import {
  formatHealthDate,
  formatMedicationSchedule,
  medicationStatusLabel,
  medicationStatusTone,
  severityChipTone,
  SEVERITY_LABELS,
} from "@/components/school-parent/health/parent-health-types";
import type { StudentHealthTabModel } from "@/components/school-parent/health/useStudentHealthTab";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

/*
 * Parent Health tab (Garden): intro + one primary "Add item", then allergies,
 * medication and updates as small sections with counts, rows and add links.
 * Data behaviour comes from useStudentHealthTab (shared with staff portals).
 */

function AddedByChip({ addedBy }: { addedBy: HealthItemAddedBy }) {
  return <GChip tone={addedBy === "parent" ? "info" : "success"}>{addedBy === "parent" ? "Parent" : "School"}</GChip>;
}

function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`${gLinkSm} shrink-0 px-1 py-1`} aria-label={label}>
      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      Edit
    </button>
  );
}

function ItemRow({
  testId,
  title,
  chips,
  body,
  meta,
  edit,
}: {
  testId: string;
  title: string;
  chips: ReactNode;
  body?: ReactNode;
  meta?: ReactNode;
  edit?: ReactNode;
}) {
  return (
    <li
      data-testid={testId}
      className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-4 py-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">{title}</h4>
            {chips}
          </div>
          {body ? <p className="m-0 mt-1.5 text-[13px] font-semibold leading-relaxed text-[var(--sf-ink)]/70">{body}</p> : null}
          {meta ? <p className="m-0 mt-1.5 text-xs font-semibold text-[var(--sf-soft)]">{meta}</p> : null}
        </div>
        {edit}
      </div>
    </li>
  );
}

function HealthSection({
  testId,
  icon,
  title,
  count,
  emptyText,
  addLabel,
  onAdd,
  readOnly,
  children,
}: {
  testId: string;
  icon: ReactNode;
  title: string;
  count: number;
  emptyText: string;
  addLabel: string;
  onAdd: () => void;
  readOnly: boolean;
  children: ReactNode;
}) {
  return (
    <section
      data-testid={testId}
      className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4 sm:p-5"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <GIcon size="sm">{icon}</GIcon>
          <h3 className="m-0 text-[16px] font-extrabold text-[var(--sf-ink)]">{title}</h3>
          <GChip tone={count > 0 ? "info" : "neutral"}>{count}</GChip>
        </div>
        {!readOnly ? (
          <button type="button" className={gLinkSm} onClick={onAdd}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {addLabel}
          </button>
        ) : null}
      </div>
      {count === 0 ? (
        <p className="m-0 rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-white/60 px-4 py-3.5 text-[13px] font-semibold text-[var(--sf-soft)]">
          {emptyText}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">{children}</ul>
      )}
    </section>
  );
}

export default function GardenChildHealthTab({
  theme,
  adminCompat,
  studentFirstName,
  readOnly,
  health,
}: {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  studentFirstName: string;
  readOnly: boolean;
  health: StudentHealthTabModel;
}) {
  const {
    profile,
    loading,
    saving,
    formState,
    sortedUpdates,
    activeItemCount,
    openCreateForm,
    openEditAllergy,
    openEditMedication,
    openEditUpdate,
    closeForm,
    handleSave,
    handleDelete,
    sidebarOpen,
    sidebarMode,
    sidebarItemType,
    sidebarInitialValues,
  } = health;

  return (
    <div className="flex flex-col gap-4" data-testid="parent-child-health-tab">
      <div className="flex flex-col gap-4 rounded-[18px] bg-[var(--sf-accent-wash)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <GIcon size="md">
            <HeartPulse />
          </GIcon>
          <div className="min-w-0">
            <h3 className="m-0 text-[17px] font-extrabold text-[var(--sf-ink)]">
              {studentFirstName}&apos;s health profile
            </h3>
            <p className="m-0 mt-0.5 text-[13px] font-semibold leading-relaxed text-[var(--sf-ink)]/70">
              Teachers and the school office are notified when you share updates here.
              {activeItemCount > 0 ? ` ${activeItemCount} items on file.` : null}
            </p>
          </div>
        </div>
        {!readOnly ? (
          <button
            type="button"
            className={`${gBtnPopSm} shrink-0 self-start whitespace-nowrap sm:self-center`}
            onClick={() => openCreateForm("allergy")}
            data-testid="parent-health-add-item"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading health profile">
          <GSkeleton className="h-28 !rounded-[18px]" />
          <GSkeleton className="h-28 !rounded-[18px]" />
          <GSkeleton className="h-28 !rounded-[18px]" />
        </div>
      ) : (
        <>
          <HealthSection
            testId="parent-health-allergies-section"
            icon={<ShieldAlert />}
            title="Food allergies (standing)"
            count={profile.allergies.length}
            emptyText="No allergies on file — add one so teachers know."
            addLabel="Add allergy"
            onAdd={() => openCreateForm("allergy")}
            readOnly={readOnly}
          >
            {profile.allergies.map((item: HealthAllergyItem) => (
              <ItemRow
                key={item.id}
                testId={`parent-health-allergy-${item.id}`}
                title={item.allergen}
                chips={
                  <>
                    <GChip tone={severityChipTone(item.severity)}>{SEVERITY_LABELS[item.severity]}</GChip>
                    <AddedByChip addedBy={item.addedBy} />
                  </>
                }
                body={item.treatmentNotes || undefined}
                meta={`Updated ${formatHealthDate(item.updatedAt)}`}
                edit={
                  !readOnly ? (
                    <EditButton label={`Edit ${item.allergen} allergy`} onClick={() => openEditAllergy(item)} />
                  ) : null
                }
              />
            ))}
          </HealthSection>

          <HealthSection
            testId="parent-health-medications-section"
            icon={<Pill />}
            title="Medication at school"
            count={profile.medications.length}
            emptyText="No medications scheduled at school right now."
            addLabel="Add medication"
            onAdd={() => openCreateForm("medication")}
            readOnly={readOnly}
          >
            {profile.medications.map((item: HealthMedicationItem) => (
              <ItemRow
                key={item.id}
                testId={`parent-health-medication-${item.id}`}
                title={item.name}
                chips={
                  <>
                    <GChip tone={medicationStatusTone(item)}>{medicationStatusLabel(item)}</GChip>
                    <AddedByChip addedBy={item.addedBy} />
                  </>
                }
                body={formatMedicationSchedule(item)}
                edit={
                  !readOnly ? (
                    <EditButton label={`Edit ${item.name} medication`} onClick={() => openEditMedication(item)} />
                  ) : null
                }
              />
            ))}
          </HealthSection>

          <HealthSection
            testId="parent-health-updates-section"
            icon={<MessageSquareText />}
            title="Recent updates"
            count={sortedUpdates.length}
            emptyText="Share a quick update when something changes — illness, injury clearance, or temporary care needs."
            addLabel="Share an update"
            onAdd={() => openCreateForm("update")}
            readOnly={readOnly}
          >
            {sortedUpdates.map((item: HealthUpdateItem) => (
              <ItemRow
                key={item.id}
                testId={`parent-health-update-${item.id}`}
                title={item.title}
                chips={<AddedByChip addedBy={item.addedBy} />}
                body={item.details || undefined}
                meta={
                  <>
                    {formatHealthDate(item.createdAt)}
                    {item.endDate && item.endDate !== item.startDate
                      ? ` · Through ${formatHealthDate(item.endDate)}`
                      : null}
                  </>
                }
                edit={
                  !readOnly ? (
                    <EditButton label={`Edit ${item.title} update`} onClick={() => openEditUpdate(item)} />
                  ) : null
                }
              />
            ))}
          </HealthSection>
        </>
      )}

      <GardenHealthFormPanel
        theme={theme}
        adminCompat={adminCompat}
        open={sidebarOpen}
        mode={sidebarMode}
        itemType={sidebarItemType}
        initialValues={sidebarInitialValues}
        readOnly={readOnly}
        saving={saving}
        studentFirstName={studentFirstName}
        onClose={closeForm}
        onSave={handleSave}
        onDelete={formState.mode === "edit" ? handleDelete : undefined}
      />
    </div>
  );
}
