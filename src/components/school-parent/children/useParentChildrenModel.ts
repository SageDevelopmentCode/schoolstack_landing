"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  childFirstName,
  isParentChildRecordSection,
  type ParentChildRecordSection,
} from "@/components/school-parent/children/parent-children-utils";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { StudentHealthProfile } from "@/components/school-parent/health/parent-health-types";
import { buildHealthAttentionSummary } from "@/components/school-parent/health/parent-health-types";
import {
  computeChecklistProgress,
  loadEnrollmentChecklistForApplication,
} from "@/lib/admissions/enrollment-checklist-materialization";
import type { EnrollmentChecklistItemInstance } from "@/lib/admissions/enrollment-checklist-schema";
import type {
  ChildProfileData,
  FamilyChildOverview,
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import { loadApplicationDetail } from "@/lib/admissions/parent-portal-access";
import { fetchAssignedTeachersForStudent } from "@/lib/school-parent/fetch-assigned-teachers";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { parentToast } from "@/lib/school-parent/parent-toast";
import {
  StudentProfilePhotoClientError,
  uploadStudentProfilePhotoFromParent,
} from "@/lib/students/upload-student-profile-photo-client";
import { emptyStudentHealthProfile } from "@/lib/student-health/types";

export type ParentChildrenPageProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId: string;
  familyChildren: FamilyChildOverview[];
  userProfile?: FamilyUserProfile;
  childProfiles?: Record<string, ChildProfileData>;
  initialHealthProfiles?: Record<string, StudentHealthProfile>;
  previewBasePath?: string;
  previewMode?: boolean;
  programPortalLabel?: string;
};

export type ChildAttentionItem = {
  id: string;
  label: string;
  status: "not_started" | "in_progress";
  /** 1-based position among the checklist's required steps. */
  step: number;
};

/** Required checklist items still waiting on the family (not started / in progress). */
export function incompleteChecklistItems(profile: ChildProfileData | null): ChildAttentionItem[] {
  if (!profile?.checklist) return [];

  const instanceByTemplateId = new Map<string, EnrollmentChecklistItemInstance>();
  for (const instance of profile.checklist.instances) {
    instanceByTemplateId.set(instance.templateItemId, instance);
  }

  const result: ChildAttentionItem[] = [];
  let step = 0;
  for (const item of profile.checklist.items) {
    if (!item.required) continue;
    step += 1;
    const status = instanceByTemplateId.get(item.id)?.status ?? "not_started";
    if (status === "not_started" || status === "in_progress") {
      result.push({ id: item.id, label: item.label, status, step });
    }
  }
  return result;
}

/**
 * All the state of the My Children tab: selected child, lazily loaded
 * profiles, health profiles, record section, deep links and photo upload.
 * Garden sections in `./garden/` read from it.
 */
