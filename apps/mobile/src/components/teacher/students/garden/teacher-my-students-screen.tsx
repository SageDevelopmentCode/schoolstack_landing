import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, type ReactNode } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSegmented } from '@/components/parent/garden/segmented';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, PORTAL_EASE, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  GCard,
  GChip,
  GErrorCard,
  GKicker,
  GLink,
  GOutlineButton,
  GPressable,
  GSkeleton,
} from '@/components/parent/garden/ui';
import {
  AdminEmptyPanel,
  AdminEndLine,
  AdminFilterChips,
  AdminIconChip,
  AdminSearchField,
  type AdminFilterChip,
} from '@/components/school-admin/garden/admin-ui';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import { StudentFaceTile } from '@/components/teacher/students/garden/student-face-tile';
import {
  HEALTH_NOTES_FILTER,
  myStudentsStatusLine,
} from '@/components/teacher/students/garden/teacher-my-students-status';
import {
  useTeacherMyStudentsController,
  type TeacherMyStudentsController,
} from '@/components/teacher/students/garden/use-teacher-my-students-controller';
import {
  useTeacherMyStudentsFeedback,
  type TeacherMyStudentsFeedback,
} from '@/components/teacher/students/garden/use-teacher-my-students-feedback';
import { haptic } from '@/lib/haptics';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';
import type { TeacherRosterScope } from '@/lib/teacher/teacher-students-utils';

const KPI_BARS = { total: '#2E4A3C', attention: '#E2B33C', health: '#D4685A', programs: '#7FA7D9' } as const;
const GRID_GAP = 10;
const SIDE = 16;

/**
 * Teacher › My Students (Garden "class photo"). Data and routes live in
 * `useTeacherMyStudentsController`; feedback wraps them. A face opens the
 * full-screen student page. Design rules: `teacher-mobile-garden-design`.
 */
export function TeacherMyStudentsScreen({ slug }: { slug: string }) {
  const controller = useTeacherMyStudentsController(slug);
  const failed = controller.status === 'error';

  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'loading') return <TeacherMyStudentsSkeleton />;
  if (controller.status === 'error') {
    return (
      <Notice>
        <GErrorCard
          title="We couldn't load your students"
          message={controller.error ?? 'Failed to load home.'}
          onRetry={() => void controller.reload()}
        />
      </Notice>
    );
  }
  if (controller.status === 'disabled') {
    return (
      <Notice>
        <GCard title="Not turned on yet" index={0}>
          <Text style={styles.noticeCopy}>My Students is not enabled for your school.</Text>
        </GCard>
      </Notice>
    );
  }
  if (controller.status === 'no-staff') {
    return (
      <Notice>
        <GCard title="Almost there" index={0} action={<GChip label="Needs your admin" tone="warning" />}>
          <Text style={styles.noticeCopy}>
            Your account isn&apos;t linked to a staff record. Contact your school administrator so they
            can connect your portal login to the staff directory.
          </Text>
        </GCard>
      </Notice>
    );
  }
  return <MyStudentsContent controller={controller} />;
}

function Notice({ children }: { children: ReactNode }) {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.noticeWrap}>
      <StatusBar style="dark" />
      <AdminTabHeader title="My Students" accentWord="Students" />
      {children}
    </ScrollView>
  );
}

