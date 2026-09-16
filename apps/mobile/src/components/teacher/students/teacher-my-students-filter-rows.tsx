import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import type { StudentRosterFilter } from '@/lib/school-admin/admin-student-roster-metrics';
import type { StaffClassroomOption } from '@/lib/teacher/teacher-portal-api';
import type {
  TeacherClassroomFilter,
  TeacherRosterScope,
} from '@/lib/teacher/teacher-students-utils';
import { Spacing } from '@/constants/theme';

type TeacherMyStudentsFilterRowsProps = {
  rosterScope: TeacherRosterScope;
  assignedCount: number;
  schoolCount: number | null;
  onScopeChange: (scope: TeacherRosterScope) => void;
  staffClassrooms: StaffClassroomOption[];
  classroomFilter: TeacherClassroomFilter;
  assignedStudentsCount: number;
  unassignedClassroomCount: number;
  onClassroomFilterChange: (filter: TeacherClassroomFilter) => void;
  rosterFilter: StudentRosterFilter;
  rosterTotalCount: number;
  rosterUnassignedCount: number;
  programOptions: [string, string][];
  programCounts: Record<string, number>;
  isSchoolScope: boolean;
  onRosterFilterChange: (filter: StudentRosterFilter) => void;
};

function FilterRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {children}
    </ScrollView>
  );
}

export function TeacherMyStudentsFilterRows({
  rosterScope,
  assignedCount,
  schoolCount,
  onScopeChange,
  staffClassrooms,
  classroomFilter,
  assignedStudentsCount,
  unassignedClassroomCount,
  onClassroomFilterChange,
  rosterFilter,
  rosterTotalCount,
  rosterUnassignedCount,
  programOptions,
  programCounts,
  isSchoolScope,
  onRosterFilterChange,
}: TeacherMyStudentsFilterRowsProps) {
  const showClassroomFilters = rosterScope === 'assigned' && staffClassrooms.length > 0;
  const showProgramFilters = programOptions.length > 1;

  return (
    <View style={styles.container}>
      <FilterRow>
        <AdmissionsFilterPill
          active={rosterScope === 'assigned'}
          label="My students"
          count={assignedCount}
          size="large"
          onPress={() => onScopeChange('assigned')}
        />
        <AdmissionsFilterPill
          active={rosterScope === 'school'}
          label="All students"
          count={schoolCount ?? undefined}
          size="large"
          onPress={() => onScopeChange('school')}
        />
      </FilterRow>

      {showClassroomFilters ? (
        <FilterRow>
          <AdmissionsFilterPill
            active={classroomFilter === 'all'}
            label="All groups"
            count={assignedStudentsCount}
            size="large"
            onPress={() => onClassroomFilterChange('all')}
          />
          {staffClassrooms.map((classroom) => (
            <AdmissionsFilterPill
              key={classroom.id}
              active={classroomFilter === classroom.id}
              label={classroom.name}
              count={classroom.studentCount}
              size="large"
              onPress={() => onClassroomFilterChange(classroom.id)}
            />
          ))}
          {unassignedClassroomCount > 0 ? (
            <AdmissionsFilterPill
              active={classroomFilter === 'unassigned'}
              label="Unassigned"
              count={unassignedClassroomCount}
              size="large"
              onPress={() => onClassroomFilterChange('unassigned')}
            />
          ) : null}
        </FilterRow>
      ) : null}

      <FilterRow>
        <AdmissionsFilterPill
          active={rosterFilter === 'all'}
          label="All"
          count={rosterTotalCount}
          size="large"
          onPress={() => onRosterFilterChange('all')}
        />
        {isSchoolScope && rosterUnassignedCount > 0 ? (
          <AdmissionsFilterPill
            active={rosterFilter === 'unassigned'}
            label="Unassigned"
            count={rosterUnassignedCount}
            size="large"
            onPress={() => onRosterFilterChange('unassigned')}
          />
        ) : null}
        {showProgramFilters
          ? programOptions.map(([programName]) => (
              <AdmissionsFilterPill
                key={programName}
                active={rosterFilter === programName}
                label={programName}
                count={programCounts[programName] ?? 0}
                size="large"
                onPress={() => onRosterFilterChange(programName)}
              />
            ))
          : null}
      </FilterRow>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    gap: Spacing.three,
  },
});
