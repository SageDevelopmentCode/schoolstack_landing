import { StyleSheet, Text, View } from 'react-native';

import { SignupOptionCard } from '@/components/parent/classroom-signups/garden/signup-option-card';
import {
  chooseStepLabel,
  formatTimeRange,
} from '@/components/parent/classroom-signups/garden/signups-garden-ui';
import type { SignupResponseForm } from '@/components/parent/classroom-signups/garden/use-signup-response-form';
import { GChoiceChips, GTextField } from '@/components/parent/garden/fields';
import { GStepList, type GStep } from '@/components/parent/garden/steps';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GOutlineButton, GToyButton } from '@/components/parent/garden/ui';
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ParentClassroomSignupStudentOption,
} from '@/lib/parent/parent-classroom-signups-types';
import {
  getRoleFillCount,
  getSlotFillCount,
} from '@/lib/parent/parent-classroom-signups-utils';

function buildSteps(
  signup: ClassroomSignup,
  form: SignupResponseForm,
  showChildStep: boolean,
): GStep[] {
  const steps: GStep[] = [];
  if (showChildStep) {
    steps.push({ id: 'child', title: 'Choose your child', state: form.studentId ? 'done' : 'current' });
  }
  steps.push({
    id: 'choose',
    title: chooseStepLabel(signup),
    state: form.choiceMade ? 'done' : 'current',
  });
  const confirmed = form.hasResponse && !form.isDirty;
  steps.push({
    id: 'confirm',
    title: form.hasResponse ? 'Save your changes' : 'Confirm',
    meta: confirmed ? 'Your signup is saved.' : null,
    state: confirmed ? 'done' : form.choiceMade ? 'current' : 'todo',
    chip: confirmed ? { label: 'Saved', tone: 'success' } : null,
  });
  return steps;
}

/** The parent's answer: steps → child → slots / roles / note → confirm. */
export function SignupResponseCard({
  signup,
  form,
  allResponses,
  studentOptions,
}: {
  signup: ClassroomSignup;
  form: SignupResponseForm;
  allResponses: ClassroomSignupResponse[];
  studentOptions: ParentClassroomSignupStudentOption[];
}) {
  const showChildStep = studentOptions.length > 1;
  const multipleSlots = Boolean(signup.config.allowMultipleSelections);
  const busy = form.submitting || form.withdrawing;

  return (
    <GCard
      index={3}
      title={form.closed ? 'What you signed up for' : chooseStepLabel(signup)}
      testID="parent-signup-response-card"
      bodyStyle={styles.body}>
      {!form.closed ? (
        <GStepList
          steps={buildSteps(signup, form, showChildStep)}
          accessibilityLabel="Signup progress"
          style={styles.steps}
        />
      ) : null}

      {showChildStep ? (
        <GChoiceChips
          label="Who's helping for"
          options={studentOptions.map((student) => ({ id: student.id, label: student.name }))}
          value={form.studentId || null}
          onChange={form.selectStudent}
          disabled={form.readOnly || form.hasResponse}
          onBlocked={form.onStudentBlocked}
          helper={form.hasResponse && !form.closed ? 'Withdraw to change the child.' : undefined}
        />
      ) : null}

      {signup.signupType === 'time_slots' ? (
        <View style={styles.options}>
          {!form.closed ? (
            <Text style={styles.helper}>
              {multipleSlots ? 'Pick as many times as you like.' : 'Pick one time.'}
            </Text>
          ) : null}
          {(signup.config.slots ?? []).map((slot) => (
            <SignupOptionCard
              key={slot.id}
              testID={`parent-signup-slot-${slot.id}`}
              title={slot.label}
              date={slot.date || null}
              lines={[formatTimeRange(slot.startTime, slot.endTime)]}
              fillCount={getSlotFillCount(slot.id, allResponses)}
              capacity={slot.capacity}
              selected={form.selectedSlotIds.includes(slot.id)}
              multiple={multipleSlots}
              interactive={!form.closed}
              onPress={() => form.toggleSlot(slot.id)}
            />
          ))}
        </View>
      ) : null}

      {signup.signupType === 'roles' ? (
        <View style={styles.options}>
          {!form.closed ? (
            <Text style={styles.helper}>Choose one or more roles.</Text>
          ) : null}
          {(signup.config.roles ?? []).map((role) => (
            <SignupOptionCard
              key={role.id}
              testID={`parent-signup-role-${role.id}`}
              title={role.name}
              lines={role.description ? [role.description] : []}
              fillCount={getRoleFillCount(role.id, allResponses)}
              capacity={role.quantityNeeded}
              selected={form.selectedRoleIds.includes(role.id)}
              multiple
              interactive={!form.closed}
              onPress={() => form.toggleRole(role.id)}
            />
          ))}
        </View>
      ) : null}

      {signup.signupType === 'open' ? (
        <GTextField
          label={signup.config.parentPrompt ?? 'How can you help?'}
          value={form.note}
          onChangeText={form.setNote}
          disabled={form.readOnly}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="A sentence or two is plenty."
          helper={form.closed ? undefined : 'Your teacher will see this note.'}
        />
      ) : null}

      {!form.closed ? (
        <View style={styles.actions}>
          <Text
            style={[styles.hint, form.canSubmit && styles.hintReady]}
            accessibilityLiveRegion="polite">
            {form.hint}
          </Text>
          <GToyButton
            testID="parent-signup-submit"
            label={
              form.submitting
                ? 'Saving…'
                : form.hasResponse
                  ? 'Update response'
                  : 'Confirm signup'
            }
            icon={form.hasResponse ? 'checkmark' : 'arrow-forward'}
            size="md"
            fullWidth
            loading={form.submitting}
            disabled={!form.previewReadOnly && (!form.canSubmit || busy)}
            accessibilityHint={form.canSubmit ? undefined : form.hint}
            onPress={() => void form.handleSubmit()}
          />
          {form.hasResponse ? (
            <GOutlineButton
              testID="parent-signup-withdraw"
              label={form.withdrawing ? 'Withdrawing…' : 'Withdraw'}
              icon="exit-outline"
              accessibilityHint="Asks you to confirm before withdrawing"
              onPress={() => void form.handleWithdraw()}
              style={styles.withdraw}
            />
          ) : null}
        </View>
      ) : null}
    </GCard>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16 },
  steps: { marginBottom: 2 },
  options: { gap: 10 },
  helper: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  actions: { gap: 12, paddingTop: 4 },
  hint: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: Garden.soft,
    textAlign: 'center',
  },
  hintReady: { color: Garden.forest },
  withdraw: { alignSelf: 'center' },
});