function MyStudentsContent({ controller }: { controller: TeacherMyStudentsController }) {
  const feedback = useTeacherMyStudentsFeedback(controller);
  const bleed = useAdminTopBleed();
  const { width } = useWindowDimensions();
  const tileWidth = Math.floor((width - SIDE * 2 - GRID_GAP * 2) / 3);
  const { isSchoolScope, metrics, filteredStudents, visibleStudents, remainingCount } = controller;

  const statusLine = myStudentsStatusLine({
    scope: controller.rosterScope,
    total: isSchoolScope && controller.schoolStudents === null ? null : metrics.totalCount,
    healthCount: controller.healthFlagCount,
    classroomCount: controller.staffClassrooms.length,
    unassignedCount: metrics.unassignedCount,
  });

  const header = <ListHeader controller={controller} feedback={feedback} />;

  return (
    <View style={[styles.root, bleed]} testID="teacher-my-students-ready">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <AdminTabHeader
          title="My Students"
          accentWord="Students"
          statusLine={statusLine}
          lastUpdatedAt={controller.lastUpdatedAt}
          statusTestID="teacher-my-students-status"
        />
        <GSegmented<TeacherRosterScope>
          accessibilityLabel="Which students"
          items={[
            {
              id: 'assigned',
              label: 'My students',
              icon: 'people-outline',
              testID: 'teacher-my-students-scope-assigned',
            },
            {
              id: 'school',
              label: 'All students',
              icon: 'school-outline',
              testID: 'teacher-my-students-scope-school',
            },
          ]}
          activeId={controller.rosterScope}
          onChange={controller.changeRosterScope}
        />
      </View>

      <FlatList
        key={controller.rosterScope}
        data={visibleStudents}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        accessibilityRole="list"
        refreshControl={
          <RefreshControl
            refreshing={feedback.pullRefreshing}
            onRefresh={() => void feedback.onPullRefresh()}
            tintColor={Garden.soft}
          />
        }
        renderItem={({ item, index }) => (
          <StudentFaceTile
            student={item}
            index={index}
            testID={`teacher-my-students-student-${item.id}`}
            meta={isSchoolScope ? teacherMeta(item) : null}
            onPress={controller.openStudent}
            style={{ width: tileWidth }}
          />
        )}
        ListEmptyComponent={<EmptyState controller={controller} tileWidth={tileWidth} />}
        ListFooterComponent={
          remainingCount > 0 ? (
            <GOutlineButton
              label={`Show more (${remainingCount} remaining)`}
              icon="chevron-down"
              testID="teacher-my-students-show-more"
              onPress={() => {
                haptic.select();
                controller.showMore();
              }}
              style={styles.more}
            />
          ) : filteredStudents.length > 0 ? (
            <AdminEndLine label={controller.filtering ? "That's every match" : "That's everyone"} />
          ) : null
        }
      />

      <ProgramsSheet
        visible={feedback.programsOpen}
        options={metrics.programOptions}
        counts={controller.programCounts}
        activeId={controller.rosterFilter}
        onClose={feedback.closePrograms}
        onPick={feedback.pickProgram}
      />
    </View>
  );
}

function teacherMeta(student: AdminEnrolledStudentSummary): string {
  const names = student.assignedTeacherNames.trim();
  return names ? `Teacher: ${names}` : 'No teacher yet';
}

