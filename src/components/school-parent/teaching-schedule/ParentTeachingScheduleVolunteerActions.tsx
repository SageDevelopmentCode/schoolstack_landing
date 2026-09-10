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
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentTeachingScheduleVolunteerActionsProps = {
  theme: ParentThemeTokens;
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
  theme,
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
    return (
      <span className={`text-xs ${className}`} style={{ color: theme.muted }}>
        {emptyFallback}
      </span>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {actionableRoles.map((role) => (
        <ParentTeachingScheduleSignupButton
          key={role}
          theme={theme}
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
