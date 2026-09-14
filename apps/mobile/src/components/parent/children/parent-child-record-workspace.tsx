import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View, type View as ViewType } from 'react-native';

import { ParentApplicationStepBottomSheet } from '@/components/parent/children/parent-application-step-bottom-sheet';
import { ParentChecklistItemBottomSheet } from '@/components/parent/children/parent-checklist-item-bottom-sheet';
import { EditableStudentPhoto } from '@/components/parent/children/editable-student-photo';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import {
  SubmissionApplicationStepsSection,
  SubmissionEnrollmentStepsSection,
} from '@/components/school-admin/submission-detail-sections';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryPillNav, type StoryPillNavItem } from '@/components/story/story-pill-nav';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { Story, StoryCardPadding, StoryFonts, StoryRadius } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import {
  buildApplicationFormSteps,
  computeApplicationFormStepStatuses,
} from '@/lib/admissions/application-form-steps';
import { extractStudentFromResponses } from '@/lib/admissions/apply-system-fields';
import { applicationStatusLabel } from '@/lib/admissions/application-status-ui';
import type { LoadedEnrollmentChecklist } from '@/lib/admissions/enrollment-checklist';
import {
  childStatusChipTone,
  type ParentChildRecordSection,
} from '@/lib/parent/parent-children-utils';
import type { FamilyChildOverview, ParentAssignedTeacher } from '@/lib/parent/parent-portal-api';
import {
  StudentProfilePhotoUploadError,
  uploadStudentProfilePhotoFromParent,
} from '@/lib/parent/upload-student-profile-photo';

type RecordTab = 'application' | 'checklist' | 'teachers';

type ParentChildRecordWorkspaceProps = {
  childOverview: FamilyChildOverview;
  application: ApplicationDetail;
  checklist: LoadedEnrollmentChecklist | null;
  assignedTeachers: ParentAssignedTeacher[];
  organizationId: string;
  activeSection: ParentChildRecordSection;
  onSectionChange: (section: ParentChildRecordSection) => void;
  onPhotoUpdated?: (profilePhotoUrl: string) => void;
  workspaceRef?: React.RefObject<ViewType | null>;
};

