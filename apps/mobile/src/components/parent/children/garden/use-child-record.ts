import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { closeThen, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import { extractStudentFromResponses } from '@/lib/admissions/apply-system-fields';
import { applicationStatusLabel } from '@/lib/admissions/application-status-ui';
import type {
  EnrollmentChecklistItem,
  LoadedEnrollmentChecklist,
} from '@/lib/admissions/enrollment-checklist';
import {
  buildApplicationStepsView,
  buildEnrollmentStepsView,
  buildRecordTabs,
  calculateAge,
  checklistCompletedToast,
  formatBirthDate,
} from '@/lib/parent/parent-children-garden';
import {
  childFirstName,
  childStatusChipTone,
  type ParentChildRecordSection,
} from '@/lib/parent/parent-children-utils';
import type { FamilyChildOverview } from '@/lib/parent/parent-portal-api';
import {
  StudentProfilePhotoUploadError,
  uploadStudentProfilePhotoFromParent,
} from '@/lib/parent/upload-student-profile-photo';
import { MOBILE_PROFILE_PHOTO_UPLOAD_ENABLED } from '@/lib/profile-photo/mobile-profile-photo-upload-enabled';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type ChildRecordInput = {
  childOverview: FamilyChildOverview;
  application: ApplicationDetail;
  checklist: LoadedEnrollmentChecklist | null;
  organizationId: string;
  activeSection: ParentChildRecordSection;
  onSectionChange: (section: ParentChildRecordSection) => void;
  initialEnrollmentItemId?: string | null;
  initialEnrollmentSectionId?: string | null;
  onChecklistUpdated?: (checklist: LoadedEnrollmentChecklist) => void;
  onPhotoUpdated?: (profilePhotoUrl: string) => void;
  refresh: () => Promise<void>;
};

/**
 * Everything the school record card owns: derived snapshot + steps, photo
 * upload, the local checklist and the two sheets. Feedback (toasts, haptics,
 * celebrate) wraps the same calls the Story workspace made.
 */
export function useChildRecord(input: ChildRecordInput) {
  const {
    childOverview,
    application,
    checklist,
    organizationId,
    activeSection,
    onSectionChange,
    initialEnrollmentItemId,
    initialEnrollmentSectionId,
    onChecklistUpdated,
    onPhotoUpdated,
    refresh,
  } = input;
  const toast = useGardenToast();
  const gate = useGardenReadOnlyGate();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    application.profilePhotoUrl ?? childOverview.profilePhotoUrl ?? null,
  );
  const [photoUploading, setPhotoUploading] = useState(false);
  const [applicationStepId, setApplicationStepId] = useState<string | null>(null);
  const [enrollmentItemId, setEnrollmentItemId] = useState<string | null>(
    initialEnrollmentItemId ?? null,
  );
  const [enrollmentSectionId, setEnrollmentSectionId] = useState<string | null>(
    initialEnrollmentSectionId ?? null,
  );
  const [localChecklist, setLocalChecklist] = useState(checklist);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => setLocalChecklist(checklist), [checklist]);
  useEffect(() => {
    setProfilePhotoUrl(application.profilePhotoUrl ?? childOverview.profilePhotoUrl ?? null);
  }, [application.profilePhotoUrl, childOverview.profilePhotoUrl]);

  useEffect(() => {
    if (initialEnrollmentItemId) {
      setEnrollmentItemId(initialEnrollmentItemId);
      onSectionChange('checklist');
    }
    if (initialEnrollmentSectionId) setEnrollmentSectionId(initialEnrollmentSectionId);
  }, [initialEnrollmentItemId, initialEnrollmentSectionId, onSectionChange]);

  const resolvedChecklist = localChecklist ?? checklist;
  const student = extractStudentFromResponses(application.responses);
  const fullName =
    childOverview.studentName ?? (student ? `${student.firstName} ${student.lastName}` : 'Student');
  const firstName = childFirstName(fullName);
  const studentId = application.studentId;

  const snapshot = useMemo(
    () => ({
      fullName,
      firstName,
      statusLabel: applicationStatusLabel(application.status),
      statusTone: childStatusChipTone(childOverview),
      gradeLabel: childOverview.grade
        ? `Grade ${childOverview.grade}`
        : student?.grade
          ? `Grade ${student.grade}`
          : null,
      birthDate: student ? formatBirthDate(student.dateOfBirth) : null,
      age: student ? calculateAge(student.dateOfBirth) : null,
    }),
    [application.status, childOverview, firstName, fullName, student],
  );

  const tabs = useMemo(
    () =>
      buildRecordTabs({
        hasChecklist: Boolean(resolvedChecklist && resolvedChecklist.items.length > 0),
        hasStudent: Boolean(studentId),
      }),
    [resolvedChecklist, studentId],
  );

  const applicationView = useMemo(() => buildApplicationStepsView(application), [application]);
  const enrollmentView = useMemo(
    () => (resolvedChecklist ? buildEnrollmentStepsView(resolvedChecklist) : null),
    [resolvedChecklist],
  );

  // Celebrate the moment the last required item finishes (not on load).
  const wasComplete = useRef(enrollmentView?.isComplete ?? false);
  useEffect(() => {
    const now = enrollmentView?.isComplete ?? false;
    if (now && !wasComplete.current) setCelebrate(true);
    wasComplete.current = now;
  }, [enrollmentView?.isComplete]);

  const applicationStep = useMemo(
    () => applicationView.rawSteps.find((step) => step.id === applicationStepId) ?? null,
    [applicationStepId, applicationView.rawSteps],
  );
  const enrollmentItem = useMemo(
    () => resolvedChecklist?.items.find((item) => item.id === enrollmentItemId) ?? null,
    [enrollmentItemId, resolvedChecklist],
  );

  const canUploadPhoto = MOBILE_PROFILE_PHOTO_UPLOAD_ENABLED && Boolean(studentId);

  const uploadPhoto = useCallback(
    async (uri: string, mimeType?: string) => {
      if (!studentId) return;
      setPhotoUploading(true);
      try {
        const nextUrl = await uploadStudentProfilePhotoFromParent({
          organizationId,
          studentId,
          uri,
          mimeType,
        });
        setProfilePhotoUrl(nextUrl);
        onPhotoUpdated?.(nextUrl);
        void refresh();
        toast.success('Photo updated', {
          id: 'child-photo',
          description: `${firstName}'s new photo is on their school record.`,
        });
      } catch (error) {
        reportError('parent.student_profile_photo.upload_failed', error);
        const message =
          error instanceof StudentProfilePhotoUploadError || error instanceof Error
            ? error.message
            : 'Failed to upload photo.';
        toast.error('Photo upload failed', { id: 'child-photo', description: message });
      } finally {
        setPhotoUploading(false);
      }
    },
    [firstName, onPhotoUpdated, organizationId, refresh, reportError, studentId, toast],
  );

  const updateChecklist = useCallback(
    (next: LoadedEnrollmentChecklist) => {
      setLocalChecklist(next);
      onChecklistUpdated?.(next);
    },
    [onChecklistUpdated],
  );

  const closeEnrollmentItem = useCallback(() => {
    setEnrollmentItemId(null);
    setEnrollmentSectionId(null);
  }, []);

  /** A checklist item finished: close the sheet, then say so (toasts sit behind sheets). */
  const onEnrollmentItemCompleted = useCallback(
    (item: EnrollmentChecklistItem) => {
      const copy = checklistCompletedToast(item);
      closeThen(closeEnrollmentItem, () => toast.success(copy.title, { description: copy.description }));
    },
    [closeEnrollmentItem, toast],
  );

  const onRecordSaved = useCallback(() => {
    void refresh();
  }, [refresh]);

  return {
    snapshot,
    profilePhotoUrl,
    photoUploading,
    canUploadPhoto,
    uploadPhoto,
    tabs,
    activeSection,
    onSectionChange,
    applicationView,
    enrollmentView,
    checklist: resolvedChecklist,
    studentId,
    applicationStep,
    openApplicationStep: setApplicationStepId,
    closeApplicationStep: () => setApplicationStepId(null),
    enrollmentItem,
    enrollmentSectionId,
    openEnrollmentItem: (itemId: string) => {
      setEnrollmentItemId(itemId);
      setEnrollmentSectionId(null);
    },
    closeEnrollmentItem,
    onEnrollmentItemCompleted,
    updateChecklist,
    onRecordSaved,
    celebrate,
    celebrationKey: `parent-enrollment-complete-${application.id}`,
    readOnly: gate.readOnly,
    guard: gate.guard,
    notifyReadOnly: gate.notifyReadOnly,
  };
}

export type ChildRecordModel = ReturnType<typeof useChildRecord>;