function ListHeader({
  controller,
  feedback,
}: {
  controller: TeacherMyStudentsController;
  feedback: TeacherMyStudentsFeedback;
}) {
  const {
    isSchoolScope,
    metrics,
    healthFlagCount,
    rosterFilter,
    classroomFilter,
    staffClassrooms,
    assignedStudents,
    unassignedClassroomCount,
    programCounts,
    students,
  } = controller;
  const hasStudents = students.length > 0;
  const showPrograms = metrics.programCount > 1;

  const tiles = useMemo<NumberCell[]>(() => {
    const list: NumberCell[] = [
      {
        id: 'all',
        label: isSchoolScope ? 'All enrolled' : 'Assigned students',
        value: String(metrics.totalCount),
        barColor: KPI_BARS.total,
        onPress: () => feedback.applyTileFilter('all'),
        testID: 'teacher-my-students-tile-total',
      },
    ];
    if (isSchoolScope) {
      list.push({
        id: 'unassigned',
        label: 'Unassigned teacher',
        value: String(metrics.unassignedCount),
        barColor: KPI_BARS.attention,
        onPress: () => feedback.applyTileFilter('unassigned'),
        testID: 'teacher-my-students-tile-unassigned',
      });
    }
    list.push({
      id: 'health',
      label: 'Health flags',
      value: String(healthFlagCount),
      barColor: KPI_BARS.health,
      onPress: () => feedback.applyTileFilter(HEALTH_NOTES_FILTER),
      testID: 'teacher-my-students-tile-health',
    });
    if (showPrograms) {
      list.push({
        id: 'programs',
        label: 'Programs',
        value: String(metrics.programCount),
        barColor: KPI_BARS.programs,
        onPress: feedback.openPrograms,
        testID: 'teacher-my-students-tile-programs',
      });
    }
    return list;
  }, [feedback, healthFlagCount, isSchoolScope, metrics, showPrograms]);

  const classroomChips = useMemo<AdminFilterChip<string>[]>(() => {
    const items: AdminFilterChip<string>[] = [
      { id: 'all', label: 'All groups', count: assignedStudents.length },
      ...staffClassrooms.map((classroom) => ({
        id: classroom.id,
        label: classroom.name,
        count: classroom.studentCount,
      })),
    ];
    if (unassignedClassroomCount > 0) {
      items.push({ id: 'unassigned', label: 'Unassigned', count: unassignedClassroomCount });
    }
    return items;
  }, [assignedStudents.length, staffClassrooms, unassignedClassroomCount]);

  const rosterChips = useMemo<AdminFilterChip<string>[]>(() => {
    const items: AdminFilterChip<string>[] = [{ id: 'all', label: 'All', count: metrics.totalCount }];
    if (isSchoolScope && metrics.unassignedCount > 0) {
      items.push({ id: 'unassigned', label: 'Unassigned', count: metrics.unassignedCount });
    }
    if (healthFlagCount > 0 || rosterFilter === HEALTH_NOTES_FILTER) {
      items.push({ id: HEALTH_NOTES_FILTER, label: 'Health notes', count: healthFlagCount });
    }
    if (showPrograms) {
      for (const [programName] of metrics.programOptions) {
        items.push({ id: programName, label: programName, count: programCounts[programName] ?? 0 });
      }
    }
    return items;
  }, [healthFlagCount, isSchoolScope, metrics, programCounts, rosterFilter, showPrograms]);

  const showClassrooms = !isSchoolScope && staffClassrooms.length > 0;
  const showRoster = rosterChips.length > 1;

  return (
    <View style={styles.headerBlock}>
      {hasStudents ? (
        <Animated.View entering={FadeInDown.delay(40).duration(320).easing(PORTAL_EASE)}>
          <NumberStrip
            cells={tiles}
            activeId={
              rosterFilter === 'all' || rosterFilter === 'unassigned' || rosterFilter === HEALTH_NOTES_FILTER
                ? rosterFilter
                : 'programs'
            }
          />
        </Animated.View>
      ) : null}

      {isSchoolScope && metrics.unassignedCount > 0 && rosterFilter !== 'unassigned' ? (
        <Animated.View entering={FadeInDown.delay(90).duration(320).easing(PORTAL_EASE)}>
          <GInlineBanner
            tone="warning"
            title="Needs attention"
            description={`${metrics.unassignedCount} enrolled student${
              metrics.unassignedCount === 1 ? " doesn't" : "s don't"
            } have a teacher assigned.`}
            action={
              <GLink
                label="View unassigned"
                testID="teacher-my-students-view-unassigned"
                onPress={() => feedback.applyTileFilter('unassigned')}
              />
            }
          />
        </Animated.View>
      ) : null}

      <AdminSearchField
        value={controller.searchQuery}
        onChangeText={controller.setSearchQuery}
        placeholder="Search students, families, or email"
        accessibilityLabel="Search students"
        testID="teacher-my-students-search"
      />

      {showClassrooms ? (
        <View style={styles.chipGroup}>
          <GKicker>Classroom</GKicker>
          <AdminFilterChips
            accessibilityLabel="Filter by classroom"
            items={classroomChips}
            activeId={classroomFilter}
            onChange={controller.changeClassroomFilter}
          />
        </View>
      ) : null}

      {showRoster ? (
        <View style={styles.chipGroup}>
          {showClassrooms ? <GKicker>Show</GKicker> : null}
          <AdminFilterChips
            accessibilityLabel="Filter students"
            items={rosterChips}
            activeId={rosterFilter}
            onChange={controller.changeRosterFilter}
          />
        </View>
      ) : null}

      {controller.schoolError && isSchoolScope ? (
        <GInlineBanner
          tone="error"
          title="Couldn't load every student"
          description={`${controller.schoolError} Check your connection, then try again.`}
          action={
            <GLink
              label={controller.loadingSchool ? 'Trying again…' : 'Try again'}
              icon="refresh"
              onPress={() => void controller.retrySchool()}
            />
          }
        />
      ) : null}

      {controller.filtering && controller.filteredStudents.length > 0 ? (
        <View style={styles.resultRow}>
          <Text style={styles.resultCount} accessibilityLiveRegion="polite">
            Showing {controller.filteredStudents.length} of {metrics.totalCount}
          </Text>
          <GLink label="Clear" icon="close" onPress={controller.clearFilters} />
        </View>
      ) : null}
    </View>
  );
}

