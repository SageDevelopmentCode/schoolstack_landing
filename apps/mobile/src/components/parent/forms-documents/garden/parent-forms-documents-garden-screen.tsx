import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ParentFormsDocumentsGardenSkeleton } from '@/components/parent/forms-documents/garden/parent-forms-garden-skeletons';
import {
  FormsListCard,
  FormsNextUpCard,
  FormsProgressCard,
} from '@/components/parent/forms-documents/garden/sections/forms-list-sections';
import { useParentFormsDocumentsModel } from '@/components/parent/forms-documents/garden/use-parent-forms-documents-model';
import type { ParentFormsDocumentsScreenController } from '@/components/parent/forms-documents/garden/use-parent-forms-documents-screen-controller';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, useGardenAccent } from '@/components/parent/garden/tokens';
import { GErrorCard } from '@/components/parent/garden/ui';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';

/**
 * Parent Forms & documents in Garden: header, the next form to sign, progress,
 * then every form as a filterable notebook list. Confetti when the last form
 * waiting is signed while this list is mounted.
 */
export function ParentFormsDocumentsGardenScreen({
  controller,
}: {
  controller: ParentFormsDocumentsScreenController;
}) {
  const accent = useGardenAccent();
  const readOnly = usePortalReadOnly();
  const model = useParentFormsDocumentsModel(controller);
  const scrollRef = useRef<ScrollView>(null);
  const listY = useRef(0);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Forms',
    id: 'forms-refresh',
  });

  const { setFilter } = model;
  const showWaiting = useCallback(() => {
    setFilter('needs_action');
    scrollRef.current?.scrollTo({ y: Math.max(0, listY.current - 12), animated: true });
  }, [setFilter]);

  if (controller.isInitialLoading) {
    return (
      <>
        <StatusBar style="dark" />
        <ParentFormsDocumentsGardenSkeleton onBack={controller.onBack} />
      </>
    );
  }

  const firstLoadFailed = Boolean(controller.error) && !controller.hasLoaded;

  return (
    <View style={styles.root} testID="parent-forms-documents-screen">
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing || controller.isRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }>
        <GBackHeader
          backLabel="More"
          backAccessibilityLabel="Back"
          onBack={controller.onBack}
          title="Forms & Documents"
          accentWord="Documents"
          subtitle="Review and sign forms from your child's teachers."
        />

        {readOnly ? (
          <GInlineBanner
            tone="info"
            title="Preview mode — forms can be opened but not signed here."
          />
        ) : null}

        {firstLoadFailed ? (
          <GErrorCard
            title="We couldn't load your forms"
            message={`${controller.error} Check your connection, then try again.`}
            onRetry={controller.retry}
          />
        ) : (
          <>
            <FormsNextUpCard
              totalCount={model.counts.all}
              queue={model.queue}
              signedCount={model.counts.signed}
              onOpen={controller.openForm}
              onShowWaiting={showWaiting}
            />
            <FormsProgressCard
              total={model.counts.all}
              signed={model.counts.signed}
              overdueCount={model.overdueCount}
              nextDue={model.nextDue}
              onOpen={controller.openForm}
            />
            {model.counts.all > 0 ? (
              <View
                onLayout={(event) => {
                  listY.current = event.nativeEvent.layout.y;
                }}>
                <FormsListCard
                  filter={model.filter}
                  onFilterChange={model.setFilter}
                  counts={model.counts}
                  items={model.filtered}
                  onOpen={controller.openForm}
                />
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <GCelebrate
        active={model.justCompletedAll}
        celebrationKey={`parent-forms-all-signed-${controller.slug}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48, gap: 16 },
});
