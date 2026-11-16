import { useCallback, useMemo, useRef, useState } from 'react';

import {
  missingChoiceHint,
  selectionSummary,
} from '@/components/parent/classroom-signups/garden/signups-garden-ui';
import { confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import { haptic } from '@/lib/haptics';
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ParentClassroomSignupStudentOption,
} from '@/lib/parent/parent-classroom-signups-types';
import {
  isRoleFull,
  isSlotFull,
  responsesExcludingFamily,
} from '@/lib/parent/parent-classroom-signups-utils';
import {
  submitParentClassroomSignupResponse,
  withdrawParentClassroomSignupResponse,
} from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
}

/**
 * Response form state for one signup. Selection guards, the submit / withdraw
 * payloads and error reporting are unchanged from the Story form; this adds the
 * Garden feedback (toasts, haptics, confirm before withdrawing).
 */
export function useSignupResponseForm({
  organizationId,
  signup,
  existingResponse,
  allResponses,
  studentOptions,
  closed,
  onSubmitted,
  onWithdrawn,
}: {
  organizationId: string;
  signup: ClassroomSignup;
  existingResponse: ClassroomSignupResponse | null;
  allResponses: ClassroomSignupResponse[];
  studentOptions: ParentClassroomSignupStudentOption[];
  /** The signup is closed: show the family's answer, no actions. */
  closed: boolean;
  onSubmitted: (response: ClassroomSignupResponse, allResponses: ClassroomSignupResponse[]) => void;
  onWithdrawn: (familyId: string, allResponses: ClassroomSignupResponse[]) => void;
}) {
  const toast = useGardenToast();
  const { readOnly: previewReadOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const { reportError } = useMobileErrorReporter(organizationId);
  /** Same as the Story form's `readOnly`: closed or previewing. */
  const readOnly = closed || previewReadOnly;

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
  const [justSignedUp, setJustSignedUp] = useState(false);
  const submitRef = useRef<() => Promise<void>>(async () => {});

  const hasResponse = existingResponse != null && existingResponse.status === 'confirmed';

  const responsesForCapacityCheck = useMemo(
    () => responsesExcludingFamily(allResponses, existingResponse?.familyId),
    [allResponses, existingResponse?.familyId],
  );

  const notifyFull = useCallback(() => {
    haptic.warning();
    toast.warning("That one's full", {
      id: `signup-full-${signup.id}`,
      description: 'Pick another option, or check back later.',
      durationMs: 3200,
    });
  }, [signup.id, toast]);

  const toggleSlot = useCallback(
    (slotId: string) => {
      if (closed) return;
      if (previewReadOnly) {
        notifyReadOnly();
        return;
      }
      const slot = signup.config.slots?.find((s) => s.id === slotId);
      if (!slot) return;
      if (
        isSlotFull(slotId, slot.capacity, responsesForCapacityCheck) &&
        !selectedSlotIds.includes(slotId)
      ) {
        notifyFull();
        return;
      }

      haptic.select();
      if (signup.config.allowMultipleSelections) {
        setSelectedSlotIds((current) =>
          current.includes(slotId) ? current.filter((id) => id !== slotId) : [...current, slotId],
        );
      } else {
        setSelectedSlotIds([slotId]);
      }
    },
    [
      closed,
      notifyFull,
      notifyReadOnly,
      previewReadOnly,
      responsesForCapacityCheck,
      selectedSlotIds,
      signup.config.allowMultipleSelections,
      signup.config.slots,
    ],
  );

  const toggleRole = useCallback(
    (roleId: string) => {
      if (closed) return;
      if (previewReadOnly) {
        notifyReadOnly();
        return;
      }
      const role = signup.config.roles?.find((r) => r.id === roleId);
      if (!role) return;
      if (
        isRoleFull(roleId, role.quantityNeeded, responsesForCapacityCheck) &&
        !selectedRoleIds.includes(roleId)
      ) {
        notifyFull();
        return;
      }

      haptic.select();
      setSelectedRoleIds((current) =>
        current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId],
      );
    },
    [
      closed,
      notifyFull,
      notifyReadOnly,
      previewReadOnly,
      responsesForCapacityCheck,
      selectedRoleIds,
      signup.config.roles,
    ],
  );

  const choiceMade =
    signup.signupType === 'time_slots'
      ? selectedSlotIds.length > 0
      : signup.signupType === 'roles'
        ? selectedRoleIds.length > 0
        : note.trim().length > 0;

  const canSubmit = !readOnly && choiceMade;

  const isDirty =
    !hasResponse ||
    studentId !== existingResponse?.studentId ||
    !sameSet(selectedSlotIds, existingResponse?.selectedSlotIds ?? []) ||
    !sameSet(selectedRoleIds, existingResponse?.selectedRoleIds ?? []) ||
    note.trim() !== (existingResponse?.note ?? '').trim();

  const summary = selectionSummary(signup, selectedSlotIds, selectedRoleIds, note);

  const handleSubmit = useCallback(async () => {
    if (previewReadOnly) {
      notifyReadOnly();
      return;
    }
    if (!canSubmit || submitting || withdrawing) return;
    setSubmitting(true);
    toast.dismiss(`signup-error-${signup.id}`);

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

      toast.success(hasResponse ? 'Signup updated' : "You're signed up", {
        id: `signup-saved-${signup.id}`,
        description: `${signup.title}${summary ? ` · ${summary}` : ''}. You can change or withdraw while it's open.`,
        durationMs: 5200,
      });
      if (!hasResponse) setJustSignedUp(true);
      onSubmitted(response, nextResponses);
    } catch (error) {
      reportError('classroom_signups.submit', error);
      toast.error("Couldn't save your signup", {
        id: `signup-error-${signup.id}`,
        description: `${error instanceof Error ? error.message : 'Failed to submit response.'} Your choices are still here.`,
        action: { label: 'Try again', onPress: () => void submitRef.current() },
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    allResponses,
    canSubmit,
    hasResponse,
    note,
    notifyReadOnly,
    onSubmitted,
    organizationId,
    previewReadOnly,
    reportError,
    selectedRoleIds,
    selectedSlotIds,
    signup.id,
    signup.title,
    studentId,
    submitting,
    summary,
    toast,
    withdrawing,
  ]);
  submitRef.current = handleSubmit;

  const withdrawNow = useCallback(async () => {
    setWithdrawing(true);
    toast.dismiss(`signup-error-${signup.id}`);

    try {
      const withdrawStudentId = existingResponse?.studentId ?? studentId;
      const response = await withdrawParentClassroomSignupResponse(
        organizationId,
        signup.id,
        withdrawStudentId,
      );
      const familyId = existingResponse?.familyId ?? response.familyId;
      const nextResponses = allResponses.filter((entry) => entry.familyId !== familyId);

      toast.success("You've withdrawn", {
        id: `signup-withdrawn-${signup.id}`,
        description: `${signup.title} is back in Needs response if you change your mind.`,
      });
      setJustSignedUp(false);
      onWithdrawn(familyId, nextResponses);
    } catch (error) {
      reportError('classroom_signups.withdraw', error);
      toast.error("Couldn't withdraw", {
        id: `signup-error-${signup.id}`,
        description: `${error instanceof Error ? error.message : 'Failed to withdraw response.'} You're still signed up.`,
      });
    } finally {
      setWithdrawing(false);
    }
  }, [
    allResponses,
    existingResponse?.familyId,
    existingResponse?.studentId,
    onWithdrawn,
    organizationId,
    reportError,
    signup.id,
    signup.title,
    studentId,
    toast,
  ]);

  const handleWithdraw = useCallback(async () => {
    if (closed) return;
    if (previewReadOnly) {
      notifyReadOnly();
      return;
    }
    if (submitting || withdrawing) return;
    const confirmed = await confirmDestructive({
      title: 'Withdraw from this signup?',
      message: `Your teacher will no longer see you signed up for ${signup.title}. You can sign up again while it's open.`,
      confirmLabel: 'Withdraw',
      cancelLabel: 'Stay signed up',
    });
    if (confirmed) await withdrawNow();
  }, [closed, notifyReadOnly, previewReadOnly, signup.title, submitting, withdrawing, withdrawNow]);

  const selectStudent = useCallback(
    (id: string) => {
      if (closed) return;
      if (previewReadOnly) {
        notifyReadOnly();
        return;
      }
      setStudentId(id);
    },
    [closed, notifyReadOnly, previewReadOnly],
  );

  const onStudentBlocked = useCallback(() => {
    if (previewReadOnly) {
      notifyReadOnly();
      return;
    }
    if (hasResponse && !closed) {
      toast.info('Withdraw to change the child', {
        id: `signup-child-locked-${signup.id}`,
        description: 'Your signup is saved for this child. Withdraw first to sign up someone else.',
      });
    }
  }, [closed, hasResponse, notifyReadOnly, previewReadOnly, signup.id, toast]);

  let hint: string;
  if (closed) hint = 'This signup is closed.';
  else if (previewReadOnly) hint = "Preview mode — signups can't be answered here.";
  else if (!choiceMade) hint = missingChoiceHint(signup);
  else if (hasResponse && !isDirty) hint = "You're signed up. Change your choices to update.";
  else hint = hasResponse ? 'Ready to update your response' : 'Ready to confirm';

  return {
    readOnly,
    previewReadOnly,
    closed,
    hasResponse,
    studentId,
    selectStudent,
    onStudentBlocked,
    selectedSlotIds,
    selectedRoleIds,
    toggleSlot,
    toggleRole,
    note,
    setNote,
    choiceMade,
    canSubmit,
    isDirty,
    submitting,
    withdrawing,
    justSignedUp,
    hint,
    handleSubmit,
    handleWithdraw,
  };
}

export type SignupResponseForm = ReturnType<typeof useSignupResponseForm>;
