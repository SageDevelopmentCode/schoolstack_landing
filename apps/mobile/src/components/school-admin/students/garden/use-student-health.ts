import { useCallback, useEffect, useRef, useState } from 'react';

import type { HealthFormValues } from '@/components/school-admin/students/student-health-form-sheet';
import {
  createStudentHealthItemAdmin,
  deleteStudentHealthItemAdmin,
  fetchStudentHealthProfileAdmin,
  updateStudentHealthItemAdmin,
} from '@/lib/school-admin-api';
import {
  emptyStudentHealthProfile,
  type HealthItemType,
  type StudentHealthProfile,
} from '@/lib/student-health/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type HealthFormState =
  | { mode: 'closed' }
  | { mode: 'create'; itemType: HealthItemType }
  | { mode: 'edit'; itemType: HealthItemType; itemId: string; values: HealthFormValues };

function valuesToPayload(values: HealthFormValues): Record<string, unknown> {
  if (values.type === 'allergy') {
    return { allergen: values.allergen, severity: values.severity, treatmentNotes: values.treatmentNotes };
  }
  if (values.type === 'medication') {
    return {
      name: values.name,
      dose: values.dose,
      timeOfDay: values.timeOfDay,
      instructions: values.instructions,
      startDate: values.startDate,
      ongoing: values.ongoing,
    };
  }
  return { title: values.title, details: values.details, startDate: values.startDate };
}

/**
 * Health profile data and saves for one student (moved from `student-health-tab.tsx`,
 * same API calls and `reportError` operations). Saves and deletes report, then
 * rethrow; the Garden view decides what to show (no `Alert`s here).
 */
export function useStudentHealth({
  slug,
  studentId,
  onProfileChange,
}: {
  slug: string;
  studentId: string;
  onProfileChange?: (profile: StudentHealthProfile) => void;
}) {
  const { reportError } = useMobileErrorReporter();
  const onProfileChangeRef = useRef(onProfileChange);
  useEffect(() => {
    onProfileChangeRef.current = onProfileChange;
  }, [onProfileChange]);

  const [profile, setProfile] = useState<StudentHealthProfile>(emptyStudentHealthProfile());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<HealthFormState>({ mode: 'closed' });
  const [saving, setSaving] = useState(false);

  const refreshProfile = useCallback(async () => {
    try {
      const nextProfile = await fetchStudentHealthProfileAdmin(slug, studentId);
      setProfile(nextProfile);
      onProfileChangeRef.current?.(nextProfile);
      return nextProfile;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load health profile.');
      setProfile(emptyStudentHealthProfile());
      throw loadError;
    }
  }, [slug, studentId]);

  const retryLoad = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshProfile();
    } catch {
      // error state set in refreshProfile
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });
    void (async () => {
      try {
        const nextProfile = await fetchStudentHealthProfileAdmin(slug, studentId);
        if (cancelled) return;
        setProfile(nextProfile);
        onProfileChangeRef.current?.(nextProfile);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load health profile.');
        setProfile(emptyStudentHealthProfile());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, studentId]);

  /** Create or update from the open form. Reports and rethrows on failure. */
  const save = useCallback(
    async (values: HealthFormValues) => {
      setSaving(true);
      try {
        const payload = valuesToPayload(values);
        if (formState.mode === 'edit') {
          await updateStudentHealthItemAdmin(slug, studentId, formState.itemId, formState.itemType, payload);
        } else {
          await createStudentHealthItemAdmin(slug, studentId, values.type, payload);
        }
        await refreshProfile();
      } catch (saveError) {
        reportError('school_admin_student_health_save', saveError, {
          entityType: 'student',
          entityId: studentId,
          metadata: { itemType: formState.mode === 'edit' ? formState.itemType : values.type },
        });
        throw saveError;
      } finally {
        setSaving(false);
      }
    },
    [formState, refreshProfile, reportError, slug, studentId],
  );

  /** Delete one item. Reports and rethrows on failure. */
  const remove = useCallback(
    async (itemType: HealthItemType, itemId: string) => {
      try {
        await deleteStudentHealthItemAdmin(slug, studentId, itemId);
        await refreshProfile();
      } catch (deleteError) {
        reportError('school_admin_student_health_delete', deleteError, {
          entityType: 'student',
          entityId: studentId,
          metadata: { itemType, itemId },
        });
        throw deleteError;
      }
    },
    [refreshProfile, reportError, slug, studentId],
  );

  return { profile, loading, error, retryLoad, formState, setFormState, saving, save, remove };
}

export type StudentHealth = ReturnType<typeof useStudentHealth>;