type NumberCell = {
  id: string;
  label: string;
  value: string;
  barColor: string;
  onPress: () => void;
  testID?: string;
};

/**
 * One row of linked numbers (teacher rule: every number leads somewhere).
 * Tapping filters the class photo; the active filter's cell is outlined.
 */
function NumberStrip({ cells, activeId }: { cells: NumberCell[]; activeId: string }) {
  const accent = useGardenAccent();
  return (
    <View style={styles.strip}>
      {cells.map((cell) => {
        const active = cell.id === activeId;
        return (
          <GPressable
            key={cell.id}
            testID={cell.testID}
            accessibilityRole="button"
            accessibilityLabel={`${cell.label}: ${cell.value}. ${cell.id === 'programs' ? 'Pick a program' : 'Show them'}`}
            accessibilityState={{ selected: active }}
            pressedScale={0.97}
            onPress={cell.onPress}
            style={[
              styles.cell,
              active && { borderColor: accent.clay, backgroundColor: accent.wash },
            ]}>
            <View style={[styles.cellBar, { backgroundColor: cell.barColor }]} />
            <Text style={styles.cellValue} numberOfLines={1}>
              {cell.value}
            </Text>
            <Text style={styles.cellLabel} numberOfLines={2}>
              {cell.label}
            </Text>
          </GPressable>
        );
      })}
    </View>
  );
}

function EmptyState({ controller, tileWidth }: { controller: TeacherMyStudentsController; tileWidth: number }) {
  if (controller.schoolLoadingFirst) {
    return (
      <View style={styles.skGridInline} accessibilityLabel="Loading every enrolled student">
        {Array.from({ length: 9 }, (_, i) => (
          <GSkeleton key={i} style={[styles.skFace, { width: tileWidth }]} />
        ))}
      </View>
    );
  }
  if (controller.isSchoolScope && controller.schoolError && controller.schoolStudents === null) {
    return null; // the error banner above explains it, with Try again
  }
  if (controller.students.length === 0) {
    return controller.isSchoolScope ? (
      <AdminEmptyPanel icon="school-outline" title="No enrolled students found at your school yet." />
    ) : (
      <AdminEmptyPanel
        icon="people-outline"
        title="No students assigned to you yet."
        body="Your school admin can assign students from My School → My Students."
        actionLabel="See all students"
        onAction={() => controller.changeRosterScope('school')}
      />
    );
  }
  return (
    <AdminEmptyPanel
      icon="search-outline"
      title="No students match the current filters."
      body={controller.searchQuery.trim() ? `Nothing matches "${controller.searchQuery.trim()}".` : null}
      actionLabel="Show everyone"
      onAction={controller.clearFilters}
    />
  );
}

