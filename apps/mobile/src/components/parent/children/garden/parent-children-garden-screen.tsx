import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChildRecordView } from '@/components/parent/children/garden/child-record-view';
import {
  ChildRecordSkeleton,
  ParentChildrenGardenSkeleton,
} from '@/components/parent/children/garden/parent-children-garden-skeleton';
import {
  ChildrenHeader,
  ChildrenLearnerStrip,
} from '@/components/parent/children/garden/sections/children-sections';
import type { ParentChildrenScreenController } from '@/components/parent/children/garden/use-parent-children-screen-controller';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { Garden, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GErrorCard, GHand, GToyButton, gText } from '@/components/parent/garden/ui';
import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';

/**
 * My children in Garden: header, polaroid learner strip, next steps, guides
 * and the school record. Sheets live with the record; the celebration sits at
 * the root.
 */
export function ParentChildrenGardenScreen({
  controller,
}: {
  controller: ParentChildrenScreenController;
}) {
  const accent = useGardenAccent();
  const scrollRef = useRef<ScrollView>(null);
  const recordYRef = useRef(0);
  const [celebrationKey, setCelebrationKey] = useState<string | null>(null);

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.refreshError,
    label: 'Your children',
    id: 'children-refresh',
  });

  // Deep link / "Review checklist": bring the record card into view.
  useEffect(() => {
    if (controller.recordScrollTick === 0) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, recordYRef.current - 8), animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [controller.recordScrollTick]);

  const onCelebrate = useCallback((key: string) => setCelebrationKey(key), []);

  if (controller.isInitialLoading) {
    return (
      <>
        <StatusBar style="dark" />
        <ParentChildrenGardenSkeleton />
      </>
    );
  }

  if (controller.loadError) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          <GErrorCard
            title="We couldn't load your children"
            message={`${controller.loadError} Check your connection, then try again.`}
            onRetry={() => void controller.refresh()}
          />
        </ScrollView>
      </View>
    );
  }

  const { children, selectedChild, selectedProfile } = controller;

  return (
    <View style={styles.root} testID="parent-children-screen">
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: PARENT_FLOATING_TAB_BAR_HEIGHT + 32 }]}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing || controller.isRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }>
        {children.length === 0 ? (
          <GCard title="No student records yet" index={0}>
            {controller.emptyMessage ? (
              <Text style={gText.body}>{controller.emptyMessage}</Text>
            ) : (
              <>
                <Text style={gText.body}>
                  We don&apos;t have any student records from your applications yet. Visit your
                  application dashboard to get started.
                </Text>
                <GToyButton
                  label="Open application dashboard"
                  icon="open-outline"
                  onPress={() => void controller.openApplyDashboard()}
                  style={styles.emptyButton}
                />
              </>
            )}
            <View style={styles.hand}>
              <GHand>Your family will show up here.</GHand>
            </View>
          </GCard>
        ) : (
          <>
            <ChildrenHeader learners={children} selectedChild={selectedChild} />
            <ChildrenLearnerStrip
              learners={children}
              selectedApplicationId={selectedChild?.applicationId ?? children[0].applicationId}
              onSelect={controller.selectChild}
            />

            {controller.isRecordLoading ? <ChildRecordSkeleton /> : null}

            {controller.profileError && !selectedProfile ? (
              <GErrorCard
                title="We couldn't load this record"
                message={`${controller.profileError} Check your connection, then try again.`}
                onRetry={controller.retryProfile}
              />
            ) : null}

            {selectedProfile?.application && selectedChild ? (
              <ChildRecordView
                key={selectedChild.applicationId}
                profile={selectedProfile}
                showOverview
                childOverview={selectedChild}
                organizationId={controller.organizationId}
                activeSection={controller.recordSection}
                onSectionChange={controller.setRecordSection}
                onOpenSection={controller.openRecordSection}
                onChecklistUpdated={(next) => controller.onChecklistUpdated(selectedChild.applicationId, next)}
                onPhotoUpdated={(url) => controller.onPhotoUpdated(selectedChild.applicationId, url)}
                refresh={controller.refresh}
                onRecordLayout={(y) => {
                  recordYRef.current = y;
                }}
                onCelebrate={onCelebrate}
              />
            ) : null}
          </>
        )}
      </ScrollView>
      {celebrationKey ? <GCelebrate active celebrationKey={celebrationKey} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 16 },
  emptyButton: { marginTop: 14 },
  hand: { marginTop: 12 },
});
