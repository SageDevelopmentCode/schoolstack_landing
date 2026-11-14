"use client";

import { Plus } from "lucide-react";
import ParentHealthFormSidebar from "@/components/school-parent/health/ParentHealthFormSidebar";
import ParentHealthItemCard from "@/components/school-parent/health/ParentHealthItemCard";
import StudentHealthTabSkeleton from "@/components/school-parent/health/StudentHealthTabSkeleton";
import GardenChildHealthTab from "@/components/school-parent/health/garden/GardenChildHealthTab";
import type { StudentHealthProfile } from "@/components/school-parent/health/parent-health-types";
import { useStudentHealthTab } from "@/components/school-parent/health/useStudentHealthTab";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentChildHealthTabProps = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  organizationId: string;
  studentId: string;
  studentFirstName: string;
  readOnly?: boolean;
  initialProfile?: StudentHealthProfile | null;
  onProfileChange?: (profile: StudentHealthProfile) => void;
  portal?: "parent" | "admin" | "teacher";
  schoolSlug?: string;
};

/**
 * A student's health tab. Parents get the Garden view (inside the My Children
 * record card); the admin and teacher student panels keep the story layout.
 * All data behaviour lives in `useStudentHealthTab`.
 */
export default function ParentChildHealthTab({
  theme,
  adminCompat,
  organizationId,
  studentId,
  studentFirstName,
  readOnly = false,
  initialProfile,
  onProfileChange,
  portal = "parent",
  schoolSlug,
}: ParentChildHealthTabProps) {
  const health = useStudentHealthTab({
    organizationId,
    studentId,
    readOnly,
    initialProfile,
    onProfileChange,
    portal,
    schoolSlug,
  });

  if (portal === "parent") {
    return (
      <GardenChildHealthTab
        theme={theme}
        adminCompat={adminCompat}
        studentFirstName={studentFirstName}
        readOnly={readOnly}
        health={health}
      />
    );
  }

  const {
    isAdminPortal,
    isTeacherPortal,
    isStaffPortal,
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
            {isAdminPortal
              ? "Families are notified when you add or update health items here."
              : isTeacherPortal
                ? "Families and the school office are notified when you add or update health items here."
                : "Teachers and the school office are notified when you share updates here."}
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

      {loading ? <StudentHealthTabSkeleton theme={theme} /> : null}

      {!loading ? (
      <>
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
      </>
      ) : null}

      <ParentHealthFormSidebar
        theme={theme}
        adminCompat={adminCompat}
        open={sidebarOpen}
        mode={sidebarMode}
        itemType={sidebarItemType}
        initialValues={sidebarInitialValues}
        readOnly={readOnly}
        saving={saving}
        variant={isStaffPortal ? "modal" : "sidebar"}
        onClose={closeForm}
        onSave={handleSave}
        onDelete={formState.mode === "edit" ? handleDelete : undefined}
      />
    </div>
  );
}
