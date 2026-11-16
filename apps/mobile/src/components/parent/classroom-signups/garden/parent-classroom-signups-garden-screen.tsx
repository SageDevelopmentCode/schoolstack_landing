import { StatusBar } from 'expo-status-bar';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ParentClassroomSignupsGardenSkeleton } from '@/components/parent/classroom-signups/garden/parent-classroom-signups-garden-skeleton';
import {
  HowSignupsWorkCard,
  SignupsListCard,
  SignupsNextUpCard,
  UpcomingHelpCard,
} from '@/components/parent/classroom-signups/garden/signups-sections';
import { useParentClassroomSignupsModel } from '@/components/parent/classroom-signups/garden/use-parent-classroom-signups-model';
import type { ParentClassroomSignupsScreenController } from '@/components/parent/classroom-signups/garden/use-parent-classroom-signups-screen-controller';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, useGardenAccent } from '@/components/parent/garden/tokens';
import { GErrorCard, GLink } from '@/components/parent/garden/ui';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';

/**
 * Classroom signups in Garden: header → Next up (the first open request) →
 * your upcoming help → all signups (filterable) → how it works.
 */
export function ParentClassroomSignupsGardenScreen({
  controller,
}: {
  controller: ParentClassroomSignupsScreenController;
}) {
  const accent = useGardenAccent();
  const readOnly = usePortalReadOnly();
  const model = useParentClassroomSignupsModel(controller.items);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Classroom signups',
    id: 'classroom-signups-refresh',
  });

  if (controller.isInitialLoading) {
    return (
      <>
        <StatusBar style="dark" />
        <ParentClassroomSignupsGardenSkeleton onBack={controller.onBack} />
      </>
    );
  }

  const failedFirstLoad = Boolean(controller.error) && !controller.hasLoaded;
  const hasAny = controller.items.length > 0;

  return (
    <View style={styles.root} testID="parent-classroom-signups-screen">
      <StatusBar style="dark" />
      <ScrollView
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
          title="Classroom signups"
          accentWord="signups"
          subtitle="Help teachers by signing up for volunteer requests."
        />

        {readOnly ? (
          <GInlineBanner
            tone="info"
            title="Preview mode"
            description="Signups can be opened but not answered here."
          />
        ) : null}

        {failedFirstLoad ? (
          <GErrorCard
            title="We couldn't load your signups"
            message={`${controller.error} Check your connection, then try again.`}
            onRetry={() => void onPullRefresh()}
          />
        ) : (
          <>
            {controller.error && !pullRefreshing ? (
              <GInlineBanner
                tone="warning"
                title="Showing your last saved signups"
                description={controller.error}
                action={
                  <GLink
                    label="Try again"
                    icon="refresh"
                    onPress={() => void onPullRefresh()}
                    style={styles.bannerLink}
                  />
                }
              />
            ) : null}
            <SignupsNextUpCard
              model={model}
              hasAny={hasAny}
              readOnly={readOnly}
              onOpen={controller.openSignup}
            />
            <UpcomingHelpCard upcoming={model.upcoming} onOpen={controller.openSignup} />
            {hasAny ? (
              <SignupsListCard model={model} readOnly={readOnly} onOpen={controller.openSignup} />
            ) : null}
            <HowSignupsWorkCard waiting={model.counts.needs_response} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48, gap: 16 },
  bannerLink: { alignSelf: 'flex-start', marginTop: 6, minHeight: 28 },
});
