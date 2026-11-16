"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { HealthFormValues } from "@/components/school-parent/health/ParentHealthFormPanel";
import type {
  HealthAllergyItem,
  HealthItemType,
  HealthMedicationItem,
  HealthUpdateItem,
  StudentHealthProfile,
} from "@/components/school-parent/health/parent-health-types";
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
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { adminToast } from "@/lib/school-admin/admin-toast";

/*
 * State + data actions for a student's health tab (parent, admin and teacher
 * portals). The views (legacy story layout for staff, Garden for parents)
 * only render; all fetch/save/delete behaviour lives here.
 */

export type StudentHealthTabArgs = {
  organizationId: string;
  studentId: string;
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

export function useStudentHealthTab({
  organizationId,
  studentId,
  readOnly = false,
  initialProfile,
  onProfileChange,
  portal = "parent",
  schoolSlug,
}: StudentHealthTabArgs) {
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
        if (portal === "parent") {
          void reportPortalOperationalError(
            "parent_portal",
            {
              organizationId,
              operation: "health.load",
              error: "",
            },
            error,
          );
        }
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

        if (isAdminPortal || isTeacherPortal) {
          toast.success("Health item saved.");
        } else {
          parentToast.success(formState.mode === "edit" ? "Update saved" : "Added to the health profile", {
            description: "Teachers and the school office will be notified.",
          });
        }
        setFormState({ mode: "closed" });
      } catch (error) {
        toast.error(
          error instanceof StudentHealthFetchError
            ? error.message
            : "Failed to save health item.",
        );
        if (portal === "parent") {
          void reportPortalOperationalError(
            "parent_portal",
            {
              organizationId,
              operation: "health.save",
              error: "",
            },
            error,
          );
        }
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
      if (portal === "parent") {
        parentToast.success("Health item removed", {
          description: "It's no longer on the health profile.",
        });
      } else {
        toast.success("Health item removed.");
      }
      setFormState({ mode: "closed" });
    } catch (error) {
      toast.error(
        error instanceof StudentHealthFetchError
          ? error.message
          : "Failed to delete health item.",
      );
      if (portal === "parent") {
        void reportPortalOperationalError(
          "parent_portal",
          {
            organizationId,
            operation: "health.delete",
            error: "",
          },
          error,
        );
      }
    } finally {
      setSaving(false);
    }
  }, [formState, organizationId, portal, profile, readOnly, schoolSlug, studentId, toast, updateProfile]);

  const activeItemCount =
    profile.allergies.length + profile.medications.length + profile.updates.length;

  const sidebarOpen = formState.mode !== "closed";
  const sidebarMode: "create" | "edit" = formState.mode === "edit" ? "edit" : "create";
  const sidebarItemType = formState.mode === "closed" ? "allergy" : formState.itemType;
  const sidebarInitialValues = formState.mode === "edit" ? formState.values : null;

  return {
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
  };
}

export type StudentHealthTabModel = ReturnType<typeof useStudentHealthTab>;
