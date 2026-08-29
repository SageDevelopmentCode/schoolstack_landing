import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  listOrgEnrolledStudents,
  listOrgStaffMembers,
  normalizeEnrolledStudentSummaries,
  type AdminEnrolledStudentSummary,
  type OrgStaffMemberRecord,
} from '@/lib/school-admin/enrolled-students';
import {
  createPortalCache,
  resolvePortalProviderInit,
} from '@/lib/portal-cache';
import { getSupabaseClient } from '@/lib/supabase';

export type SchoolAdminStudentsData = {
  students: AdminEnrolledStudentSummary[];
  staffMembers: OrgStaffMemberRecord[];
};

type SchoolAdminStudentsContextValue = {
  students: AdminEnrolledStudentSummary[];
  staffMembers: OrgStaffMemberRecord[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  staffError: string | null;
  hasLoaded: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
};

const SchoolAdminStudentsContext = createContext<SchoolAdminStudentsContextValue | null>(null);

const studentsCache = createPortalCache<SchoolAdminStudentsData>('school_admin_students:v2:');

function cacheKey(organizationId: string): string {
  return organizationId;
}

async function fetchStudentsData(organizationId: string): Promise<SchoolAdminStudentsData> {
  const supabase = getSupabaseClient();
  const [students, staffMembers] = await Promise.all([
    listOrgEnrolledStudents(supabase, organizationId),
    listOrgStaffMembers(supabase, organizationId).catch(() => [] as OrgStaffMemberRecord[]),
  ]);
  return {
    students: normalizeEnrolledStudentSummaries(students),
    staffMembers,
  };
}

function fetchAndCacheStudents(
  organizationId: string,
  options?: { refresh?: boolean },
): Promise<SchoolAdminStudentsData> {
  const key = cacheKey(organizationId);
  return studentsCache.fetchAndCache(key, () => fetchStudentsData(organizationId), options);
}

export function prefetchSchoolAdminStudents(organizationId: string): Promise<void> {
  const key = cacheKey(organizationId);
  return studentsCache.prefetch(key, () => fetchStudentsData(organizationId));
}

export async function hydrateSchoolAdminStudentsFromDisk(
  organizationId: string,
): Promise<SchoolAdminStudentsData | null> {
  return studentsCache.hydrateFromDisk(cacheKey(organizationId));
}

type SchoolAdminStudentsProviderProps = {
  children: ReactNode;
  organizationId: string;
};

export function SchoolAdminStudentsProvider({
  children,
  organizationId,
}: SchoolAdminStudentsProviderProps) {
  const key = cacheKey(organizationId);
  const cached = studentsCache.get(key);

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>(
    normalizeEnrolledStudentSummaries(cached?.students ?? []),
  );
  const [staffMembers, setStaffMembers] = useState<OrgStaffMemberRecord[]>(
    cached?.staffMembers ?? [],
  );
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  const applyData = useCallback((data: SchoolAdminStudentsData | null) => {
    setStudents(normalizeEnrolledStudentSummaries(data?.students ?? []));
    setStaffMembers(data?.staffMembers ?? []);
  }, []);

  const load = useCallback(
    async (options?: { refresh?: boolean; silent?: boolean }) => {
      const isRefresh = options?.refresh ?? false;
      const silent = options?.silent ?? false;

      if (fetchPromiseRef.current && !isRefresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        const hasCachedData = Boolean(studentsCache.get(key));
        if (isRefresh || silent) {
          if (!silent || hasCachedData) {
            setIsRefreshing(true);
          }
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);
        setStaffError(null);

        try {
          const supabase = getSupabaseClient();
          const [studentsResult, staffResult] = await Promise.allSettled([
            listOrgEnrolledStudents(supabase, organizationId),
            listOrgStaffMembers(supabase, organizationId),
          ]);

          if (studentsResult.status === 'rejected') {
            setError(
              studentsResult.reason instanceof Error
                ? studentsResult.reason.message
                : 'Failed to load students.',
            );
            setStudents([]);
            return;
          }

          const nextStaff =
            staffResult.status === 'fulfilled' ? staffResult.value : [];
          if (staffResult.status === 'rejected') {
            setStaffError(
              staffResult.reason instanceof Error
                ? staffResult.reason.message
                : 'Failed to load staff for teacher assignment.',
            );
          }

          const nextData: SchoolAdminStudentsData = {
            students: normalizeEnrolledStudentSummaries(studentsResult.value),
            staffMembers: nextStaff,
          };
          await studentsCache.fetchAndCache(key, async () => nextData, { refresh: isRefresh });
          applyData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load students.');
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
          fetchPromiseRef.current = null;
        }
      };

      const promise = run();
      if (!isRefresh) {
        fetchPromiseRef.current = promise;
      }
      await promise;
    },
    [applyData, key, organizationId],
  );

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      await load({ refresh: true, silent: options?.silent });
    },
    [load],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const resolved = await resolvePortalProviderInit(key, studentsCache, () =>
        hydrateSchoolAdminStudentsFromDisk(organizationId),
      );
      if (cancelled) return;

      applyData(resolved.data);
      setHasLoaded(resolved.hasLoaded);
      setIsLoading(resolved.isLoading);
      setError(null);
      setStaffError(null);

      if (!resolved.shouldBackgroundRefresh) {
        return;
      }

      if (resolved.data) {
        setIsRefreshing(true);
      }

      try {
        await fetchAndCacheStudents(organizationId);
        if (cancelled) return;

        applyData(studentsCache.get(key));
        setHasLoaded(Boolean(studentsCache.get(key)));
        setError(null);
        setStaffError(null);
      } catch (loadError) {
        if (!cancelled && !studentsCache.get(key)) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load students.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [applyData, key, organizationId]);

  const value = useMemo(
    () => ({
      students,
      staffMembers,
      isLoading,
      isRefreshing,
      error,
      staffError,
      hasLoaded,
      refresh,
    }),
    [error, hasLoaded, isLoading, isRefreshing, refresh, staffError, staffMembers, students],
  );

  return (
    <SchoolAdminStudentsContext.Provider value={value}>{children}</SchoolAdminStudentsContext.Provider>
  );
}

export function useSchoolAdminStudents(): SchoolAdminStudentsContextValue {
  const context = useContext(SchoolAdminStudentsContext);
  if (!context) {
    throw new Error('useSchoolAdminStudents must be used within SchoolAdminStudentsProvider');
  }
  return context;
}
