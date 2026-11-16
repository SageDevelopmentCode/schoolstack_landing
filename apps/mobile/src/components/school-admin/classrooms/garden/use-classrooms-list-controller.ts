import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ClassroomFormInput } from '@/components/school-admin/classrooms/garden/admin-classroom-form-sheet';
import type { ClassroomStatus, ClassroomSummary, ProgramOption } from '@/lib/school-admin/classrooms';
import { createClassroomApi, fetchClassrooms } from '@/lib/school-admin-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type ClassroomListFilter = 'all' | ClassroomStatus | 'no_lead';

/**
 * Data for School admin › More › Classrooms (no UI, no toasts). Same fetch,
 * search and `reportError` operations as the Story screen.
 */
export function useClassroomsListController({ slug, organizationId }: { slug: string; organizationId: string }) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ClassroomListFilter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadClassrooms = useCallback(async () => {
    try {
      const payload = await fetchClassrooms(slug);
      if (!mounted.current) return;
      setClassrooms(payload.classrooms);
      setPrograms(payload.programs);
      setError(null);
      setLastUpdatedAt(Date.now());
    } catch (loadError) {
      reportError('school_admin_classrooms_load', loadError);
      if (mounted.current) setError(loadError instanceof Error ? loadError.message : 'Failed to load classrooms.');
    } finally {
      if (mounted.current) setLoaded(true);
    }
  }, [reportError, slug]);

  useEffect(() => {
    void loadClassrooms();
  }, [loadClassrooms]);

  const reload = useCallback(async () => {
    setLoaded(false);
    await loadClassrooms();
  }, [loadClassrooms]);

  const totalStudents = useMemo(() => classrooms.reduce((sum, classroom) => sum + classroom.studentCount, 0), [classrooms]);

  const counts = useMemo(
    () => ({
      all: classrooms.length,
      open: classrooms.filter((room) => room.status === 'open').length,
      full: classrooms.filter((room) => room.status === 'full').length,
      inactive: classrooms.filter((room) => room.status === 'inactive').length,
      no_lead: classrooms.filter((room) => room.leadTeacherNames.length === 0 && room.status !== 'inactive').length,
    }),
    [classrooms],
  );

  const filteredClassrooms = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return classrooms.filter((classroom) => {
      if (filter === 'no_lead' && (classroom.leadTeacherNames.length > 0 || classroom.status === 'inactive')) return false;
      if (filter !== 'all' && filter !== 'no_lead' && classroom.status !== filter) return false;
      if (!normalized) return true;
      return [classroom.name, classroom.programName ?? '', classroom.leadTeacherNames.join(' '), classroom.status]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [classrooms, filter, searchQuery]);

  /** Reports and rethrows; the sheet shows the result. */
  const createClassroom = useCallback(
    async (input: ClassroomFormInput): Promise<ClassroomSummary> => {
      setCreating(true);
      try {
        const created = await createClassroomApi(slug, input);
        await loadClassrooms();
        return created;
      } catch (saveError) {
        reportError('school_admin_classroom_save', saveError, { entityType: 'classroom', metadata: { mode: 'create' } });
        throw saveError instanceof Error ? saveError : new Error('Failed to save classroom.');
      } finally {
        if (mounted.current) setCreating(false);
      }
    },
    [loadClassrooms, reportError, slug],
  );

  return {
    slug,
    organizationId,
    status: (!loaded ? 'loading' : error && !lastUpdatedAt ? 'error' : 'ready') as 'loading' | 'error' | 'ready',
    classrooms,
    programs,
    filteredClassrooms,
    totalStudents,
    counts,
    error,
    lastUpdatedAt,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    clearFilters: useCallback(() => {
      setFilter('all');
      setSearchQuery('');
    }, []),
    refresh: loadClassrooms,
    reload,
    openClassroom: useCallback(
      (classroom: Pick<ClassroomSummary, 'id'>) => router.push(`/school-admin/${slug}/more/classrooms/${classroom.id}`),
      [router, slug],
    ),
    formOpen,
    openForm: useCallback(() => setFormOpen(true), []),
    closeForm: useCallback(() => setFormOpen(false), []),
    creating,
    createClassroom,
  };
}

export type ClassroomsListController = ReturnType<typeof useClassroomsListController>;
