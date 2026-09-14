import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ClassroomFormSheet } from '@/components/school-admin/classrooms/classroom-form-sheet';
import { ClassroomStoryListItem } from '@/components/school-admin/classrooms/classroom-story-list-item';
import { ClassroomsStoryHeader } from '@/components/school-admin/classrooms/classrooms-story-header';
import { StoryButton } from '@/components/story/story-button';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ClassroomSummary, ProgramOption } from '@/lib/school-admin/classrooms';
import { fetchClassrooms } from '@/lib/school-admin-api';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ClassroomsListScreenProps = {
  slug: string;
};

export function ClassroomsListScreen({ slug }: ClassroomsListScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { reportError } = useMobileErrorReporter();

  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const loadClassrooms = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setLoading(true);
      setError(null);
      try {
        const payload = await fetchClassrooms(slug);
        setClassrooms(payload.classrooms);
        setPrograms(payload.programs);
      } catch (loadError) {
        reportError('school_admin_classrooms_load', loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load classrooms.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [reportError, slug],
  );

  useEffect(() => {
    void loadClassrooms();
  }, [loadClassrooms]);

  const filteredClassrooms = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return classrooms;
    return classrooms.filter((classroom) => {
      const haystack = [
        classroom.name,
        classroom.programName ?? '',
        classroom.leadTeacherNames.join(' '),
        classroom.status,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [classrooms, searchQuery]);

  const totalStudents = useMemo(
    () => classrooms.reduce((sum, classroom) => sum + classroom.studentCount, 0),
    [classrooms],
  );

  const listHeader = (
    <View style={styles.headerBlock}>
      <Animated.View entering={FadeInDown.duration(350)}>
        <ClassroomsStoryHeader classroomCount={classrooms.length} totalStudents={totalStudents} />
      </Animated.View>

      <StoryButton label="Add classroom" onPress={() => setFormOpen(true)} />

      <View style={[styles.searchField, { backgroundColor: theme.white, borderColor: Story.line }]}>
        <Ionicons name="search" size={18} color={theme.muted} />
        <TextInput
          accessibilityLabel="Search classrooms"
          placeholder="Search classrooms"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.ink }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error ? <StoryErrorBanner message={error} /> : null}
    </View>
  );

  if (loading && classrooms.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingCopy, { color: theme.muted }]}>Loading classrooms…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredClassrooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadClassrooms({ silent: true });
            }}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              {classrooms.length === 0
                ? 'No classrooms yet.'
                : 'No classrooms match your search.'}
            </Text>
            {classrooms.length === 0 ? (
              <Pressable accessibilityRole="button" onPress={() => setFormOpen(true)}>
                <Text style={[styles.emptyLink, { color: theme.primary }]}>Add your first classroom →</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 180)).duration(220)}>
            <ClassroomStoryListItem
              classroom={item}
              onPress={(classroom) =>
                router.push(`/school-admin/${slug}/more/classrooms/${classroom.id}`)
              }
            />
          </Animated.View>
        )}
      />

      <ClassroomFormSheet
        visible={formOpen}
        slug={slug}
        programs={programs}
        onClose={() => setFormOpen(false)}
        onSaved={() => void loadClassrooms({ silent: true })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Story.paper },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Story.paper,
  },
  loadingCopy: { fontFamily: StoryFonts.body, fontSize: 14 },
  headerBlock: { gap: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.three },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 16, fontFamily: StoryFonts.body, padding: 0 },
  listContent: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingBottom: Spacing.five, flexGrow: 1 },
  separator: { height: Spacing.two },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.five, gap: Spacing.two },
  emptyCopy: { fontFamily: StoryFonts.body, fontSize: 14, textAlign: 'center' },
  emptyLink: { fontFamily: StoryFonts.bodySemiBold, fontSize: 14 },
});