function formatBirthDate(value: string): string | null {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateAge(value: string): number | null {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age >= 0 ? age : null;
}

function toRecordTab(section: ParentChildRecordSection): RecordTab {
  if (section === 'checklist' || section === 'teachers') return section;
  return 'application';
}

export function ParentChildRecordWorkspace({
  childOverview,
  application,
  checklist,
  assignedTeachers,
  organizationId,
  activeSection,
  onSectionChange,
  onPhotoUpdated,
  workspaceRef,
}: ParentChildRecordWorkspaceProps) {
  const theme = useParentTheme();
  const { refresh } = useParentHome();

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    application.profilePhotoUrl ?? childOverview.profilePhotoUrl ?? null,
  );
  const [photoUploading, setPhotoUploading] = useState(false);
  const [selectedApplicationStepId, setSelectedApplicationStepId] = useState<string | null>(null);
  const [selectedEnrollmentItemId, setSelectedEnrollmentItemId] = useState<string | null>(null);

  const student = extractStudentFromResponses(application.responses);
  const fullName =
    childOverview.studentName ??
    (student ? `${student.firstName} ${student.lastName}` : 'Student');
  const birthDate = student ? formatBirthDate(student.dateOfBirth) : null;
  const age = student ? calculateAge(student.dateOfBirth) : null;
  const gradeLabel = childOverview.grade
    ? `Grade ${childOverview.grade}`
    : student?.grade
      ? `Grade ${student.grade}`
      : null;
  const hasChecklist = Boolean(checklist && checklist.items.length > 0);
  const hasTeachersTab = Boolean(application.studentId);
  const canUploadPhoto = Boolean(application.studentId);
  const statusLabel = applicationStatusLabel(application.status);
  const statusTone = childStatusChipTone(childOverview);
  const activeTab = toRecordTab(activeSection);

  const navItems = useMemo((): StoryPillNavItem[] => {
    const items: StoryPillNavItem[] = [
      { key: 'application', label: 'Application', icon: 'document-text-outline' },
    ];
    if (hasChecklist) {
      items.push({ key: 'checklist', label: 'Enrollment', icon: 'clipboard-outline' });
    }
    if (hasTeachersTab) {
      items.push({ key: 'teachers', label: 'Teachers', icon: 'people-outline' });
    }
    return items;
  }, [hasChecklist, hasTeachersTab]);

  const selectedApplicationStep = useMemo(() => {
    if (!selectedApplicationStepId) return null;
    const steps = buildApplicationFormSteps(application.schema, application.feeConfig);
    const stepsWithStatus = computeApplicationFormStepStatuses(steps, {
      applicationStatus: application.status,
      stepIndex: application.stepIndex,
      feeStatus: application.feeStatus,
    });
    return stepsWithStatus.find((step) => step.id === selectedApplicationStepId) ?? null;
  }, [application, selectedApplicationStepId]);

  const selectedEnrollmentItem = useMemo(() => {
    if (!checklist || !selectedEnrollmentItemId) return null;
    return checklist.items.find((item) => item.id === selectedEnrollmentItemId) ?? null;
  }, [checklist, selectedEnrollmentItemId]);

  const selectedEnrollmentInstance = useMemo(() => {
    if (!checklist || !selectedEnrollmentItemId) return null;
    return (
      checklist.instances.find(
        (instance) => instance.templateItemId === selectedEnrollmentItemId,
      ) ?? null
    );
  }, [checklist, selectedEnrollmentItemId]);

  const handlePhotoSelected = useCallback(
    async (uri: string, mimeType?: string) => {
      if (!application.studentId) return;

      setPhotoUploading(true);
      try {
        const nextUrl = await uploadStudentProfilePhotoFromParent({
          organizationId,
          studentId: application.studentId,
          uri,
          mimeType,
        });
        setProfilePhotoUrl(nextUrl);
        onPhotoUpdated?.(nextUrl);
        void refresh();
      } catch (error) {
        const message =
          error instanceof StudentProfilePhotoUploadError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Failed to upload photo.';
        Alert.alert('Photo upload failed', message);
      } finally {
        setPhotoUploading(false);
      }
    },
    [application.studentId, onPhotoUpdated, organizationId, refresh],
  );

  const handleTabChange = useCallback(
    (key: string) => {
      if (key === 'application' || key === 'checklist' || key === 'teachers') {
        onSectionChange(key);
      }
    },
    [onSectionChange],
  );

  return (
    <View
      ref={workspaceRef}
      style={styles.container}
      testID="parent-child-record-workspace">
      <View style={styles.header}>
        <StorySectionKicker style={styles.kicker}>School record</StorySectionKicker>
        <View style={styles.hero}>
          <EditableStudentPhoto
            name={fullName}
            photoUrl={profilePhotoUrl}
            shape="square"
            editable={canUploadPhoto}
            uploading={photoUploading}
            showEditHint={false}
            editTrigger="badge"
            onPhotoSelected={(uri, mimeType) => void handlePhotoSelected(uri, mimeType)}
          />
          <View style={styles.heroCopy}>
            <StoryDisplayHeading size="section" style={styles.heroName}>
              {fullName}
            </StoryDisplayHeading>
            <View style={styles.pillRow}>
              <StoryChip tone={statusTone} label={statusLabel} />
              {gradeLabel ? (
                <View style={[styles.metaPill, { backgroundColor: theme.line }]}>
                  <Text style={[styles.metaPillText, { color: theme.muted }]}>{gradeLabel}</Text>
                </View>
              ) : null}
              {birthDate ? (
                <View style={[styles.metaPill, { backgroundColor: theme.line }]}>
                  <Text style={[styles.metaPillText, { color: theme.muted }]}>
                    Born {birthDate}
                    {age !== null ? ` · Age ${age}` : ''}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {navItems.length > 1 ? (
          <StoryPillNav
            fullWidth
            items={navItems}
            activeKey={activeTab}
            onChange={handleTabChange}
            accessibilityLabel="School record sections"
          />
        ) : null}

        <View style={styles.tabContent}>
          {activeTab === 'application' ? (
            <SubmissionApplicationStepsSection
              embedded
              detail={application}
              feeStatus={application.feeStatus}
              applicationStatus={application.status}
              submittedAt={application.submittedAt}
              feeEnabled={application.feeConfig.enabled}
              onItemPress={setSelectedApplicationStepId}
              activeItemId={selectedApplicationStepId ?? undefined}
              timelineRowSpacing={Spacing.five}
            />
          ) : null}

          {activeTab === 'checklist' && checklist ? (
            <SubmissionEnrollmentStepsSection
              embedded
              checklist={checklist}
              loading={false}
              error={null}
              onItemPress={setSelectedEnrollmentItemId}
              activeItemId={selectedEnrollmentItemId ?? undefined}
            />
          ) : null}

          {activeTab === 'teachers' && hasTeachersTab ? (
            assignedTeachers.length === 0 ? (
              <Text style={[styles.emptyTeachers, { color: theme.muted }]}>
                No teachers assigned yet.
              </Text>
            ) : (
              <View style={styles.teacherList}>
                {assignedTeachers.map((teacher) => (
                  <View key={teacher.id} style={styles.teacherRow}>
                    <StudentPhoto
                      name={teacher.name}
                      photoUrl={teacher.profilePhotoUrl}
                      size="md"
                    />
                    <View style={styles.teacherCopy}>
                      <Text style={[styles.teacherName, { color: theme.ink }]}>
                        {teacher.name}
                      </Text>
                      {teacher.roleTitle ? (
                        <Text style={[styles.teacherRole, { color: theme.muted }]}>
                          {teacher.roleTitle}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )
          ) : null}
        </View>
      </View>

      <ParentApplicationStepBottomSheet
        visible={Boolean(selectedApplicationStep)}
        step={selectedApplicationStep}
        detail={application}
        feeStatus={application.feeStatus}
        onClose={() => setSelectedApplicationStepId(null)}
      />

      <ParentChecklistItemBottomSheet
        visible={Boolean(selectedEnrollmentItem)}
        item={selectedEnrollmentItem}
        instance={selectedEnrollmentInstance}
        onClose={() => setSelectedEnrollmentItemId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Story.line,
    borderRadius: StoryRadius.card,
    backgroundColor: Story.white,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Story.line,
    padding: StoryCardPadding,
    gap: Spacing.three,
    overflow: 'visible',
  },
  kicker: {
    marginBottom: 0,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.four,
    overflow: 'visible',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  heroName: {
    fontSize: 22,
    lineHeight: 28,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    alignItems: 'center',
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaPillText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  body: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  tabContent: {
    gap: Spacing.two,
  },
  emptyTeachers: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  teacherList: {
    gap: Spacing.two,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teacherCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  teacherName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  teacherRole: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 15,
  },
});
