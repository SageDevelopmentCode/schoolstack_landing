"use client";

import { Loader2 } from "lucide-react";
import {
  canParentSignUpForTeachingRole,
  getTeachingScheduleFamilyIdsForRole,
  isTeachingParentAssigned,
  type CoopTeachingScheduleWeek,
  type TeachingScheduleParentRole,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";
import { Tick } from "@/components/garden/ui";
import { GChip, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";

export type ParentTeachingSchedulePendingAction = {
  weekId: string;
  role: TeachingScheduleParentRole;
  type: "signup" | "withdraw";
};

type ParentTeachingScheduleSignupButtonProps = {
  week: CoopTeachingScheduleWeek;
  role: TeachingScheduleParentRole;
  currentFamilyId: string;
  previewMode?: boolean;
  pendingAction: ParentTeachingSchedulePendingAction | null;
  onSignUp: () => void;
  onWithdraw: () => void;
  className?: string;
};

const roleLabels: Record<TeachingScheduleParentRole, string> = {
  instructor: "instructor",
  assistant: "assistant",
};

/**
 * One role's volunteer control (Garden). Rows never get toy buttons: sign up
 * is an outline pill; signed up is a mint chip with a tick + a Withdraw link.
 */
export default function ParentTeachingScheduleSignupButton({
  week,
  role,
  currentFamilyId,
  previewMode = false,
  pendingAction,
  onSignUp,
  onWithdraw,
  className = "",
}: ParentTeachingScheduleSignupButtonProps) {
  const familyIds = getTeachingScheduleFamilyIdsForRole(week, role);
  const isSignedUp = isTeachingParentAssigned(familyIds, currentFamilyId);
  const canSignUp = canParentSignUpForTeachingRole(familyIds);
  const isPendingSignup =
    pendingAction?.weekId === week.id && pendingAction.role === role && pendingAction.type === "signup";
  const isPendingWithdraw =
    pendingAction?.weekId === week.id && pendingAction.role === role && pendingAction.type === "withdraw";

  if (isSignedUp) {
    return (
      <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 ${className}`}>
        <GChip tone="success" className="whitespace-nowrap py-1">
          <Tick className="h-3.5 w-3.5" />
          You&apos;re signed up · {roleLabels[role]}
        </GChip>
        <button
          type="button"
          className={`${gLinkSm} !text-[13px] disabled:cursor-not-allowed disabled:opacity-50`}
          disabled={previewMode || isPendingWithdraw}
          aria-busy={isPendingWithdraw || undefined}
          aria-label={`Withdraw as ${roleLabels[role]}`}
          onClick={(event) => {
            event.stopPropagation();
            onWithdraw();
          }}
        >
          {isPendingWithdraw ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          Withdraw
        </button>
      </div>
    );
  }

  if (!canSignUp) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={previewMode || isPendingSignup}
      aria-busy={isPendingSignup || undefined}
      className={`${gBtnOutlineSm} !px-3.5 !py-1.5 whitespace-nowrap hover:bg-[var(--sf-accent-wash)] ${className}`}
      onClick={(event) => {
        event.stopPropagation();
        onSignUp();
      }}
    >
      {isPendingSignup ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
      Sign up as {roleLabels[role]}
    </button>
  );
}
