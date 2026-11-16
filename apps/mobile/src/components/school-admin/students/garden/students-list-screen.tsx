import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, PORTAL_EASE } from '@/components/parent/garden/tokens';
import { GLink, GSkeleton } from '@/components/parent/garden/ui';
import {
  AdminEmptyPanel,
  AdminFilterChips,
  AdminKpiTiles,
  AdminLeadStrip,
  AdminSearchField,
  type AdminFilterChip,
} from '@/components/school-admin/garden/admin-ui';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import { AdminClassroomAssignSheet } from '@/components/school-admin/students/garden/admin-classroom-assign-sheet';
import { StudentRow } from '@/components/school-admin/students/garden/student-row';
import {
  NEW_ENROLLMENTS_FILTER,
  useStudentsListController,
  type StudentsListController,
} from '@/components/school-admin/students/garden/use-students-list-controller';
import { useStudentsListFeedback } from '@/components/school-admin/students/garden/use-students-list-feedback';
import { formatEnrolledStudentName } from '@/lib/school-admin/enrolled-students';

const KPI_BARS = { all: '#2E4A3C', attention: '#E2B33C', programs: '#7FA7D9', recent: '#B5577A' } as const;

/** "14 enrolled learners · 3 need a classroom" — built only from data. */
export function studentsStatusLine(total: number, unassigned: number): string {
  if (total === 0) return 'No enrolled students yet';
  const parts = [`${total} enrolled learner${total === 1 ? '' : 's'}`];
  parts.push(
    unassigned > 0
      ? `${unassigned} need${unassigned === 1 ? 's' : ''} a classroom or teacher`
      : 'everyone has a classroom',
  );
  return parts.join(' · ');
}

type StudentsListScreenProps = { organizationId: string; slug: string };

/**
 * School admin › Students (Garden). Data and saves live in
 * `useStudentsListController`; feedback adds toasts, in-sheet status, flashes.
 */
export function StudentsListScreen(props: StudentsListScreenProps) {
  const controller = useStudentsListController(props);
  if (controller.status === 'loading') return <StudentsListSkeleton />;
  return <StudentsListContent controller={controller} />;
}

