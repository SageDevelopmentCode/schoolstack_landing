import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ParentClassroomSignupRoleCard } from '@/components/parent/classroom-signups/parent-classroom-signup-role-card';
import { ParentClassroomSignupSlotCard } from '@/components/parent/classroom-signups/parent-classroom-signup-slot-card';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ParentClassroomSignupStudentOption,
} from '@/lib/parent/parent-classroom-signups-types';
import {
  getRoleFillCount,
  getSlotFillCount,
  isRoleFull,
  isSlotFull,
} from '@/lib/parent/parent-classroom-signups-utils';
import {
  submitParentClassroomSignupResponse,
  withdrawParentClassroomSignupResponse,
} from '@/lib/parent/parent-portal-api';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ParentClassroomSignupResponseFormProps = {
  organizationId: string;
  signup: ClassroomSignup;
  existingResponse: ClassroomSignupResponse | null;
  allResponses: ClassroomSignupResponse[];
  studentOptions: ParentClassroomSignupStudentOption[];
  readOnly?: boolean;
  onSubmitted?: (response: ClassroomSignupResponse, allResponses: ClassroomSignupResponse[]) => void;
  onWithdrawn?: (familyId: string, allResponses: ClassroomSignupResponse[]) => void;
};

export function ParentClassroomSignupResponseForm({
  organizationId,
  signup,
  existingResponse,
  allResponses,
  studentOptions,
  readOnly = false,
  onSubmitted,
  onWithdrawn,
}: ParentClassroomSignupResponseFormProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [studentId, setStudentId] = useState(
    existingResponse?.studentId ?? studentOptions[0]?.id ?? '',
  );
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>(
    existingResponse?.selectedSlotIds ?? [],
  );
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    existingResponse?.selectedRoleIds ?? [],
  );
  const [note, setNote] = useState(existingResponse?.note ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const hasResponse = existingResponse != null && existingResponse.status === 'confirmed';

  const toggleSlot = (slotId: string) => {
    if (readOnly) return;
    const slot = signup.config.slots?.find((s) => s.id === slotId);
    if (!slot) return;
    if (isSlotFull(slotId, slot.capacity, allResponses) && !selectedSlotIds.includes(slotId)) {
      return;
    }

    if (signup.config.allowMultipleSelections) {
      setSelectedSlotIds((current) =>
        current.includes(slotId)
          ? current.filter((id) => id !== slotId)
          : [...current, slotId],
      );
    } else {
      setSelectedSlotIds([slotId]);
    }
  };

  const toggleRole = (roleId: string) => {
    if (readOnly) return;
    const role = signup.config.roles?.find((r) => r.id === roleId);
    if (!role) return;
    if (
      isRoleFull(roleId, role.quantityNeeded, allResponses) &&
      !selectedRoleIds.includes(roleId)
    ) {
      return;
    }

    setSelectedRoleIds((current) =>
      current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId],
    );
  };

  const canSubmit = () => {
    if (readOnly) return false;
    if (signup.signupType === 'time_slots') return selectedSlotIds.length > 0;
    if (signup.signupType === 'roles') return selectedRoleIds.length > 0;
    return note.trim().length > 0;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await submitParentClassroomSignupResponse(signup.id, {
        organizationId,
        studentId,
        selectedSlotIds,
        selectedRoleIds,
        note: note.trim() || null,
      });

      const nextResponses = [
        ...allResponses.filter((entry) => entry.familyId !== response.familyId),
        response,
      ];

      setFeedback({ type: 'success', message: 'Your signup was saved.' });
      onSubmitted?.(response, nextResponses);
    } catch (error) {
      reportError('classroom_signups.submit', error);
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit response.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (readOnly) return;
    setWithdrawing(true);
    setFeedback(null);

    try {
      const response = await withdrawParentClassroomSignupResponse(organizationId, signup.id);
      const familyId = existingResponse?.familyId ?? response.familyId;
      const nextResponses = allResponses.filter((entry) => entry.familyId !== familyId);

      setFeedback({ type: 'success', message: 'Your response was withdrawn.' });
      onWithdrawn?.(familyId, nextResponses);
    } catch (error) {
      reportError('classroom_signups.withdraw', error);
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to withdraw response.',
      });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <View style={styles.container}>
      {studentOptions.length > 1 ? (
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: theme.muted }]}>STUDENT</Text>
          <View style={styles.studentOptions}>
            {studentOptions.map((student) => {
              const selected = studentId === student.id;
              const locked = readOnly || hasResponse;
              return (
                <Pressable
                  key={student.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: locked }}
                  disabled={locked}
                  onPress={() => setStudentId(student.id)}
                  style={({ pressed }) => [
                    styles.studentChip,
                    {
                      backgroundColor: selected ? theme.primarySoft : '#FFFFFF',
                      borderColor: selected ? theme.primary : '#DCE4DC',
                    },
                    pressed && !locked && { opacity: 0.9 },
                  ]}>
                  <Text
                    style={[
                      styles.studentChipLabel,
                      { color: selected ? theme.primary : theme.ink },
                    ]}>
                    {student.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {signup.signupType === 'time_slots' ? (
        <View style={styles.optionList}>
          {(signup.config.slots ?? []).map((slot) => (
            <ParentClassroomSignupSlotCard
              key={slot.id}
              slot={slot}
              fillCount={getSlotFillCount(slot.id, allResponses)}
              selected={selectedSlotIds.includes(slot.id)}
              disabled={readOnly}
              readOnly={readOnly}
              onSelect={() => toggleSlot(slot.id)}
            />
          ))}
        </View>
      ) : null}

      {signup.signupType === 'roles' ? (
        <View style={styles.optionList}>
          {(signup.config.roles ?? []).map((role) => (
            <ParentClassroomSignupRoleCard
              key={role.id}
              role={role}
              fillCount={getRoleFillCount(role.id, allResponses)}
              selected={selectedRoleIds.includes(role.id)}
              disabled={readOnly}
              readOnly={readOnly}
              onToggle={() => toggleRole(role.id)}
            />
          ))}
        </View>
      ) : null}

      {signup.signupType === 'open' ? (
        <StoryTextField
          label={signup.config.parentPrompt ?? 'How can you help?'}
          value={note}
          editable={!readOnly}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.textArea}
        />
      ) : null}

      {feedback ? (
        <StoryChip
          label={feedback.message}
          tone={feedback.type === 'success' ? 'success' : 'warning'}
        />
      ) : null}

      {!readOnly ? (
        <View style={styles.actions}>
          <StoryButton
            label={
              submitting
                ? 'Saving…'
                : hasResponse
                  ? 'Update response'
                  : 'Confirm signup'
            }
            onPress={() => void handleSubmit()}
            disabled={!canSubmit() || submitting || withdrawing}
          />
          {submitting ? <ActivityIndicator color={theme.primary} /> : null}
          {hasResponse ? (
            <StoryButton
              label={withdrawing ? 'Withdrawing…' : 'Withdraw'}
              variant="outline"
              onPress={() => void handleWithdraw()}
              disabled={submitting || withdrawing}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  studentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  studentChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  studentChipLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    fontWeight: '500',
  },
  optionList: {
    gap: Spacing.two,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  actions: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
});
