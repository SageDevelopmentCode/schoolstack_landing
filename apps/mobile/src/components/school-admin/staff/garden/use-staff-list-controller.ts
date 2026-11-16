import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  deriveStaffRosterMetrics,
  filterStaffByRosterFilter,
  matchesStaffSearch,
  type StaffRosterFilter,
} from '@/lib/school-admin/admin-staff-roster-metrics';
import { createStaffMember, fetchStaffMembers, type CreateStaffMemberInput, type StaffMemberRecord } from '@/lib/school-admin-api';
import { formatStaffApiError } from '@/lib/school-admin/staff-labels';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type StaffListStatus = 'loading' | 'error' | 'ready';

/** Roster filters plus two KPI-tile filters that show as temporary chips. */
export type StaffListFilter = StaffRosterFilter | 'active' | 'with_learners';

function filterStaff(members: StaffMemberRecord[], filter: StaffListFilter): StaffMemberRecord[] {
  if (filter === 'active') return members.filter((member) => member.employmentStatus === 'active');
  if (filter === 'with_learners') return members.filter((member) => (member.assignedStudentCount ?? 0) > 0);
  return filterStaffByRosterFilter(members, filter);
}

/**
 * Data for School admin › More › Staff (no UI, no toasts). Same fetch,
 * filters, search and `reportError` operations as the Story screen.
 */
export function useStaffListController({ slug, organizationId }: { slug: string; organizationId: string }) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState<StaffListFilter>('all');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      const members = await fetchStaffMembers(slug);
      if (!mounted.current) return;
      setStaffMembers(members);
      setError(null);
      setLastUpdatedAt(Date.now());
    } catch (loadError) {
      reportError('school_admin_staff_list_load', loadError);
      if (mounted.current) setError(formatStaffApiError(loadError, 'Failed to load staff.'));
    } finally {
      if (mounted.current) setLoaded(true);
    }
  }, [reportError, slug]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const reload = useCallback(async () => {
    setLoaded(false);
    await loadStaff();
  }, [loadStaff]);

  const metrics = useMemo(() => deriveStaffRosterMetrics(staffMembers), [staffMembers]);

  const filteredStaff = useMemo(
    () => filterStaff(staffMembers, rosterFilter).filter((member) => matchesStaffSearch(member, searchQuery)),
    [rosterFilter, searchQuery, staffMembers],
  );

  const openMember = useCallback(
    (member: Pick<StaffMemberRecord, 'id'>) => router.push(`/school-admin/${slug}/more/staff/${member.id}`),
    [router, slug],
  );

  const clearFilters = useCallback(() => {
    setRosterFilter('all');
    setSearchQuery('');
  }, []);

  /** Reports and rethrows; feedback shows the result in the sheet. */
  const createMember = useCallback(
    async (input: CreateStaffMemberInput): Promise<StaffMemberRecord> => {
      setCreating(true);
      try {
        return await createStaffMember(slug, input);
      } catch (saveError) {
        reportError('school_admin_staff_create', saveError);
        throw new Error(formatStaffApiError(saveError, 'Failed to add staff member.'));
      } finally {
        if (mounted.current) setCreating(false);
      }
    },
    [reportError, slug],
  );

  const status: StaffListStatus = !loaded ? 'loading' : error && staffMembers.length === 0 && !lastUpdatedAt ? 'error' : 'ready';

  return {
    slug,
    organizationId,
    status,
    staffMembers,
    filteredStaff,
    metrics,
    error,
    lastUpdatedAt,
    searchQuery,
    setSearchQuery,
    rosterFilter,
    setRosterFilter,
    clearFilters,
    refresh: loadStaff,
    reload,
    openMember,
    addSheetOpen,
    openAddSheet: useCallback(() => setAddSheetOpen(true), []),
    closeAddSheet: useCallback(() => setAddSheetOpen(false), []),
    creating,
    createMember,
  };
}

export type StaffListController = ReturnType<typeof useStaffListController>;