function StudentsListContent({ controller }: { controller: StudentsListController }) {
  const feedback = useStudentsListFeedback(controller);
  const bleed = useAdminTopBleed();
  const { metrics, students, rosterFilter, programCounts, pickerStudent } = controller;
  const hasStudents = students.length > 0;

  const chips = useMemo<AdminFilterChip<string>[]>(() => {
    const items: AdminFilterChip<string>[] = [
      { id: 'all', label: 'All', count: metrics.totalCount },
      { id: 'unassigned', label: 'Unassigned', count: metrics.unassignedCount },
    ];
    if (rosterFilter === NEW_ENROLLMENTS_FILTER) {
      items.splice(1, 0, { id: NEW_ENROLLMENTS_FILTER, label: 'New enrollments', count: metrics.newEnrollmentCount });
    }
    for (const [programName] of metrics.programOptions) {
      items.push({ id: programName, label: programName, count: programCounts[programName] ?? 0 });
    }
    return items;
  }, [metrics, programCounts, rosterFilter]);

  const filtering = rosterFilter !== 'all' || controller.searchQuery.trim().length > 0;
  const emptyTitle = !hasStudents
    ? 'No enrolled students yet.'
    : rosterFilter === 'unassigned' && !controller.searchQuery.trim()
      ? 'No unassigned students right now.'
      : 'No students match your search.';

  const header = (
    <View style={styles.headerBlock}>
      {hasStudents ? (
        <Animated.View entering={FadeInDown.delay(40).duration(320).easing(PORTAL_EASE)}>
          <AdminKpiTiles
            tiles={[
              {
                id: 'all',
                label: 'All enrolled',
                value: String(metrics.totalCount),
                barColor: KPI_BARS.all,
                onPress: () => feedback.applyFilter('all'),
                testID: 'students-kpi-all',
              },
              {
                id: 'attention',
                label: 'Needs attention',
                value: String(metrics.unassignedCount),
                barColor: KPI_BARS.attention,
                onPress: () => feedback.applyFilter('unassigned'),
                testID: 'students-kpi-attention',
              },
              {
                id: 'programs',
                label: 'Programs',
                value: String(metrics.programCount),
                barColor: KPI_BARS.programs,
                onPress: feedback.openPrograms,
                testID: 'students-kpi-programs',
              },
              {
                id: 'recent',
                label: 'New enrollments',
                value: String(metrics.newEnrollmentCount),
                barColor: KPI_BARS.recent,
                onPress: () => feedback.applyFilter(NEW_ENROLLMENTS_FILTER),
                testID: 'students-kpi-recent',
              },
            ]}
          />
        </Animated.View>
      ) : null}

      {metrics.unassignedCount > 0 && rosterFilter !== 'unassigned' ? (
        <Animated.View entering={FadeInDown.delay(90).duration(320).easing(PORTAL_EASE)}>
          <AdminLeadStrip
            testID="students-show-unassigned"
            icon="people-outline"
            title={`${metrics.unassignedCount} student${metrics.unassignedCount === 1 ? ' needs' : 's need'} a classroom or teacher`}
            subtitle="Show them, then tap a student's classroom chip to assign one."
            pillLabel="Show unassigned"
            onPress={() => feedback.applyFilter('unassigned')}
          />
        </Animated.View>
      ) : null}

      <AdminSearchField
        value={controller.searchQuery}
        onChangeText={controller.setSearchQuery}
        placeholder="Search students"
        accessibilityLabel="Search students"
      />

      {hasStudents ? (
        <AdminFilterChips
          accessibilityLabel="Filter students"
          items={chips}
          activeId={rosterFilter}
          onChange={controller.setRosterFilter}
        />
      ) : null}

      {controller.error ? (
        <GInlineBanner
          tone="error"
          title="Couldn't refresh the roster"
          description={controller.error}
          action={<GLink label="Try again" icon="refresh" onPress={() => void feedback.onPullRefresh()} />}
        />
      ) : null}
      {controller.staffError ? <Text style={styles.staffError}>{controller.staffError}</Text> : null}
      {filtering && controller.filteredStudents.length > 0 ? (
        <Text style={styles.resultCount} accessibilityLiveRegion="polite">
          Showing {controller.filteredStudents.length} of {metrics.totalCount}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, bleed]} testID="school-admin-students-ready">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <AdminTabHeader
          title="Students"
          accentWord="Students"
          statusLine={studentsStatusLine(metrics.totalCount, metrics.unassignedCount)}
          lastUpdatedAt={controller.lastUpdatedAt}
          statusTestID="students-status-line"
        />
      </View>
      <FlatList
        data={controller.filteredStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={feedback.pullRefreshing}
            onRefresh={() => void feedback.onPullRefresh()}
            tintColor={Garden.soft}
          />
        }
        ListEmptyComponent={
          !hasStudents ? (
            <AdminEmptyPanel
              icon="people-outline"
              title={emptyTitle}
              actionLabel="Go to Admissions"
              onAction={controller.goToAdmissions}
            />
          ) : rosterFilter === 'unassigned' && !controller.searchQuery.trim() ? (
            <AdminEmptyPanel
              tone="mint"
              icon="checkmark-circle"
              title={emptyTitle}
              body="Every student has a classroom and a teacher."
              actionLabel="Show everyone"
              onAction={controller.clearFilters}
            />
          ) : (
            <AdminEmptyPanel
              icon="search-outline"
              title={emptyTitle}
              actionLabel="Show everyone"
              onAction={controller.clearFilters}
            />
          )
        }
        renderItem={({ item }) => (
          <StudentRow
            student={item}
            onPress={controller.openStudent}
            onPressClassroom={feedback.openPicker}
            saving={controller.assigningStudentId === item.id}
            flash={feedback.action.flashKey === `student-classrooms-${item.id}`}
          />
        )}
      />

      <AdminClassroomAssignSheet
        visible={pickerStudent !== null}
        studentName={pickerStudent ? formatEnrolledStudentName(pickerStudent) : ''}
        studentProgramNames={pickerStudent?.programNames ?? EMPTY}
        studentProgramIds={pickerStudent?.programIds ?? EMPTY}
        classroomIds={pickerStudent?.classroomIds ?? EMPTY}
        classrooms={controller.classrooms}
        loading={controller.classroomsLoading || (pickerStudent !== null && !controller.classroomsLoaded && !controller.classroomsError)}
        loadError={controller.classroomsError}
        onRetryLoad={() => void controller.retryClassrooms()}
        saving={pickerStudent ? controller.assigningStudentId === pickerStudent.id : false}
        notice={feedback.sheetNotice}
        onClose={feedback.closePicker}
        onAddClassroom={() => {
          feedback.closePicker();
          controller.goToClassrooms();
        }}
        onSave={feedback.saveClassrooms}
      />
    </View>
  );
}

const EMPTY: string[] = [];

function Separator() {
  return <View style={styles.separator} />;
}

export function StudentsListSkeleton() {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView
      style={[styles.root, bleed]}
      scrollEnabled={false}
      accessibilityLabel="Loading students"
      contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skStatus} />
      <View style={styles.skGrid}>
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
      </View>
      <GSkeleton style={styles.skSearch} />
      <GSkeleton style={styles.skRow} />
      <GSkeleton style={styles.skRow} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, flexGrow: 1 },
  headerBlock: { gap: 14, marginBottom: 14 },
  separator: { height: 10 },
  staffError: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  resultCount: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: Garden.soft,
    fontVariant: ['tabular-nums'],
  },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skTitle: { width: '45%', height: 32, borderRadius: 10, marginTop: 6 },
  skStatus: { width: '75%', height: 16, borderRadius: 8 },
  skGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  skTile: { flexGrow: 1, flexBasis: '45%', height: 104, borderRadius: 18 },
  skSearch: { height: 48, borderRadius: 24 },
  skRow: { height: 124, borderRadius: 18 },
});
