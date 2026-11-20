import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { closeThen, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GErrorCard, GLink, GSkeleton } from '@/components/parent/garden/ui';
import {
  AdminClassroomFormSheet,
  type ClassroomFormInput,
} from '@/components/school-admin/classrooms/garden/admin-classroom-form-sheet';
import { ClassroomRow } from '@/components/school-admin/classrooms/garden/classroom-row';
import {
  useClassroomsListController,
  type ClassroomListFilter,
  type ClassroomsListController,
} from '@/components/school-admin/classrooms/garden/use-classrooms-list-controller';
import { READ_ONLY_NOTICE, errorText, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import {
  AdminEmptyPanel,
  AdminFilterChips,
  AdminLeadStrip,
  AdminSearchField,
  AdminStatStrip,
  AdminToolbarButton,
  type AdminFilterChip,
} from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { haptic } from '@/lib/haptics';
import { calmEnter } from '@/lib/motion/portal-motion';

/** "6 classrooms · 48 rostered students" — built only from data. */
export function classroomsStatusLine(count: number, students: number): string {
  if (count === 0) return 'No classrooms yet';
  return `${count} classroom${count === 1 ? '' : 's'} · ${students} rostered student${students === 1 ? '' : 's'}`;
}

type ClassroomsListScreenProps = { slug: string; organizationId: string };

/** School admin › More › Classrooms (Garden). */
export function ClassroomsListScreen(props: ClassroomsListScreenProps) {
  const controller = useClassroomsListController(props);
  if (controller.status === 'loading') return <ClassroomsListSkeleton />;
  if (controller.status === 'error') return <ClassroomsListError controller={controller} />;
  return <ClassroomsListContent controller={controller} />;
}

function useClassroomsListFeedback(controller: ClassroomsListController) {
  const action = useAdminAction(controller.organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [formNotice, setFormNotice] = useState<AdminSheetNotice | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const { openForm, closeForm, createClassroom, openClassroom, setFilter } = controller;

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Classrooms',
    id: 'admin-classrooms-refresh',
  });

  const openAdd = useCallback(() => {
    if (readOnly) return notifyReadOnly();
    setFormNotice(null);
    openForm();
  }, [notifyReadOnly, openForm, readOnly]);

  const closeAdd = useCallback(() => {
    setFormNotice(null);
    closeForm();
  }, [closeForm]);

  const applyFilter = useCallback(
    (filter: ClassroomListFilter) => {
      haptic.select();
      setFilter(filter);
    },
    [setFilter],
  );

  const submit = useCallback(
    async (input: ClassroomFormInput) => {
      if (readOnly) return setFormNotice(READ_ONLY_NOTICE);
      setFormNotice(null);
      const created = { id: '' };
      let failure = '';
      const ok = await action.run(
        async () => {
          const room = await createClassroom(input);
          created.id = room.id;
        },
        {
          key: 'classroom-create',
          silent: true,
          error: (err) => {
            failure = errorText(err, 'Failed to save classroom.');
            return { title: "Couldn't add the classroom" };
          },
        },
      );
      if (!ok) {
        setFormNotice({
          tone: 'error',
          title: `${input.name} wasn't added`,
          description: `${failure} Nothing was saved. Check your connection, then try again.`,
        });
        return;
      }
      setCreatedId(created.id);
      closeThen(closeAdd, () =>
        action.toast.success(`${input.name} added`, {
          id: 'classroom-create',
          description: 'Open it to assign a lead teacher and add students.',
          action: created.id ? { label: 'Open', onPress: () => openClassroom({ id: created.id }) } : undefined,
        }),
      );
    },
    [action, closeAdd, createClassroom, openClassroom, readOnly],
  );

  return {
    action,
    pullRefreshing,
    onPullRefresh,
    openAdd,
    closeAdd,
    submit,
    formNotice,
    applyFilter,
    flashId: action.flashKey === 'classroom-create' ? createdId : null,
  };
}

