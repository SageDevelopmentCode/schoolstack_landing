import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttendanceDetailSheet } from '@/components/attendance/attendance-detail-sheet';
import {
  AttendanceDateStepper,
  AttendanceFilterChips,
  AttendanceRosterSkeleton,
  AttendanceRowSkeleton,
  AttendanceSearchField,
  AttendanceStudentRow,
  type AttendanceStatusFilter,
} from '@/components/attendance/attendance-garden-ui';
import { AttendancePickupSheet } from '@/components/attendance/attendance-pickup-sheet';
import { useAttendanceSave } from '@/components/attendance/use-attendance-save';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GLink } from '@/components/parent/garden/ui';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import { useAttendance } from '@/contexts/attendance-context';
import { calmEnter, MOTION, staggerDelay } from '@/lib/motion/portal-motion';
import { formatEnrolledStudentName } from '@/lib/teacher/teacher-home-utils';

type AttendanceRosterPanelProps = {
  title?: string;
  embedded?: boolean;
  active?: boolean;
  /**
   * `admin`: School admin › More › Attendance uses the admin tab header (accent
   * title, data status line, "Updated N min ago") and runs cream under the
   * status bar. Teacher and Dashboard copies keep the plain header.
   */
  headerVariant?: 'plain' | 'admin';
};

/** "9 of 14 marked · 3 picked up" — built only from data. */
export function attendanceStatusLine(
  summary: { totalStudents: number; notMarkedCount: number; pickedUpCount: number } | null,
): string | null {
  if (!summary) return null;
  if (summary.totalStudents === 0) return 'No students on today\'s roster';
  const marked = summary.totalStudents - summary.notMarkedCount;
  const parts = [
    summary.notMarkedCount === 0 ? `All ${summary.totalStudents} marked` : `${marked} of ${summary.totalStudents} marked`,
  ];
  if (summary.pickedUpCount > 0) parts.push(`${summary.pickedUpCount} picked up`);
  return parts.join(' · ');
}

/**
 * Attendance roster board (Garden), shared by the admin Dashboard tab, admin
 * More › Attendance and the teacher Home: date stepper with progress, search,
 * filter chips, one action per row, details and pickup sheets, and feedback on
 * every save.
 */
