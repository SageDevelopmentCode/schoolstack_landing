import type {
  ClassroomSignup,
  ClassroomSignupMetrics,
  ClassroomSignupResponse,
  ClassroomSignupStatus,
} from "./types";

export type SignupProgress = {
  filled: number;
  total: number;
  label: string;
  isComplete: boolean;
};

function countSlotResponses(
  signup: ClassroomSignup,
  responses: ClassroomSignupResponse[],
): SignupProgress {
  const slots = signup.config.slots ?? [];
  const confirmed = responses.filter((r) => r.status === "confirmed");
  const total = slots.reduce((sum, slot) => sum + slot.capacity, 0);
  const filled = slots.reduce((sum, slot) => {
    const count = confirmed.filter((r) =>
      r.selectedSlotIds.includes(slot.id),
    ).length;
    return sum + Math.min(count, slot.capacity);
  }, 0);

  return {
    filled,
    total,
    label: total > 0 ? `${filled}/${total} slots filled` : "No slots configured",
    isComplete: total > 0 && filled >= total,
  };
}

function countRoleResponses(
  signup: ClassroomSignup,
  responses: ClassroomSignupResponse[],
): SignupProgress {
  const roles = signup.config.roles ?? [];
  const confirmed = responses.filter((r) => r.status === "confirmed");
  const total = roles.reduce((sum, role) => sum + role.quantityNeeded, 0);
  const filled = roles.reduce((sum, role) => {
    const count = confirmed.filter((r) =>
      r.selectedRoleIds.includes(role.id),
    ).length;
    return sum + Math.min(count, role.quantityNeeded);
  }, 0);

  return {
    filled,
    total,
    label: total > 0 ? `${filled}/${total} roles filled` : "No roles configured",
    isComplete: total > 0 && filled >= total,
  };
}

function countOpenResponses(
  responses: ClassroomSignupResponse[],
  maxFamilies?: number,
): SignupProgress {
  const confirmed = responses.filter((r) => r.status === "confirmed").length;
  const total = maxFamilies ?? confirmed;
  const label =
    maxFamilies != null
      ? `${confirmed}/${maxFamilies} families signed up`
      : `${confirmed} ${confirmed === 1 ? "family" : "families"} signed up`;

  return {
    filled: confirmed,
    total: maxFamilies ?? Math.max(confirmed, 1),
    label,
    isComplete: maxFamilies != null ? confirmed >= maxFamilies : false,
  };
}

export function getSignupProgress(
  signup: ClassroomSignup,
  responses: ClassroomSignupResponse[],
): SignupProgress {
  switch (signup.signupType) {
    case "time_slots":
      return countSlotResponses(signup, responses);
    case "roles":
      return countRoleResponses(signup, responses);
    case "open":
      return countOpenResponses(responses, signup.config.maxFamilies);
  }
}

export function getSlotFillCount(
  slotId: string,
  responses: ClassroomSignupResponse[],
): number {
  return responses.filter(
    (r) => r.status === "confirmed" && r.selectedSlotIds.includes(slotId),
  ).length;
}

export function getRoleFillCount(
  roleId: string,
  responses: ClassroomSignupResponse[],
): number {
  return responses.filter(
    (r) => r.status === "confirmed" && r.selectedRoleIds.includes(roleId),
  ).length;
}

export function isSlotFull(
  slotId: string,
  capacity: number,
  responses: ClassroomSignupResponse[],
): boolean {
  return getSlotFillCount(slotId, responses) >= capacity;
}

export function isRoleFull(
  roleId: string,
  quantityNeeded: number,
  responses: ClassroomSignupResponse[],
): boolean {
  return getRoleFillCount(roleId, responses) >= quantityNeeded;
}

export function formatAudienceLabel(signup: ClassroomSignup): string {
  if (signup.audience === "assigned") {
    return `${signup.familyCount} assigned ${signup.familyCount === 1 ? "family" : "families"}`;
  }
  const classroom = signup.classroomName ?? "Classroom";
  return `${classroom} · ${signup.familyCount} families`;
}

export function filterSignupsByStatus(
  signups: ClassroomSignup[],
  status: ClassroomSignupStatus | "all",
): ClassroomSignup[] {
  if (status === "all") return signups;
  return signups.filter((signup) => signup.status === status);
}

export function computeSignupMetrics(
  signups: ClassroomSignup[],
  responsesBySignupId: Record<string, ClassroomSignupResponse[]>,
): ClassroomSignupMetrics {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  let responsesThisWeek = 0;
  let needsAttentionCount = 0;

  for (const signup of signups) {
    const responses = responsesBySignupId[signup.id] ?? [];
    responsesThisWeek += responses.filter((r) => {
      const created = new Date(r.createdAt);
      return created >= weekAgo && r.status === "confirmed";
    }).length;

    if (signup.status !== "open") continue;

    const progress = getSignupProgress(signup, responses);
    const pastDue =
      signup.responseDeadline != null &&
      new Date(signup.responseDeadline) < now;

    if (!progress.isComplete || pastDue) {
      needsAttentionCount += 1;
    }
  }

  return {
    openCount: signups.filter((s) => s.status === "open").length,
    responsesThisWeek,
    needsAttentionCount,
  };
}

export function formatSignupDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function countUnrespondedFamilies(
  signup: ClassroomSignup,
  responses: ClassroomSignupResponse[],
): number {
  const respondedFamilyIds = new Set(
    responses
      .filter((r) => r.status === "confirmed")
      .map((r) => r.familyId),
  );
  return Math.max(0, signup.familyCount - respondedFamilyIds.size);
}
