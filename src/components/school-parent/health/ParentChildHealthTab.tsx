"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { HealthFormValues } from "@/components/school-parent/health/ParentHealthFormPanel";
import ParentHealthFormSidebar from "@/components/school-parent/health/ParentHealthFormSidebar";
import ParentHealthItemCard from "@/components/school-parent/health/ParentHealthItemCard";
import StudentHealthTabSkeleton from "@/components/school-parent/health/StudentHealthTabSkeleton";
import type {
  HealthAllergyItem,
  HealthItemType,
  HealthMedicationItem,
  HealthUpdateItem,
  StudentHealthProfile,
} from "@/components/school-parent/health/parent-health-types";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import {
  createStudentHealthItemClient,
  createStudentHealthItemAdmin,
  createStudentHealthItemTeacher,
  deleteStudentHealthItemClient,
  deleteStudentHealthItemAdmin,
  deleteStudentHealthItemTeacher,
  fetchStudentHealthProfile,
  fetchStudentHealthProfileAdmin,
  fetchStudentHealthProfileTeacher,
  StudentHealthFetchError,
  updateStudentHealthItemClient,
  updateStudentHealthItemAdmin,
  updateStudentHealthItemTeacher,
} from "@/lib/student-health/fetch-student-health-profile-client";
import {
  mergeHealthItemIntoProfile,
  removeHealthItemFromProfile,
} from "@/lib/student-health/map-row";
import { emptyStudentHealthProfile } from "@/lib/student-health/types";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { adminToast } from "@/lib/school-admin/admin-toast";
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

function valuesToPayload(values: HealthFormValues): Record<string, unknown> {
  return { ...values };
}

async function fetchHealthProfile(
  portal: "parent" | "admin" | "teacher",
  organizationId: string,
  studentId: string,
  schoolSlug?: string,
) {
  if (portal === "admin" && schoolSlug) {
    return fetchStudentHealthProfileAdmin(schoolSlug, studentId);
  }
  if (portal === "teacher") {
    return fetchStudentHealthProfileTeacher(organizationId, studentId);
  }
  return fetchStudentHealthProfile(organizationId, studentId);
}

async function createHealthItem(
  portal: "parent" | "admin" | "teacher",
  organizationId: string,
  studentId: string,
  itemType: string,
  payload: Record<string, unknown>,
  schoolSlug?: string,
) {
  if (portal === "admin" && schoolSlug) {
    return createStudentHealthItemAdmin(schoolSlug, studentId, itemType, payload);
  }
  if (portal === "teacher") {
    return createStudentHealthItemTeacher(organizationId, studentId, itemType, payload);
  }
  return createStudentHealthItemClient(organizationId, studentId, itemType, payload);
}

async function updateHealthItem(
  portal: "parent" | "admin" | "teacher",
  organizationId: string,
  studentId: string,
  itemId: string,
  itemType: string,
  payload: Record<string, unknown>,
  schoolSlug?: string,
) {
  if (portal === "admin" && schoolSlug) {
    return updateStudentHealthItemAdmin(schoolSlug, studentId, itemId, itemType, payload);
  }
  if (portal === "teacher") {
    return updateStudentHealthItemTeacher(
      organizationId,
      studentId,
      itemId,
      itemType,
      payload,
    );
  }
  return updateStudentHealthItemClient(
    organizationId,
    studentId,
    itemId,
    itemType,
    payload,
  );
}

