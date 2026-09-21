import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AttendanceDateNavigator } from '@/components/attendance/attendance-date-navigator';
import { AttendanceDetailSheet } from '@/components/attendance/attendance-detail-sheet';
import { AttendancePickupSheet } from '@/components/attendance/attendance-pickup-sheet';
import {
  AttendanceStatusFilters,
  type AttendanceStatusFilter,
} from '@/components/attendance/attendance-status-filters';
import { AttendanceStudentCard } from '@/components/attendance/attendance-student-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useAttendance } from '@/contexts/attendance-context';
import type { AttendanceRosterStudent } from '@/lib/attendance/attendance-types';
import { formatEnrolledStudentName } from '@/lib/teacher/teacher-home-utils';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type AttendanceScreenProps = {
  title: string;
};

export function AttendanceScreen({ title }: AttendanceScreenProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();
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
    saveAction,
  } = useAttendance();

  const [statusFilter, setStatusFilter] = useState<AttendanceStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [detailStudent, setDetailStudent] = useState<AttendanceRosterStudent | null>(null);
  const [pickupStudent, setPickupStudent] = useState<AttendanceRosterStudent | null>(null);

  useEffect(() => {
    void loadRoster();
  }, [loadRoster]);

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

  const handleRecordPickup = useCallback((student: AttendanceRosterStudent) => {
    setDetailStudent(null);
    setPickupStudent(student);
  }, []);

  const listHeader = (
    <View style={styles.headerBlock}>
      <StoryDisplayHeading size="display">{title}</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Mark present, record absences, and log pickups.
      </Text>

      <AttendanceDateNavigator
        activeDate={activeDate}
        summary={summary}
        loading={isLoading}
        onDateChange={handleDateChange}
      />

      <TextInput
        accessibilityLabel="Search students"
        placeholder="Search students"
        placeholderTextColor={theme.muted}
        value={search}
        onChangeText={setSearch}
        style={[
          styles.searchInput,
          {
            borderColor: Story.line,
            color: theme.ink,
            backgroundColor: Story.white,
          },
        ]}
      />

      <AttendanceStatusFilters
        activeFilter={statusFilter}
        summary={summary}
        onChange={setStatusFilter}
      />
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {isLoading && students.length === 0 ? (
        <View style={styles.loadingWrap}>
          {listHeader}
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.muted }]}>
              {error
                ? error
                : students.length === 0
                  ? 'No students have Attendance enabled for their program yet.'
                  : 'No students match your search or filter.'}
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void refresh()}
              tintColor={theme.primary}
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 30).duration(220)}>
              <AttendanceStudentCard
                student={item}
                saving={savingStudentId === item.id}
                onOpenDetails={() => setDetailStudent(item)}
                onMarkPresent={() => void saveAction(item, 'present')}
                onRecordPickup={() => handleRecordPickup(item)}
              />
            </Animated.View>
          )}
        />
      )}

      <AttendanceDetailSheet
        visible={detailStudent != null}
        student={detailStudent}
        onClose={() => setDetailStudent(null)}
        onRecordPickup={() => {
          if (detailStudent) {
            handleRecordPickup(detailStudent);
          }
        }}
      />

      <AttendancePickupSheet
        visible={pickupStudent != null}
        student={pickupStudent}
        onClose={() => setPickupStudent(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  loadingWrap: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.two,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.two,
  },
  headerBlock: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -2,
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: StoryFonts.body,
    fontSize: 15,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  empty: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: Spacing.four,
  },
});
