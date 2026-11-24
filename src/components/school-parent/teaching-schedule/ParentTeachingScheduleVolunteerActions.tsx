"use client";

import ParentTeachingScheduleSignupButton, {
  type ParentTeachingSchedulePendingAction,
} from "@/components/school-parent/teaching-schedule/ParentTeachingScheduleSignupButton";
import {
  canParentSignUpForTeachingRole,
  getTeachingScheduleFamilyIdsForRole,
  isTeachingParentAssigned,
  type CoopTeachingScheduleWeek,
  type TeachingScheduleParentRole,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";

type ParentTeachingScheduleVolunteerActionsProps = {
  week: CoopTeachingScheduleWeek;
  currentFamilyId: string;
  previewMode?: boolean;
  pendingAction: ParentTeachingSchedulePendingAction | null;
  onSignUp: (role: TeachingScheduleParentRole) => void;
  onWithdraw: (role: TeachingScheduleParentRole) => void;
  className?: string;
  emptyFallback?: string;
};

function roleHasVolunteerAction(
  week: CoopTeachingScheduleWeek,
  role: TeachingScheduleParentRole,
  currentFamilyId: string,
): boolean {
  const familyIds = getTeachingScheduleFamilyIdsForRole(week, role);
  return (
    isTeachingParentAssigned(familyIds, currentFamilyId) ||
    canParentSignUpForTeachingRole(familyIds)
  );
}

export default function ParentTeachingScheduleVolunteerActions({
  week,
  currentFamilyId,
  previewMode = false,
  pendingAction,
  onSignUp,
  onWithdraw,
  className = "",
  emptyFallback = "—",
}: ParentTeachingScheduleVolunteerActionsProps) {
  const roles: TeachingScheduleParentRole[] = ["instructor", "assistant"];
  const actionableRoles = roles.filter((role) =>
    roleHasVolunteerAction(week, role, currentFamilyId),
  );

  if (actionableRoles.length === 0) {
    if (!emptyFallback) return null;
    return (
      <span className={`text-[13px] font-semibold text-[var(--sf-soft)] ${className}`}>
        {emptyFallback}
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-start gap-1.5 ${className}`}>
      {actionableRoles.map((role) => (
        <ParentTeachingScheduleSignupButton
          key={role}
          week={week}
          role={role}
          currentFamilyId={currentFamilyId}
          previewMode={previewMode}
          pendingAction={pendingAction}
          onSignUp={() => onSignUp(role)}
          onWithdraw={() => onWithdraw(role)}
        />
      ))}
    </div>
  );
}