async function deleteHealthItem(
  portal: "parent" | "admin" | "teacher",
  organizationId: string,
  studentId: string,
  itemId: string,
  schoolSlug?: string,
) {
  if (portal === "admin" && schoolSlug) {
    return deleteStudentHealthItemAdmin(schoolSlug, studentId, itemId);
  }
  if (portal === "teacher") {
    return deleteStudentHealthItemTeacher(organizationId, studentId, itemId);
  }
  return deleteStudentHealthItemClient(organizationId, studentId, itemId);
}

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
  const isAdminPortal = portal === "admin";
  const isTeacherPortal = portal === "teacher";
  const isStaffPortal = isAdminPortal || isTeacherPortal;
  const toast = isAdminPortal ? adminToast : parentToast;
  const [profile, setProfile] = useState<StudentHealthProfile>(
    initialProfile ?? emptyStudentHealthProfile(),
  );
  const [prevInitialProfile, setPrevInitialProfile] = useState(initialProfile);
  const [prevStudentId, setPrevStudentId] = useState(studentId);

  if (
    initialProfile !== undefined &&
    (initialProfile !== prevInitialProfile || studentId !== prevStudentId)
  ) {
    setPrevInitialProfile(initialProfile);
    setPrevStudentId(studentId);
    setProfile(initialProfile ?? emptyStudentHealthProfile());
  }

  const fetchKey =
    initialProfile === undefined
      ? `${portal}:${organizationId}:${studentId}:${schoolSlug ?? ""}`
      : null;

  const [loadedFetchKey, setLoadedFetchKey] = useState<string | null>(
    fetchKey ? null : "provided",
  );

  const loading = fetchKey !== null && loadedFetchKey !== fetchKey;
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [saving, setSaving] = useState(false);

  const onProfileChangeRef = useRef(onProfileChange);

  useLayoutEffect(() => {
    onProfileChangeRef.current = onProfileChange;
  }, [onProfileChange]);

  const updateProfile = useCallback((next: StudentHealthProfile) => {
    setProfile(next);
    onProfileChangeRef.current?.(next);
  }, []);

  useEffect(() => {
    if (!fetchKey) return;

    let cancelled = false;

    void fetchHealthProfile(portal, organizationId, studentId, schoolSlug)
      .then((nextProfile) => {
        if (cancelled) return;
        updateProfile(nextProfile);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(
          error instanceof StudentHealthFetchError
            ? error.message
            : "Failed to load health profile.",
        );
        updateProfile(emptyStudentHealthProfile());
      })
      .finally(() => {
        if (!cancelled) setLoadedFetchKey(fetchKey);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey, organizationId, portal, schoolSlug, studentId, toast, updateProfile]);

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
      try {
        const payload = valuesToPayload(values);
        if (formState.mode === "edit") {
          const response = (await updateHealthItem(
            portal,
            organizationId,
            studentId,
            formState.itemId,
            itemType,
            payload,
            schoolSlug,
          )) as { item: HealthAllergyItem | HealthMedicationItem | HealthUpdateItem };
          updateProfile(mergeHealthItemIntoProfile(profile, response.item));
        } else {
          const response = (await createHealthItem(
            portal,
            organizationId,
            studentId,
            itemType,
            payload,
            schoolSlug,
          )) as {
            item: HealthAllergyItem | HealthMedicationItem | HealthUpdateItem;
          };
          updateProfile(mergeHealthItemIntoProfile(profile, response.item));
        }

        toast.success(
          isAdminPortal
            ? "Health item saved."
            : isTeacherPortal
              ? "Health item saved."
              : "Update saved. Teachers and the school office will be notified.",
        );
        setFormState({ mode: "closed" });
      } catch (error) {
        toast.error(
          error instanceof StudentHealthFetchError
            ? error.message
            : "Failed to save health item.",
        );
      } finally {
        setSaving(false);
      }
    },
    [formState, isAdminPortal, isTeacherPortal, organizationId, portal, profile, readOnly, schoolSlug, studentId, toast, updateProfile],
  );

  const handleDelete = useCallback(async () => {
    if (readOnly || formState.mode !== "edit") return;

    setSaving(true);
    try {
      await deleteHealthItem(portal, organizationId, studentId, formState.itemId, schoolSlug);
      updateProfile(
        removeHealthItemFromProfile(profile, formState.itemId, formState.itemType),
      );
      toast.success("Health item removed.");
      setFormState({ mode: "closed" });
    } catch (error) {
      toast.error(
        error instanceof StudentHealthFetchError
          ? error.message
          : "Failed to delete health item.",
      );
    } finally {
      setSaving(false);
    }
  }, [formState, organizationId, portal, profile, readOnly, schoolSlug, studentId, toast, updateProfile]);

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