export function useParentChildrenModel({
  schoolSlug,
  organizationId,
  familyChildren,
  childProfiles: initialProfiles,
  initialHealthProfiles,
  previewBasePath,
  previewMode = false,
}: ParentChildrenPageProps) {
  const { theme, adminCompat } = useParentTheme();
  const supabase = useMemo(() => createClient(), []);
  const [children, setChildren] = useState(familyChildren);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    familyChildren[0]?.applicationId ?? null,
  );
  const [profiles, setProfiles] = useState<Record<string, ChildProfileData>>(
    initialProfiles ?? {},
  );
  const [healthProfiles, setHealthProfiles] = useState<Record<string, StudentHealthProfile>>(
    initialHealthProfiles ?? {},
  );
  const initialApplicationId = familyChildren[0]?.applicationId ?? null;
  const [profileLoading, setProfileLoading] = useState(
    () =>
      !previewMode &&
      Boolean(initialApplicationId) &&
      !(initialProfiles?.[initialApplicationId ?? ""]),
  );
  const [profileError, setProfileError] = useState<string | null>(null);
  const [recordSection, setRecordSection] = useState<ParentChildRecordSection>("application");
  const [photoUploading, setPhotoUploading] = useState(false);
  const recordWorkspaceRef = useRef<HTMLElement>(null);
  const applyDashboardHref = previewBasePath ?? `/school/${schoolSlug}/apply`;
  const readOnly = Boolean(previewBasePath || previewMode);

  const selectedChild = useMemo(
    () => children.find((child) => child.applicationId === selectedApplicationId) ?? null,
    [children, selectedApplicationId],
  );

  const selectedProfile = selectedApplicationId
    ? profiles[selectedApplicationId] ?? null
    : null;

  const selectedHealthProfile =
    selectedChild?.studentId != null
      ? healthProfiles[selectedChild.studentId] ?? null
      : null;

  const handleHealthProfileChange = useCallback((studentId: string, profile: StudentHealthProfile) => {
    setHealthProfiles((prev) => ({
      ...prev,
      [studentId]: profile,
    }));
  }, []);

  const isRecordLoading =
    Boolean(selectedChild) && !selectedProfile?.application && !profileError;

  const handlePhotoUpdated = useCallback(
    (applicationId: string, profilePhotoUrl: string) => {
      setChildren((prev) =>
        prev.map((child) =>
          child.applicationId === applicationId
            ? { ...child, profilePhotoUrl }
            : child,
        ),
      );
      setProfiles((prev) => {
        const existing = prev[applicationId];
        if (!existing) return prev;
        return {
          ...prev,
          [applicationId]: {
            ...existing,
            application: { ...existing.application, profilePhotoUrl },
          },
        };
      });
    },
    [],
  );

  const loadProfile = useCallback(
    async (applicationId: string) => {
      if (profiles[applicationId]) {
        setProfileLoading(false);
        return;
      }
      if (previewMode) {
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      setProfileError(null);
      let res: Response | undefined;
      try {
        if (previewBasePath) {
          const [application, checklist] = await Promise.all([
            loadApplicationDetail(supabase, applicationId, organizationId),
            loadEnrollmentChecklistForApplication(
              supabase,
              applicationId,
              organizationId,
            ),
          ]);
          if (!application) {
            setProfileError("Could not load this student profile.");
            return;
          }
          const assignedTeachers = application.studentId
            ? await fetchAssignedTeachersForStudent(organizationId, application.studentId)
            : [];
          setProfiles((prev) => ({
            ...prev,
            [applicationId]: { application, checklist, assignedTeachers },
          }));
          return;
        }

        const params = new URLSearchParams({ organizationId });
        res = await fetch(
          `/api/parent-portal/children/${applicationId}/profile?${params}`,
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setProfileError(data.error ?? "Could not load this student profile.");
          void reportPortalOperationalError(
            "parent_portal",
            {
              organizationId,
              operation: "children.load_profile",
              error: "",
            },
            new Error(data.error ?? "Could not load this student profile."),
            res.status,
          );
          return;
        }
        if (!data.profile?.application) {
          setProfileError("Could not load this student profile.");
          return;
        }
        setProfiles((prev) => ({
          ...prev,
          [applicationId]: data.profile,
        }));
      } catch (err) {
        setProfileError(
          err instanceof Error ? err.message : "Failed to load student profile.",
        );
        void reportPortalOperationalError(
          "parent_portal",
          {
            organizationId,
            operation: "children.load_profile",
            error: "",
          },
          err,
          res?.status,
        );
      } finally {
        setProfileLoading(false);
      }
    },
    [organizationId, previewBasePath, previewMode, profiles, supabase],
  );

  const scrollToRecord = useCallback(() => {
    requestAnimationFrame(() => {
      recordWorkspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const selectChild = useCallback(
    (applicationId: string) => {
      setSelectedApplicationId(applicationId);
      setRecordSection("application");
      if (!profiles[applicationId]) {
        setProfileLoading(true);
      }
      void loadProfile(applicationId);
    },
    [loadProfile, profiles],
  );

  const openRecordSection = useCallback(
    (section: ParentChildRecordSection) => {
      if (!selectedApplicationId) return;
      setRecordSection(section);
      void loadProfile(selectedApplicationId);
      scrollToRecord();
    },
    [loadProfile, scrollToRecord, selectedApplicationId],
  );

  const retryProfile = useCallback(() => {
    if (!selectedApplicationId) return;
    setProfileError(null);
    void loadProfile(selectedApplicationId);
  }, [loadProfile, selectedApplicationId]);

  const searchParams = useSearchParams();
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (deepLinkHandled.current) return;
    const applicationId = searchParams.get("applicationId");
    const sectionParam = searchParams.get("section");
    const section = isParentChildRecordSection(sectionParam) ? sectionParam : null;

    if (!applicationId) {
      if (familyChildren[0]) {
        queueMicrotask(() => {
          void loadProfile(familyChildren[0].applicationId);
        });
      }
      return;
    }
    if (!children.some((child) => child.applicationId === applicationId)) {
      return;
    }
    deepLinkHandled.current = true;
    queueMicrotask(() => {
      setSelectedApplicationId(applicationId);
      if (section) {
        setRecordSection(section);
      }
      void loadProfile(applicationId);
      scrollToRecord();
    });
  }, [children, familyChildren, loadProfile, scrollToRecord, searchParams]);

  useEffect(() => {
    if (!selectedApplicationId) return;
    queueMicrotask(() => {
      void loadProfile(selectedApplicationId);
    });
  }, [loadProfile, selectedApplicationId]);

  /* ---------------- Photo upload (moved from the record header) ---------------- */

  const photoStudentId = selectedProfile?.application.studentId ?? null;
  const canUploadPhoto = !readOnly && Boolean(photoStudentId);

  const uploadPhoto = useCallback(
    async (file: File) => {
      const application = selectedProfile?.application;
      if (!application?.studentId || readOnly) return;
      const firstName = childFirstName(selectedChild?.studentName ?? "");
      const toastId = `parent-child-photo-${application.id}`;

      setPhotoUploading(true);
      parentToast.info("Uploading photo…", {
        id: toastId,
        description: "This only takes a moment.",
        duration: 60_000,
      });

      try {
        const nextUrl = await uploadStudentProfilePhotoFromParent(
          organizationId,
          application.studentId,
          file,
        );
        handlePhotoUpdated(application.id, nextUrl);
        parentToast.success("Profile photo updated.", {
          id: toastId,
          description: firstName ? `${firstName}'s new photo is on their profile.` : undefined,
          duration: 4000,
        });
      } catch (error) {
        parentToast.error(
          error instanceof StudentProfilePhotoClientError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Failed to upload photo.",
          { id: toastId, description: "Try a PNG, JPG or WebP image." },
        );
        void reportPortalOperationalError(
          "parent_portal",
          {
            organizationId,
            operation: "children.upload_photo",
            error: "",
          },
          error,
        );
      } finally {
        setPhotoUploading(false);
      }
    },
    [handlePhotoUpdated, organizationId, readOnly, selectedChild?.studentName, selectedProfile?.application],
  );

  /* ---------------- Derived view state ---------------- */

  const firstName = selectedChild ? childFirstName(selectedChild.studentName) : "";
  const attentionItems = useMemo(() => incompleteChecklistItems(selectedProfile), [selectedProfile]);
  const checklistProgress = selectedProfile?.checklist
    ? computeChecklistProgress(selectedProfile.checklist.items, selectedProfile.checklist.instances)
    : (selectedChild?.checklistProgress ?? null);
  const teachers = selectedProfile?.assignedTeachers ?? [];
  const healthAttention =
    selectedChild?.studentId != null
      ? buildHealthAttentionSummary(selectedHealthProfile ?? emptyStudentHealthProfile())
      : null;
  const showHealthAttention = Boolean(healthAttention?.hasAttentionItems);

  return {
    theme,
    adminCompat,
    children,
    selectedApplicationId,
    selectedChild,
    selectedProfile,
    selectedHealthProfile,
    healthProfiles,
    handleHealthProfileChange,
    profileLoading,
    profileError,
    isRecordLoading,
    recordSection,
    setRecordSection,
    recordWorkspaceRef,
    applyDashboardHref,
    readOnly,
    previewMode,
    selectChild,
    openRecordSection,
    retryProfile,
    handlePhotoUpdated,
    canUploadPhoto,
    photoUploading,
    uploadPhoto,
    firstName,
    attentionItems,
    checklistProgress,
    teachers,
    healthAttention,
    showHealthAttention,
  };
}

export type ParentChildrenModel = ReturnType<typeof useParentChildrenModel>;