/** Programs tile → pick one to filter the class photo. */
function ProgramsSheet({
  visible,
  options,
  counts,
  activeId,
  onClose,
  onPick,
}: {
  visible: boolean;
  options: [string, string][];
  counts: Record<string, number>;
  activeId: string;
  onClose: () => void;
  onPick: (programName: string) => void;
}) {
  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title="Programs"
      subtitle="Pick a program to see only its students."
      headerAside={<GChip label={`${options.length} programs`} tone="info" />}
      accessibilityLabel="Close programs">
      {options.map(([programName], i) => {
        const active = activeId === programName;
        const count = counts[programName] ?? 0;
        return (
          <GPressable
            key={programName}
            accessibilityRole="button"
            accessibilityLabel={`${programName}: ${count} students. Show them`}
            accessibilityState={{ selected: active }}
            haptic="select"
            onPress={() => onPick(programName)}
            style={[styles.programRow, active && styles.programRowActive]}>
            <AdminIconChip name="school-outline" tint={[Garden.sky, Garden.lav, Garden.mint, Garden.butter][i % 4]} />
            <View style={styles.programCopy}>
              <Text style={styles.programName} numberOfLines={2}>
                {programName}
              </Text>
              <Text style={styles.programMeta}>
                {count} student{count === 1 ? '' : 's'}
              </Text>
            </View>
            {active ? (
              <GChip label="Showing" tone="success" icon="checkmark" />
            ) : (
              <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
            )}
          </GPressable>
        );
      })}
    </GSheet>
  );
}

export function TeacherMyStudentsSkeleton() {
  const bleed = useAdminTopBleed();
  const { width } = useWindowDimensions();
  const tileWidth = Math.floor((width - SIDE * 2 - GRID_GAP * 2) / 3);
  return (
    <ScrollView
      style={[styles.root, bleed]}
      scrollEnabled={false}
      accessibilityLabel="Loading students"
      contentContainerStyle={styles.skeleton}>
      <StatusBar style="dark" />
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skStatus} />
      <GSkeleton style={styles.skTabs} />
      <View style={styles.skGrid}>
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
      </View>
      <GSkeleton style={styles.skSearch} />
      <View style={styles.skGridInline}>
        {Array.from({ length: 6 }, (_, i) => (
          <GSkeleton key={i} style={[styles.skFace, { width: tileWidth }]} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: SIDE, paddingTop: 8, paddingBottom: 8, gap: 12 },
  list: { paddingHorizontal: SIDE, paddingTop: 6, paddingBottom: 40, flexGrow: 1 },
  row: { gap: GRID_GAP, marginBottom: GRID_GAP },
  headerBlock: { gap: 14, marginBottom: 16 },
  chipGroup: { gap: 6 },
  strip: { flexDirection: 'row', gap: 8 },
  cell: {
    flex: 1,
    minHeight: 76,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    overflow: 'hidden',
    gap: 2,
  },
  cellBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  cellValue: {
    fontFamily: GardenFonts.display,
    fontSize: 24,
    lineHeight: 28,
    color: Garden.ink,
    fontVariant: ['tabular-nums'],
  },
  cellLabel: { fontFamily: GardenFonts.bodyBold, fontSize: 12, lineHeight: 15, color: Garden.soft },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  resultCount: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: Garden.soft,
    fontVariant: ['tabular-nums'],
  },
  more: { alignSelf: 'center', marginTop: 8 },
  noticeWrap: { paddingHorizontal: SIDE, paddingTop: 8, paddingBottom: 32, gap: 16 },
  noticeCopy: { fontFamily: GardenFonts.bodySemi, fontSize: 14.5, lineHeight: 22, color: Garden.soft },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  programRowActive: { borderColor: Garden.forest, backgroundColor: Garden.mint },
  programCopy: { flex: 1, minWidth: 0, gap: 2 },
  programName: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  programMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  skeleton: { paddingHorizontal: SIDE, paddingTop: 8, gap: 12 },
  skTitle: { width: '55%', height: 32, borderRadius: 10, marginTop: 6 },
  skStatus: { width: '75%', height: 16, borderRadius: 8 },
  skTabs: { height: 44, borderRadius: 22, marginTop: 4 },
  skGrid: { flexDirection: 'row', gap: 10 },
  skTile: { flex: 1, height: 76, borderRadius: 16 },
  skSearch: { height: 48, borderRadius: 24 },
  skGridInline: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  skFace: { height: 132, borderRadius: 18 },
});
