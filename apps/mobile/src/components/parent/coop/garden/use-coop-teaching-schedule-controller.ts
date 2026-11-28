import { useCallback, useEffect, useRef, useState } from 'react';

import type { CoopToggleResult } from '@/components/parent/coop/garden/use-coop-signup-feedback';
import {
  getTeachingScheduleFamilyIdsForRole,
  isTeachingParentAssigned,
  type TeachingScheduleParentRole,
} from '@/lib/parent/coop/teaching-schedule-helpers';
import {
  fetchParentCoopTeachingSchedulePageData,
  signupParentCoopTeachingSchedule,
  withdrawParentCoopTeachingSchedule,
  type ParentCoopTeachingScheduleWeek,
} from '@/lib/parent/parent-portal-api';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type CoopTeachingScheduleController = {
  status: 'loading' | 'error' | 'ready';
  error: string | null;
  weeks: ParentCoopTeachingScheduleWeek[];
  currentFamilyId: string;
  familyNameMap: Record<string, string>;
  /** `${weekId}:${role}` while a sign-up or withdraw is running. */
  pendingKey: string | null;
  readOnly: boolean;
  /** Reload keeping what is on screen (pull to refresh, Try again). */
  refresh: () => Promise<void>;
  toggleRole: (
    week: ParentCoopTeachingScheduleWeek,
    role: TeachingScheduleParentRole,
  ) => Promise<CoopToggleResult>;
};

/** Data + actions for the co-op Teaching schedule. Same endpoints and rules as before Garden. */
export function useCoopTeachingScheduleController({
  organizationId,
  programId,
}: {
  organizationId: string;
  programId: string;
}): CoopTeachingScheduleController {
  const readOnly = usePortalReadOnly();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [weeks, setWeeks] = useState<ParentCoopTeachingScheduleWeek[]>([]);
  const [currentFamilyId, setCurrentFamilyId] = useState('');
  const [familyNameMap, setFamilyNameMap] = useState<Record<string, string>>({});
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const pendingRef = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchParentCoopTeachingSchedulePageData(organizationId, programId);
      setWeeks(data.weeks);
      setCurrentFamilyId(data.currentFamilyId);
      setFamilyNameMap(data.familyNameMap);
      hasLoadedRef.current = true;
      setStatus('ready');
    } catch (loadError) {
      reportError('parent_coop_teaching_schedule_load', loadError, {
        entityType: 'program',
        entityId: programId,
      });
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load teaching schedule.',
      );
      // Keep showing the last good schedule after a failed refresh.
      if (!hasLoadedRef.current) setStatus('error');
    }
  }, [organizationId, programId, reportError]);

  useEffect(() => {
    hasLoadedRef.current = false;
    setStatus('loading');
    void load();
  }, [load]);

  const toggleRole = useCallback(
    async (
      week: ParentCoopTeachingScheduleWeek,
      role: TeachingScheduleParentRole,
    ): Promise<CoopToggleResult> => {
      if (readOnly || pendingRef.current) return { ok: null };
      pendingRef.current = true;
      setPendingKey(`${week.id}:${role}`);
      const signedUp = isTeachingParentAssigned(
        getTeachingScheduleFamilyIdsForRole(week, role),
        currentFamilyId,
      );
      try {
        const input = { organizationId, programId, weekId: week.id, role };
        const result = signedUp
          ? await withdrawParentCoopTeachingSchedule(input)
          : await signupParentCoopTeachingSchedule(input);
        setWeeks((prev) => prev.map((row) => (row.id === week.id ? result.week : row)));
        return { ok: true, signedUp: !signedUp };
      } catch (toggleError) {
        reportError('parent_coop_teaching_schedule_signup', toggleError, {
          entityType: 'program',
          entityId: programId,
        });
        await load();
        return {
          ok: false,
          wasSignedUp: signedUp,
          error:
            toggleError instanceof Error && toggleError.message
              ? toggleError.message
              : 'Unable to update sign-up.',
        };
      } finally {
        pendingRef.current = false;
        setPendingKey(null);
      }
    },
    [currentFamilyId, load, organizationId, programId, readOnly, reportError],
  );

  return {
    status,
    error,
    weeks,
    currentFamilyId,
    familyNameMap,
    pendingKey,
    readOnly,
    refresh: load,
    toggleRole,
  };
}
