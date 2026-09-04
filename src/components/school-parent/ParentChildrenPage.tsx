"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import ParentChildRecordWorkspace from "@/components/school-parent/children/ParentChildRecordWorkspace";
import ParentChildrenLearnerStrip from "@/components/school-parent/children/ParentChildrenLearnerStrip";
import ParentChildrenOverview from "@/components/school-parent/children/ParentChildrenOverview";
import ParentChildrenOverviewSkeleton from "@/components/school-parent/children/ParentChildrenOverviewSkeleton";
import ParentChildrenRecordSkeleton from "@/components/school-parent/children/ParentChildrenRecordSkeleton";
import ParentChildrenStoryHeader from "@/components/school-parent/children/ParentChildrenStoryHeader";
import {
  isParentChildRecordSection,
  type ParentChildRecordSection,
} from "@/components/school-parent/children/parent-children-utils";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import { loadEnrollmentChecklistForApplication } from "@/lib/admissions/enrollment-checklist-materialization";
import type {
  ChildProfileData,
  FamilyChildOverview,
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import { loadApplicationDetail } from "@/lib/admissions/parent-portal-access";
import type { StudentHealthProfile } from "@/components/school-parent/health/parent-health-types";
import { fetchAssignedTeachersForStudent } from "@/lib/school-parent/fetch-assigned-teachers";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type ParentChildrenPageProps = {
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
};

export default function ParentChildrenPage({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  familyChildren,
  userProfile: _userProfile,
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
        const res = await fetch(
          `/api/parent-portal/children/${applicationId}/profile?${params}`,
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setProfileError(data.error ?? "Could not load this student profile.");
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
      } finally {
        setProfileLoading(false);
      }
    },
    [organizationId, previewBasePath, previewMode, profiles, supabase],
  );

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
      requestAnimationFrame(() => {
        recordWorkspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [loadProfile, selectedApplicationId],
  );

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
      requestAnimationFrame(() => {
        recordWorkspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }, [children, familyChildren, loadProfile, searchParams]);

  useEffect(() => {
    if (!selectedApplicationId) return;
    queueMicrotask(() => {
      void loadProfile(selectedApplicationId);
    });
  }, [loadProfile, selectedApplicationId]);

  if (children.length === 0) {
    return (
      <div className="min-h-full w-full" style={{ backgroundColor: theme.paper }}>
        <div className="mx-auto max-w-[1250px] px-4 py-6 sm:py-8 md:px-9">
          <ParentCard theme={theme} className="text-center">
            <p className="m-0 text-sm leading-relaxed" style={{ color: theme.muted }}>
              We don&apos;t have any student records from your applications yet. Visit
              your{" "}
              <Link
                href={applyDashboardHref}
                className="font-bold underline underline-offset-2"
                style={{ color: theme.primary }}
              >
                application dashboard
              </Link>{" "}
              to get started.
            </p>
          </ParentCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full" style={{ backgroundColor: theme.paper }}>
      <div className="mx-auto flex w-full max-w-[1250px] flex-col gap-5 px-4 py-6 sm:gap-6 sm:py-8 md:px-9">
        <ParentChildrenStoryHeader
          theme={theme}
          learners={children}
          selectedChild={selectedChild}
          onViewRecord={() => openRecordSection("application")}
        />

        <ParentChildrenLearnerStrip
          theme={theme}
          adminCompat={adminCompat}
          learners={children}
          selectedApplicationId={selectedApplicationId ?? children[0].applicationId}
          onSelect={selectChild}
        />

        <AnimatePresence mode="wait">
          {selectedChild && isRecordLoading ? (
            <div key={`${selectedChild.applicationId}-loading`} data-testid="parent-children-loading">
              <ParentChildrenOverviewSkeleton theme={theme} />
            </div>
          ) : selectedChild ? (
            <ParentChildrenOverview
              key={selectedChild.applicationId}
              theme={theme}
              adminCompat={adminCompat}
              child={selectedChild}
              profile={selectedProfile}
              healthProfile={selectedHealthProfile}
              onOpenRecordSection={openRecordSection}
            />
          ) : null}
        </AnimatePresence>

        {isRecordLoading ? (
          <ParentChildrenRecordSkeleton theme={theme} />
        ) : null}

        {selectedProfile?.application ? (
          <ParentChildRecordWorkspace
            key={selectedProfile.application.id}
            theme={theme}
            adminCompat={adminCompat}
            branding={branding}
            schoolName={schoolName}
            schoolSlug={schoolSlug}
            organizationId={organizationId}
            application={selectedProfile.application}
            checklist={selectedProfile.checklist}
            assignedTeachers={selectedProfile.assignedTeachers}
            readOnly={readOnly}
            activeSection={recordSection}
            onSectionChange={setRecordSection}
            onPhotoUpdated={handlePhotoUpdated}
            initialHealthProfile={
              selectedProfile.application.studentId
                ? healthProfiles[selectedProfile.application.studentId] ?? null
                : null
            }
            onHealthProfileChange={
              selectedProfile.application.studentId
                ? (profile) =>
                    handleHealthProfileChange(selectedProfile.application.studentId!, profile)
                : undefined
            }
            workspaceRef={recordWorkspaceRef}
          />
        ) : null}

        {profileError ? (
          <p className="text-center text-sm" style={{ color: theme.alert }}>
            {profileError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
