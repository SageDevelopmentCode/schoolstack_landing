import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, type GChipTone } from '@/components/parent/garden/tokens';
import { GChip, GPressable } from '@/components/parent/garden/ui';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import {
  deriveSubmissionNextStep,
  type SubmissionNextStepTone,
} from '@/lib/admissions/admin-submission-next-step';
import {
  adminCombinedStatusProgressLabel,
  applicationStatusChipTone,
} from '@/lib/admissions/application-status-ui';
import {
  formatSubmissionProgress,
  type AdminApplicationSubmission,
} from '@/lib/admissions/application-submissions';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';

export function nextStepChipTone(tone: SubmissionNextStepTone): GChipTone {
  return tone === 'purple' ? 'info' : tone;
}

/** "Guardian · email" (same as the Story list item). */
export function submissionContactLine(submission: AdminApplicationSubmission): string {
  const guardianPart = submission.guardianName?.trim() || '—';
  const contactEmail = submission.contactEmail?.trim();
  return contactEmail ? `${guardianPart} · ${contactEmail}` : guardianPart;
}

/**
 * One application in the Admissions list: photo, student, guardian · email,
 * status + program chips, progress · updated, and the next step. The whole row
 * is the button; its label is unchanged ("{student}, {guardian · email}").
 */
export const SubmissionRow = memo(function SubmissionRow({
  submission,
  onPress,
}: {
  submission: AdminApplicationSubmission;
  onPress: (submission: AdminApplicationSubmission) => void;
}) {
  const studentName = submission.studentLabel?.trim() ?? '';
  const displayStudent = studentName || '—';
  const contactLine = submissionContactLine(submission);
  const nextStep = deriveSubmissionNextStep(submission);
  const needsYou = nextStep.kind === 'admin_action';
  const statusLabel = adminCombinedStatusProgressLabel(
    submission.status,
    submission.applicationProgressSummary,
    submission.enrollmentSummary,
  );
  const metaLine = [formatSubmissionProgress(submission), formatRelativeTime(submission.updatedAt)]
    .filter(Boolean)
    .join(' · ');

  return (
    <GPressable
      accessibilityLabel={`${displayStudent}, ${contactLine}`}
      accessibilityHint={`${statusLabel}. Opens the application`}
      pressedScale={0.985}
      onPress={() => onPress(submission)}
      style={[styles.row, needsYou && styles.rowNeedsYou]}>
      <View style={styles.top}>
        <StudentPhoto name={studentName} size="md" />
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>
            {displayStudent}
          </Text>
          <Text style={styles.contact} numberOfLines={1}>
            {contactLine}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
      </View>

      <View style={styles.chips}>
        <GChip label={statusLabel} tone={applicationStatusChipTone(submission.status)} />
        {submission.programName ? <GChip label={submission.programName} tone="neutral" /> : null}
      </View>

      {metaLine || nextStep.primary !== '—' ? (
        <View style={styles.foot}>
          {metaLine ? (
            <Text style={styles.meta} numberOfLines={1}>
              {metaLine}
            </Text>
          ) : (
            <View style={styles.spacer} />
          )}
          {nextStep.primary !== '—' ? (
            <View style={styles.next}>
              {needsYou ? <View style={styles.dot} /> : null}
              <Text
                style={[styles.nextText, needsYou && styles.nextTextStrong]}
                numberOfLines={1}>
                {nextStep.secondary ? `${nextStep.primary} · ${nextStep.secondary}` : nextStep.primary}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </GPressable>
  );
});

const styles = StyleSheet.create({
  row: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
    padding: 14,
    gap: 10,
  },
  rowNeedsYou: { borderColor: Garden.ink25 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontFamily: GardenFonts.bodyExtra, fontSize: 16, lineHeight: 21, color: Garden.ink },
  contact: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Garden.ink06,
  },
  meta: { flexShrink: 1, fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
  spacer: { flex: 1 },
  next: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#C2410C' },
  nextText: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  nextTextStrong: { fontFamily: GardenFonts.bodyExtra, color: Garden.ink },
});
