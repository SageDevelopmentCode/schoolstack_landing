import type { TeacherMyHoursPageData } from "@/lib/school-teacher/my-hours/types";

export function isDateKeyInLoadedRange(
  dateKey: string,
  rangeFrom: string,
  rangeTo: string,
): boolean {
  return dateKey >= rangeFrom && dateKey <= rangeTo;
}

export function weekRangeNeedsFetch(
  weekStartKey: string,
  weekEndKey: string,
  rangeFrom: string,
  rangeTo: string,
): boolean {
  return weekStartKey < rangeFrom || weekEndKey > rangeTo;
}

export function nextLoadedAdjustWeekToken(
  adjustWeekStartKey: string | null,
  adjustWeekEndKey: string | null,
  pageData: TeacherMyHoursPageData,
): string | null {
  if (adjustWeekStartKey == null || adjustWeekEndKey == null) {
    return null;
  }
  const token = `${adjustWeekStartKey}:${adjustWeekEndKey}`;
  return weekRangeNeedsFetch(
    adjustWeekStartKey,
    adjustWeekEndKey,
    pageData.rangeFrom,
    pageData.rangeTo,
  )
    ? null
    : token;
}

export function mergeTeacherMyHoursPageData(
  base: TeacherMyHoursPageData,
  patch: TeacherMyHoursPageData,
): TeacherMyHoursPageData {
  return {
    timezone: base.timezone,
    referenceDateKey: base.referenceDateKey,
    rangeFrom:
      patch.rangeFrom < base.rangeFrom ? patch.rangeFrom : base.rangeFrom,
    rangeTo: patch.rangeTo > base.rangeTo ? patch.rangeTo : base.rangeTo,
    activeSession: patch.activeSession ?? base.activeSession,
    entriesByDateKey: {
      ...base.entriesByDateKey,
      ...patch.entriesByDateKey,
    },
    sessionsByDateKey: {
      ...base.sessionsByDateKey,
      ...patch.sessionsByDateKey,
    },
    sidebar: base.sidebar,
    pendingAdjustmentsByDateKey: patch.pendingAdjustmentsByDateKey,
    adjustmentsRequireApproval:
      patch.adjustmentsRequireApproval ?? base.adjustmentsRequireApproval,
  };
}