export function AttendanceRosterPanel({
  title = 'Attendance',
  embedded = false,
  active = true,
  headerVariant = 'plain',
}: AttendanceRosterPanelProps) {
  const insets = useSafeAreaInsets();
  const adminBleed = useAdminTopBleed();
  const adminHeader = headerVariant === 'admin' && !embedded;
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const accent = useGardenAccent();
  const {
    students,
    summary,
    activeDate,
    isLoading,
    isRefreshing,
    savingStudentId,
    error,
    loadRoster,
    refresh,
  } = useAttendance();
  const { save, announce, flashKey } = useAttendanceSave();

  const [statusFilter, setStatusFilter] = useState<AttendanceStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);
  const [pickupStudentId, setPickupStudentId] = useState<string | null>(null);
  const hasLoadedRosterRef = useRef(false);

  // Sheets read the live roster row so status updates in place after a save.
  const detailStudent = useMemo(
    () => students.find((student) => student.id === detailStudentId) ?? null,
    [detailStudentId, students],
  );
  const pickupStudent = useMemo(
    () => students.find((student) => student.id === pickupStudentId) ?? null,
    [pickupStudentId, students],
  );

  useEffect(() => {
    if (!active) return;
    void loadRoster();
  }, [active, loadRoster]);

  useEffect(() => {
    if (!isLoading && !isRefreshing) {
      hasLoadedRosterRef.current = true;
      if (adminHeader && !error) queueMicrotask(() => setLastUpdatedAt(Date.now()));
    }
  }, [adminHeader, error, isLoading, isRefreshing]);

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh,
    error,
    label: 'Attendance',
    id: 'attendance-refresh',
  });

  const rosterLoading = isLoading && !isRefreshing;
  const showListSkeleton = rosterLoading && students.length === 0 && hasLoadedRosterRef.current;

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      if (statusFilter !== 'all' && student.attendanceStatus !== statusFilter) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        student.firstName,
        student.lastName,
        formatEnrolledStudentName(student),
        student.familyName ?? '',
        ...student.classroomNames,
        ...student.programNames,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [search, statusFilter, students]);

  const handleDateChange = useCallback(
    (date: Date) => {
      void loadRoster(date);
    },
    [loadRoster],
  );

  const handleRecordPickup = useCallback((studentId: string) => {
    setDetailStudentId(null);
    setPickupStudentId(studentId);
  }, []);

  const showEveryone = useCallback(() => {
    setStatusFilter('all');
    setSearch('');
  }, []);

  const listHeader = (
    <View style={styles.headerBlock}>
      {adminHeader ? (
        <AdminTabHeader
          title={title}
          accentWord={title}
          statusLine={attendanceStatusLine(summary) ?? 'Mark present, record absences, and log pickups.'}
          lastUpdatedAt={lastUpdatedAt}
          statusTestID="attendance-status-line"
        />
      ) : !embedded ? (
        <View style={styles.titleBlock}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.subtitle}>Mark present, record absences, and log pickups.</Text>
        </View>
      ) : null}

      <AttendanceDateStepper
        activeDate={activeDate}
        summary={summary}
        loading={rosterLoading}
        error={error}
        onDateChange={handleDateChange}
      />

      <AttendanceSearchField value={search} onChangeText={setSearch} />

      <AttendanceFilterChips
        activeFilter={statusFilter}
        summary={rosterLoading ? null : summary}
        disabled={rosterLoading}
        onChange={setStatusFilter}
      />
    </View>
  );

  const screenStyle = adminHeader ? [styles.screen, adminBleed] : styles.screen;

  if (!active) {
    return <View style={screenStyle} />;
  }

  if (rosterLoading && students.length === 0 && !hasLoadedRosterRef.current) {
    return (
      <View style={screenStyle}>
        <AttendanceRosterSkeleton embedded={embedded} />
      </View>
    );
  }

  const filtered = students.length > 0 && filteredStudents.length === 0;

  return (
    <View style={screenStyle}>
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          showListSkeleton ? (
            <View style={styles.skeletonList}>
              {Array.from({ length: 6 }, (_, index) => (
                <AttendanceRowSkeleton key={index} />
              ))}
            </View>
          ) : (
            <View style={[styles.empty, error ? styles.emptyError : null]}>
              <Text style={styles.emptyText}>
                {error
                  ? error
                  : students.length === 0
                    ? 'No students have Attendance enabled for their program yet.'
                    : 'No students match your search or filter.'}
              </Text>
              {filtered ? <GLink label="Show everyone" onPress={showEveryone} /> : null}
              {error ? <GLink label="Try again" icon="refresh" onPress={() => void loadRoster()} /> : null}
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={calmEnter({ delay: staggerDelay(index), duration: MOTION.base })}>
            <AttendanceStudentRow
              student={item}
              saving={savingStudentId === item.id}
              flash={flashKey === `attendance-${item.id}`}
              onOpenDetails={() => setDetailStudentId(item.id)}
              onMarkPresent={() => void save(item, 'present')}
              onRecordPickup={() => handleRecordPickup(item.id)}
            />
          </Animated.View>
        )}
      />

      <AttendanceDetailSheet
        visible={detailStudent != null}
        student={detailStudent}
        save={save}
        onClose={() => setDetailStudentId(null)}
        onRecordPickup={() => {
          if (detailStudentId) handleRecordPickup(detailStudentId);
        }}
      />

      <AttendancePickupSheet
        visible={pickupStudent != null}
        student={pickupStudent}
        save={save}
        announce={announce}
        onClose={() => setPickupStudentId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Garden.cream },
  listContent: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  headerBlock: { gap: 10, paddingBottom: 6 },
  titleBlock: { gap: 4, marginBottom: 4 },
  title: { fontFamily: GardenFonts.display, fontSize: 30, lineHeight: 33, letterSpacing: -1, color: Garden.ink },
  subtitle: { fontFamily: GardenFonts.bodySemi, fontSize: 15, lineHeight: 21, color: Garden.soft },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: Garden.paper,
  },
  emptyError: { backgroundColor: '#F9E5DA' },
  emptyText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
    textAlign: 'center',
  },
  skeletonList: { gap: 8 },
});