function ClassroomsListContent({ controller }: { controller: ClassroomsListController }) {
  const feedback = useClassroomsListFeedback(controller);
  const bleed = useAdminTopBleed();
  const { classrooms, counts, filter, searchQuery } = controller;
  const hasRooms = classrooms.length > 0;

  const chips = useMemo<AdminFilterChip<ClassroomListFilter>[]>(() => {
    const items: AdminFilterChip<ClassroomListFilter>[] = [
      { id: 'all', label: 'All', count: counts.all },
      { id: 'open', label: 'Open', count: counts.open },
      { id: 'full', label: 'Full', count: counts.full },
      { id: 'inactive', label: 'Inactive', count: counts.inactive },
    ];
    if (counts.no_lead > 0 || filter === 'no_lead') items.push({ id: 'no_lead', label: 'No lead teacher', count: counts.no_lead });
    return items.filter((item) => item.id === 'all' || item.id === filter || (item.count ?? 0) > 0);
  }, [counts, filter]);

  const filtering = filter !== 'all' || searchQuery.trim().length > 0;

  const header = (
    <View style={styles.headerBlock}>
      {hasRooms ? (
        <Animated.View entering={calmEnter({ delay: 40 })}>
          <AdminStatStrip
            stats={[
              { label: 'Classrooms', value: String(counts.all) },
              { label: 'Students', value: String(controller.totalStudents) },
              { label: 'Open', value: String(counts.open) },
            ]}
          />
        </Animated.View>
      ) : null}

      {counts.no_lead > 0 && filter !== 'no_lead' ? (
        <Animated.View entering={calmEnter({ delay: 90 })}>
          <AdminLeadStrip
            testID="classrooms-show-no-lead"
            icon="person-add-outline"
            title={`${counts.no_lead} classroom${counts.no_lead === 1 ? ' has' : 's have'} no lead teacher`}
            subtitle="Open one, then tap Assign staff to pick a lead teacher."
            pillLabel="Show them"
            onPress={() => feedback.applyFilter('no_lead')}
          />
        </Animated.View>
      ) : null}

      <AdminSearchField
        value={searchQuery}
        onChangeText={controller.setSearchQuery}
        placeholder="Search classrooms"
        accessibilityLabel="Search classrooms"
      />

      {hasRooms ? (
        <AdminFilterChips accessibilityLabel="Filter classrooms" items={chips} activeId={filter} onChange={feedback.applyFilter} />
      ) : null}

      {controller.error ? (
        <GInlineBanner
          tone="error"
          title="Couldn't refresh classrooms"
          description={`${controller.error} Showing what we already have.`}
          action={<GLink label="Try again" icon="refresh" onPress={() => void feedback.onPullRefresh()} />}
        />
      ) : null}

      {filtering && controller.filteredClassrooms.length > 0 ? (
        <Text style={styles.resultCount} accessibilityLiveRegion="polite">
          Showing {controller.filteredClassrooms.length} of {counts.all}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, bleed]} testID="school-admin-classrooms-ready">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <AdminTabHeader
          title="Classrooms"
          accentWord="Classrooms"
          statusLine={classroomsStatusLine(counts.all, controller.totalStudents)}
          lastUpdatedAt={controller.lastUpdatedAt}
          statusTestID="classrooms-status-line"
          toolbar={
            <AdminToolbarButton icon="add" label="Add" accessibilityLabel="Add classroom" onPress={feedback.openAdd} testID="classrooms-add" />
          }
        />
      </View>
      <FlatList
        data={controller.filteredClassrooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={feedback.pullRefreshing} onRefresh={() => void feedback.onPullRefresh()} tintColor={Garden.soft} />
        }
        ListEmptyComponent={
          !hasRooms ? (
            <AdminEmptyPanel icon="easel-outline" title="No classrooms yet." actionLabel="Add your first classroom" onAction={feedback.openAdd} />
          ) : filter === 'no_lead' && !searchQuery.trim() ? (
            <AdminEmptyPanel
              tone="mint"
              icon="checkmark-circle"
              title="Every classroom has a lead teacher."
              actionLabel="Show everyone"
              onAction={controller.clearFilters}
            />
          ) : (
            <AdminEmptyPanel icon="search-outline" title="No classrooms match your search." actionLabel="Show everyone" onAction={controller.clearFilters} />
          )
        }
        renderItem={({ item }) => (
          <View style={feedback.flashId === item.id ? styles.flash : null}>
            <ClassroomRow classroom={item} onPress={controller.openClassroom} />
          </View>
        )}
      />

      <AdminClassroomFormSheet
        visible={controller.formOpen}
        programs={controller.programs}
        saving={controller.creating}
        notice={feedback.formNotice}
        onClose={feedback.closeAdd}
        onSubmit={(input) => void feedback.submit(input)}
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function ClassroomsListError({ controller }: { controller: ClassroomsListController }) {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.errorWrap}>
      <StatusBar style="dark" />
      <AdminTabHeader title="Classrooms" accentWord="Classrooms" />
      <GErrorCard
        title="We couldn't load classrooms"
        message={controller.error ?? 'Failed to load classrooms.'}
        onRetry={() => void controller.reload()}
      />
    </ScrollView>
  );
}

export function ClassroomsListSkeleton() {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView style={[styles.root, bleed]} scrollEnabled={false} accessibilityLabel="Loading classrooms" contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skStatus} />
      <GSkeleton style={styles.skStrip} />
      <GSkeleton style={styles.skSearch} />
      <GSkeleton style={styles.skRow} />
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
  flash: { borderRadius: 20, backgroundColor: Garden.mint, padding: 3, margin: -3 },
  resultCount: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  errorWrap: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skTitle: { width: '55%', height: 32, borderRadius: 10, marginTop: 6 },
  skStatus: { width: '70%', height: 16, borderRadius: 8 },
  skStrip: { height: 70, borderRadius: 16, marginTop: 6 },
  skSearch: { height: 48, borderRadius: 24 },
  skRow: { height: 84, borderRadius: 18 },
});
