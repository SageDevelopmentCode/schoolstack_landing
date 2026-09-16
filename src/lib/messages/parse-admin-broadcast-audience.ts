import type { AdminBroadcastAudienceInput } from "@/lib/messages/admin-broadcast-audience";

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
}

export function parseAdminBroadcastAudience(
  audience: unknown,
): AdminBroadcastAudienceInput {
  const raw = audience && typeof audience === "object" ? audience : {};
  const record = raw as Record<string, unknown>;

  return {
    programIds: uniqueStrings(record.programIds),
    classroomIds: uniqueStrings(record.classroomIds),
    gradeValues: uniqueStrings(record.gradeValues),
    guardianIds: uniqueStrings(record.guardianIds),
  };
}

export function hasAdminBroadcastAudienceSelection(
  audience: AdminBroadcastAudienceInput,
): boolean {
  return (
    (audience.programIds?.length ?? 0) > 0 ||
    (audience.classroomIds?.length ?? 0) > 0 ||
    (audience.gradeValues?.length ?? 0) > 0 ||
    (audience.guardianIds?.length ?? 0) > 0
  );
}
