import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ParentHomeHub } from '@/components/parent/home/parent-home-hub';
import type { ParentHomeCtx } from '@/components/parent/home/parent-home-ctx';
import { ParentHomeSheets } from '@/components/parent/home/parent-home-sheets';
import type { ParentHomeDashboardProps } from '@/components/parent/home/parent-home-types';
import { useParentHomeDashboardModel } from '@/components/parent/home/use-parent-home-dashboard-model';
import { useParentHomeFeedback } from '@/components/parent/home/use-parent-home-feedback';
import type { ParentHomeScreenController } from '@/components/parent/home/use-parent-home-screen-controller';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { Garden } from '@/components/parent/garden/tokens';
import { GErrorCard, GSkeleton } from '@/components/parent/garden/ui';
import { haptic } from '@/lib/haptics';

/**
 * The parent Home (main and program portals): Garden skeleton, error card, or the
 * Hub with its sheets. The controller decides the data source and routes.
 */
export function ParentHomeGardenScreen({ controller }: { controller: ParentHomeScreenController }) {
  const failed = controller.status === 'error';
  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'loading') return <ParentHomeGardenSkeleton />;

  if (controller.status === 'error') {
    return (
      <View style={[styles.root, styles.centered]}>
        <GErrorCard message={controller.error} onRetry={() => void controller.refresh()} />
      </View>
    );
  }

  if (controller.status !== 'ready') return null;

  return <ParentHomeContent props={controller.dashboardProps} error={controller.error} />;
}

function ParentHomeContent({
  props,
  error,
}: {
  props: ParentHomeDashboardProps;
  error: string | null;
}) {
  const feedback = useParentHomeFeedback(props, error);
  const model = useParentHomeDashboardModel(feedback.dashboardProps);
  const ctx: ParentHomeCtx = { props: feedback.dashboardProps, model, feedback };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ParentHomeHub ctx={ctx} />

      <GCelebrate
        active={model.isCaughtUp && !props.isPreview}
        celebrationKey={`parent-home-caught-up-${props.slug}-${props.programSlug ?? 'main'}`}
      />

      <ParentHomeSheets
        props={feedback.dashboardProps}
        model={model}
        onProfilePhotoUpdated={feedback.onProfilePhotoUpdated}
        onProgramSelected={feedback.onProgramSelected}
      />
    </View>
  );
}

export function ParentHomeGardenSkeleton() {
  return (
    <ScrollView
      style={styles.root}
      scrollEnabled={false}
      accessibilityLabel="Loading your Home"
      contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skKicker} />
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skSubtitle} />
      <View style={styles.skGrid}>
        <GSkeleton style={styles.skWidget} />
        <GSkeleton style={styles.skWidget} />
        <GSkeleton style={styles.skWidget} />
        <GSkeleton style={styles.skWidget} />
      </View>
      <GSkeleton style={styles.skCard} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  centered: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  skeleton: {
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  skKicker: {
    width: 140,
    height: 12,
    borderRadius: 6,
  },
  skTitle: {
    width: '80%',
    height: 34,
    borderRadius: 10,
  },
  skSubtitle: {
    width: '65%',
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  skGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skWidget: {
    flexGrow: 1,
    flexBasis: '45%',
    height: 150,
    borderRadius: 22,
  },
  skCard: {
    height: 140,
  },
});
