"use client";

import { Loader2 } from "lucide-react";
import {
  canParentSignUpForTeachingRole,
  getTeachingScheduleParentsForRole,
  isTeachingParentAssigned,
  type CoopTeachingScheduleWeek,
  type TeachingScheduleParentRole,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type ParentTeachingSchedulePendingAction = {
  weekId: string;
  role: TeachingScheduleParentRole;
  type: "signup" | "withdraw";
};

type ParentTeachingScheduleSignupButtonProps = {
  theme: ParentThemeTokens;
  week: CoopTeachingScheduleWeek;
  role: TeachingScheduleParentRole;
  currentParentName: string;
  previewMode?: boolean;
  pendingAction: ParentTeachingSchedulePendingAction | null;
  onSignUp: () => void;
  onWithdraw: () => void;
  className?: string;
};

const compactButtonClass = "px-3 py-1.5 text-xs whitespace-nowrap";

const roleLabels: Record<TeachingScheduleParentRole, string> = {
  instructor: "instructor",
  assistant: "assistant",
};

export default function ParentTeachingScheduleSignupButton({
  theme,
  week,
  role,
  currentParentName,
  previewMode = false,
  pendingAction,
  onSignUp,
  onWithdraw,
  className = "",
}: ParentTeachingScheduleSignupButtonProps) {
  const people = getTeachingScheduleParentsForRole(week, role);
  const isSignedUp = isTeachingParentAssigned(people, currentParentName);
  const canSignUp = canParentSignUpForTeachingRole(people);
  const isPendingSignup =
    pendingAction?.weekId === week.id &&
    pendingAction.role === role &&
    pendingAction.type === "signup";
  const isPendingWithdraw =
    pendingAction?.weekId === week.id &&
    pendingAction.role === role &&
    pendingAction.type === "withdraw";

  if (isSignedUp) {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        <ParentButton
          theme={theme}
          variant="outline"
          disabled
          className={compactButtonClass}
          style={{
            color: theme.success,
            borderColor: `${theme.success}55`,
            backgroundColor: theme.successBg,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          You&apos;re signed up
        </ParentButton>
        <ParentButton
          theme={theme}
          variant="outline"
          disabled={previewMode || isPendingWithdraw}
          className={compactButtonClass}
          style={{ color: theme.muted }}
          onClick={(event) => {
            event.stopPropagation();
            onWithdraw();
          }}
        >
          {isPendingWithdraw ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Withdraw"
          )}
        </ParentButton>
      </div>
    );
  }

  if (!canSignUp) {
    return null;
  }

  return (
    <ParentButton
      theme={theme}
      variant="soft"
      disabled={previewMode || isPendingSignup}
      className={`${compactButtonClass} ${className}`}
      onClick={(event) => {
        event.stopPropagation();
        onSignUp();
      }}
    >
      {isPendingSignup ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        `Sign up as ${roleLabels[role]}`
      )}
    </ParentButton>
  );
}
