import { StyleSheet, Text, View } from 'react-native';

import { ChildHealthSection } from '@/components/parent/children/garden/health/child-health-section';
import { ChildPickupSection } from '@/components/parent/children/garden/pickup/child-pickup-section';
import { GardenChildPhoto } from '@/components/parent/children/garden/garden-child-photo';
import { TeacherRow } from '@/components/parent/children/garden/sections/children-sections';
import type { ChildRecordModel } from '@/components/parent/children/garden/use-child-record';
import { GSegmented } from '@/components/parent/garden/segmented';
import { GStepList } from '@/components/parent/garden/steps';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GChip, GKicker, GProgress, gText } from '@/components/parent/garden/ui';
import type { ParentChildRecordSection } from '@/lib/parent/parent-children-utils';
import type { ParentAssignedTeacher } from '@/lib/parent/parent-portal-api';

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function ProgressHeader({
  title,
  subtitle,
  completed,
  total,
  noun,
}: {
  title: string;
  subtitle?: string | null;
  completed: number;
  total: number;
  noun: string;
}) {
  const done = total > 0 && completed >= total;
  return (
    <View style={styles.progressHeader}>
      <View style={styles.progressTitleRow}>
        <Text style={[gText.itemTitle, styles.flex]} numberOfLines={2}>
          {title}
        </Text>
        <GChip
          label={done ? 'All done' : `${completed} of ${total} done`}
          tone={done ? 'success' : 'neutral'}
          icon={done ? 'checkmark' : undefined}
        />
      </View>
      {subtitle ? <Text style={gText.meta}>{subtitle}</Text> : null}
      {total > 0 ? (
        <GProgress
          value={completed / total}
          done={done}
          label={`${noun}, ${completed} of ${total} complete`}
        />
      ) : null}
    </View>
  );
}

function MissingStudent({ what }: { what: string }) {
  return (
    <Text style={gText.meta}>
      {what} will be available once your child&apos;s student record is linked.
    </Text>
  );
}

/**
 * The school record: a snapshot (photo, status, grade, birthday, enrollment
 * progress) and the record sections in a segmented control.
 */
export function ChildRecordCard({
  record,
  organizationId,
  teachers,
  checklistProgress,
}: {
  record: ChildRecordModel;
  organizationId: string;
  teachers: ParentAssignedTeacher[];
  checklistProgress: { completed: number; total: number } | null;
}) {
  const { snapshot } = record;
  const progress = record.enrollmentView
    ? { completed: record.enrollmentView.completed, total: record.enrollmentView.total }
    : checklistProgress;

  return (
    <GCard kicker="School record" index={3} testID="parent-child-record-workspace">
      <View style={styles.hero}>
        <GardenChildPhoto
          name={snapshot.fullName}
          photoUrl={record.profilePhotoUrl}
          editable={record.canUploadPhoto}
          uploading={record.photoUploading}
          readOnly={record.readOnly}
          onBlocked={record.notifyReadOnly}
          onPicked={(uri, mimeType) => void record.uploadPhoto(uri, mimeType)}
        />
        <View style={styles.heroCopy}>
          <Text accessibilityRole="header" style={styles.name}>
            {snapshot.fullName}
          </Text>
          <GChip label={snapshot.statusLabel} tone={snapshot.statusTone} />
          <View style={styles.pills}>
            {snapshot.gradeLabel ? <Pill label={snapshot.gradeLabel} /> : null}
            {snapshot.birthDate ? (
              <Pill
                label={`Born ${snapshot.birthDate}${snapshot.age !== null ? ` · Age ${snapshot.age}` : ''}`}
              />
            ) : null}
          </View>
        </View>
      </View>

      {progress && progress.total > 0 ? (
        <View style={styles.enrollment}>
          <View style={styles.progressTitleRow}>
            <GKicker style={styles.flex}>Enrollment checklist</GKicker>
            <Text style={[styles.count, progress.completed >= progress.total && { color: Garden.forest }]}>
              {progress.completed} of {progress.total} complete
            </Text>
          </View>
          <GProgress
            value={progress.completed / progress.total}
            done={progress.completed >= progress.total}
            label={`${snapshot.firstName}'s enrollment checklist, ${progress.completed} of ${progress.total} complete`}
          />
        </View>
      ) : null}

      {record.tabs.length > 1 ? (
        <GSegmented
          scrollable
          accessibilityLabel="School record sections"
          items={record.tabs.map((tab) => ({
            id: tab.id,
            label: tab.label,
            icon: tab.icon,
            testID: `parent-child-record-tab-${tab.id}`,
          }))}
          activeId={record.activeSection}
          onChange={(id: ParentChildRecordSection) => record.onSectionChange(id)}
          style={styles.tabs}
        />
      ) : null}

      <View style={styles.tabBody}>
        {record.activeSection === 'application' ? (
          <View style={styles.section}>
            <ProgressHeader
              title={record.applicationView.title}
              subtitle={record.applicationView.subtitle}
              completed={record.applicationView.completed}
              total={record.applicationView.total}
              noun="Application"
            />
            <GStepList
              accessibilityLabel="Application steps"
              steps={record.applicationView.steps.map((step) => ({
                ...step,
                onPress: () => record.openApplicationStep(step.id),
              }))}
            />
          </View>
        ) : null}

        {record.activeSection === 'checklist' && record.enrollmentView ? (
          <View style={styles.section}>
            <ProgressHeader
              title={record.enrollmentView.title}
              subtitle="Tap a step to open it. Steps you finish are saved right away."
              completed={record.enrollmentView.completed}
              total={record.enrollmentView.total}
              noun="Enrollment checklist"
            />
            <GStepList
              accessibilityLabel="Enrollment steps"
              steps={record.enrollmentView.steps.map((step) => ({
                ...step,
                testID: `parent-enrollment-step-${step.id}`,
                onPress: () => record.openEnrollmentItem(step.id),
              }))}
            />
          </View>
        ) : null}

        {record.activeSection === 'teachers' && record.studentId ? (
          teachers.length === 0 ? (
            <Text style={gText.meta}>No teachers assigned yet.</Text>
          ) : (
            <View style={styles.section}>
              {teachers.map((teacher, i) => (
                <TeacherRow key={teacher.id} teacher={teacher} index={i} />
              ))}
            </View>
          )
        ) : null}

        {record.activeSection === 'health' ? (
          record.studentId ? (
            <ChildHealthSection
              organizationId={organizationId}
              studentId={record.studentId}
              studentFirstName={snapshot.firstName}
              onSaved={record.onRecordSaved}
            />
          ) : (
            <MissingStudent what="Health information" />
          )
        ) : null}

        {record.activeSection === 'pickup' ? (
          record.studentId ? (
            <ChildPickupSection
              organizationId={organizationId}
              studentId={record.studentId}
              studentFirstName={snapshot.firstName}
              onSaved={record.onRecordSaved}
            />
          ) : (
            <MissingStudent what="Authorized pickup" />
          )
        ) : null}
      </View>
    </GCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroCopy: { flex: 1, gap: 6 },
  name: {
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: Garden.ink,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    borderRadius: 999,
    backgroundColor: Garden.ink06,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillText: { fontFamily: GardenFonts.bodyBold, fontSize: 12, color: Garden.soft },
  enrollment: { marginTop: 16, gap: 8 },
  count: { fontFamily: GardenFonts.bodyExtra, fontSize: 12.5, color: Garden.soft },
  tabs: { marginTop: 18 },
  tabBody: { marginTop: 16 },
  section: { gap: 14 },
  progressHeader: { gap: 8 },
  progressTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
