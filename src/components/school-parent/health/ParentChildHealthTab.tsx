"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { getMockStudentHealthProfile } from "@/components/school-parent/health/mock-student-health-data";
import type { HealthFormValues } from "@/components/school-parent/health/ParentHealthFormPanel";
import ParentHealthFormSidebar from "@/components/school-parent/health/ParentHealthFormSidebar";
import ParentHealthItemCard from "@/components/school-parent/health/ParentHealthItemCard";
import type {
  HealthAllergyItem,
  HealthItemType,
  HealthMedicationItem,
  HealthUpdateItem,
  StudentHealthProfile,
} from "@/components/school-parent/health/parent-health-types";
import { createHealthItemId } from "@/components/school-parent/health/parent-health-types";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import { parentToast } from "@/lib/school-parent/parent-toast";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentChildHealthTabProps = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  studentId: string;
  studentFirstName: string;
  readOnly?: boolean;
};

type FormState =
  | { mode: "closed" }
  | {
      mode: "create";
      itemType: HealthItemType;
    }
  | {
      mode: "edit";
      itemType: HealthItemType;
      itemId: string;
      values: HealthFormValues;
    };

function sortUpdates(items: HealthUpdateItem[]): HealthUpdateItem[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default function ParentChildHealthTab({
  theme,
  adminCompat,
  studentId,
  studentFirstName,
  readOnly = false,
}: ParentChildHealthTabProps) {
  const [profile, setProfile] = useState<StudentHealthProfile>(() =>
    getMockStudentHealthProfile(studentId),
  );
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [saving, setSaving] = useState(false);

  const sortedUpdates = useMemo(() => sortUpdates(profile.updates), [profile.updates]);

  const openCreateForm = useCallback(
    (itemType: HealthItemType) => {
      if (readOnly) return;
      setFormState({ mode: "create", itemType });
    },
    [readOnly],
  );

  const openEditAllergy = useCallback(
    (item: HealthAllergyItem) => {
      if (readOnly) return;
      setFormState({
        mode: "edit",
        itemType: "allergy",
        itemId: item.id,
        values: {
          allergen: item.allergen,
          severity: item.severity,
          treatmentNotes: item.treatmentNotes,
          updatedAt: item.updatedAt,
        },
      });
    },
    [readOnly],
  );

  const openEditMedication = useCallback(
    (item: HealthMedicationItem) => {
      if (readOnly) return;
      setFormState({
        mode: "edit",
        itemType: "medication",
        itemId: item.id,
        values: {
          name: item.name,
          dose: item.dose,
          timeOfDay: item.timeOfDay,
          daysOfWeek: [...item.daysOfWeek],
          instructions: item.instructions,
          startDate: item.startDate,
          endDate: item.endDate,
          ongoing: item.ongoing,
          updatedAt: item.updatedAt,
        },
      });
    },
    [readOnly],
  );

  const openEditUpdate = useCallback(
    (item: HealthUpdateItem) => {
      if (readOnly) return;
      setFormState({
        mode: "edit",
        itemType: "update",
        itemId: item.id,
        values: {
          title: item.title,
          details: item.details,
          startDate: item.startDate,
          endDate: item.endDate,
          createdAt: item.createdAt,
        },
      });
    },
    [readOnly],
  );

  const closeForm = useCallback(() => {
    setFormState({ mode: "closed" });
  }, []);

  const handleSave = useCallback(
    async (itemType: HealthItemType, values: HealthFormValues) => {
      if (readOnly) return;

      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 350));

      setProfile((prev) => {
        if (formState.mode === "edit") {
          if (itemType === "allergy" && "allergen" in values) {
            return {
              ...prev,
              allergies: prev.allergies.map((item) =>
                item.id === formState.itemId
                  ? { ...item, ...values, type: "allergy" as const }
                  : item,
              ),
            };
          }
          if (itemType === "medication" && "name" in values && "timeOfDay" in values) {
            return {
              ...prev,
              medications: prev.medications.map((item) =>
                item.id === formState.itemId
                  ? { ...item, ...values, type: "medication" as const }
                  : item,
              ),
            };
          }
          if (itemType === "update" && "title" in values) {
            return {
              ...prev,
              updates: prev.updates.map((item) =>
                item.id === formState.itemId
                  ? { ...item, ...values, type: "update" as const }
                  : item,
              ),
            };
          }
          return prev;
        }

        if (itemType === "allergy" && "allergen" in values) {
          const nextItem: HealthAllergyItem = {
            id: createHealthItemId("allergy"),
            type: "allergy",
            ...values,
          };
          return { ...prev, allergies: [...prev.allergies, nextItem] };
        }
        if (itemType === "medication" && "name" in values && "timeOfDay" in values) {
          const nextItem: HealthMedicationItem = {
            id: createHealthItemId("medication"),
            type: "medication",
            ...values,
          };
          return { ...prev, medications: [...prev.medications, nextItem] };
        }
        if (itemType === "update" && "title" in values) {
          const nextItem: HealthUpdateItem = {
            id: createHealthItemId("update"),
            type: "update",
            ...values,
          };
          return { ...prev, updates: [nextItem, ...prev.updates] };
        }
        return prev;
      });

      parentToast.success("Update saved. Teachers and the school office will be notified.");
      setSaving(false);
      setFormState({ mode: "closed" });
    },
    [formState, readOnly],
  );

  const handleDelete = useCallback(async () => {
    if (readOnly || formState.mode !== "edit") return;

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    setProfile((prev) => {
      if (formState.itemType === "allergy") {
        return {
          ...prev,
          allergies: prev.allergies.filter((item) => item.id !== formState.itemId),
        };
      }
      if (formState.itemType === "medication") {
        return {
          ...prev,
          medications: prev.medications.filter((item) => item.id !== formState.itemId),
        };
      }
      return {
        ...prev,
        updates: prev.updates.filter((item) => item.id !== formState.itemId),
      };
    });

    parentToast.success("Health item removed.");
    setSaving(false);
    setFormState({ mode: "closed" });
  }, [formState, readOnly]);

  const activeItemCount =
    profile.allergies.length + profile.medications.length + profile.updates.length;

  const sidebarOpen = formState.mode !== "closed";
  const sidebarMode = formState.mode === "edit" ? "edit" : "create";
  const sidebarItemType = formState.mode === "closed" ? "allergy" : formState.itemType;
  const sidebarInitialValues = formState.mode === "edit" ? formState.values : null;

  return (
    <div className="space-y-5" data-testid="parent-child-health-tab">
      <div
        className="flex flex-col gap-4 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        style={{ borderColor: theme.line, backgroundColor: theme.white }}
      >
        <div>
          <ParentSectionKicker theme={theme}>Health & wellness</ParentSectionKicker>
          <ParentDisplayHeading theme={theme} as="h3" size="section" className="!mt-2 !text-[1.05rem]">
            {studentFirstName}&apos;s health profile
          </ParentDisplayHeading>
          <p className="m-0 mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
            Teachers and the school office are notified when you share updates here.
            {activeItemCount > 0 ? ` ${activeItemCount} items on file.` : null}
          </p>
        </div>
        {!readOnly ? (
          <ParentButton
            theme={theme}
            variant="primary"
            onClick={() => openCreateForm("allergy")}
            className="inline-flex items-center gap-1.5 self-start"
            data-testid="parent-health-add-item"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add item
          </ParentButton>
        ) : null}
      </div>

      <section className="space-y-3" data-testid="parent-health-allergies-section">
        <ParentSectionKicker theme={theme}>Food allergies (standing)</ParentSectionKicker>
        {profile.allergies.length === 0 ? (
          <div
            className="rounded-2xl border px-4 py-4 text-xs"
            style={{ borderColor: theme.line, backgroundColor: theme.white, color: theme.muted }}
          >
            No allergies on file — add one so teachers know.
          </div>
        ) : (
          profile.allergies.map((item) => (
            <ParentHealthItemCard
              key={item.id}
              theme={theme}
              item={item}
              readOnly={readOnly}
              onEdit={() => openEditAllergy(item)}
            />
          ))
        )}
        {!readOnly ? (
          <ParentTextLink theme={theme} onClick={() => openCreateForm("allergy")}>
            Add allergy
          </ParentTextLink>
        ) : null}
      </section>

      <section className="space-y-3" data-testid="parent-health-medications-section">
        <ParentSectionKicker theme={theme}>Medication at school</ParentSectionKicker>
        {profile.medications.length === 0 ? (
          <div
            className="rounded-2xl border px-4 py-4 text-xs"
            style={{ borderColor: theme.line, backgroundColor: theme.white, color: theme.muted }}
          >
            No medications scheduled at school right now.
          </div>
        ) : (
          profile.medications.map((item) => (
            <ParentHealthItemCard
              key={item.id}
              theme={theme}
              item={item}
              readOnly={readOnly}
              onEdit={() => openEditMedication(item)}
            />
          ))
        )}
        {!readOnly ? (
          <ParentTextLink theme={theme} onClick={() => openCreateForm("medication")}>
            Add medication
          </ParentTextLink>
        ) : null}
      </section>

      <section className="space-y-3" data-testid="parent-health-updates-section">
        <ParentSectionKicker theme={theme}>Recent updates</ParentSectionKicker>
        {sortedUpdates.length === 0 ? (
          <div
            className="rounded-2xl border px-4 py-4 text-xs"
            style={{ borderColor: theme.line, backgroundColor: theme.white, color: theme.muted }}
          >
            Share a quick update when something changes — illness, injury clearance, or temporary
            care needs.
          </div>
        ) : (
          sortedUpdates.map((item) => (
            <ParentHealthItemCard
              key={item.id}
              theme={theme}
              item={item}
              readOnly={readOnly}
              onEdit={() => openEditUpdate(item)}
            />
          ))
        )}
        {!readOnly ? (
          <ParentTextLink theme={theme} onClick={() => openCreateForm("update")}>
            Share an update
          </ParentTextLink>
        ) : null}
      </section>

      <ParentHealthFormSidebar
        theme={theme}
        adminCompat={adminCompat}
        open={sidebarOpen}
        mode={sidebarMode}
        itemType={sidebarItemType}
        initialValues={sidebarInitialValues}
        readOnly={readOnly}
        saving={saving}
        onClose={closeForm}
        onSave={handleSave}
        onDelete={formState.mode === "edit" ? handleDelete : undefined}
      />
    </div>
  );
}

export { getMockStudentHealthProfile };
