import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import type { ParentHomeDashboardProps } from '@/components/parent/home/parent-home-dashboard';
import { ParentHomeSheets } from '@/components/parent/home/parent-home-sheets';
import { useParentHomeDashboardModel } from '@/components/parent/home/use-parent-home-dashboard-model';
import { useParentHomeScreenController } from '@/components/parent/home/use-parent-home-screen-controller';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { useGardenFonts } from '@/components/parent/garden/fonts';
import { GardenToastProvider, useGardenToast } from '@/components/parent/garden/toast';
import { Garden } from '@/components/parent/garden/tokens';
import { GErrorCard, GSkeleton } from '@/components/parent/garden/ui';
import type { HomeLabCtx } from '@/components/parent/home-lab/types';
import { useHomeLabFeedback } from '@/components/parent/home-lab/use-home-lab-feedback';
import { HomeVariantFocus } from '@/components/parent/home-lab/variant-b-focus';
import { HomeVariantHub } from '@/components/parent/home-lab/variant-c-hub';
import { HomeVariantToday } from '@/components/parent/home-lab/variant-a-today';
import { haptic } from '@/lib/haptics';
import type { ParentHomeLabVariantId } from '@/lib/parent/home-lab';

type ParentHomeLabScreenProps = {
  slug: string;
  variant: ParentHomeLabVariantId;
};

/** TEMPORARY: hosts one of the three Home lab variants with the real Home data + callbacks. */
export function ParentHomeLabScreen({ slug, variant }: ParentHomeLabScreenProps) {
  const fontsReady = useGardenFonts();
  return (
    // The parent layout's SafeAreaView already pads the top edge.
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <GardenToastProvider>
        {fontsReady ? <HomeLabContent slug={slug} variant={variant} /> : <HomeLabSkeleton />}
      </GardenToastProvider>
    </GestureHandlerRootView>
  );
}

function HomeLabContent({ slug, variant }: ParentHomeLabScreenProps) {
  const toast = useGardenToast();
  const controller = useParentHomeScreenController(slug, {
    onUnresolvedNavigation: () =>
      toast.info('This opens on the web portal', {
        id: 'home-unresolved',
        description: "It isn't available in the app yet.",
      }),
  });

  const failed = controller.status === 'error';
  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'loading') return <HomeLabSkeleton />;

  if (controller.status === 'error') {
    return (
      <HomeLabErrorState message={controller.error} onRetry={() => void controller.refresh()} />
    );
  }

  if (controller.status !== 'ready') return null;

  return <HomeLabVariant variant={variant} props={controller.dashboardProps} />;
}

function HomeLabVariant({
  variant,
  props,
}: {
  variant: ParentHomeLabVariantId;
  props: ParentHomeDashboardProps;
}) {
  const feedback = useHomeLabFeedback(props);
  const model = useParentHomeDashboardModel(feedback.dashboardProps);
  const ctx: HomeLabCtx = { props: feedback.dashboardProps, model, feedback };

  return (
    <View style={styles.root}>
      {variant === 'a' ? <HomeVariantToday ctx={ctx} /> : null}
      {variant === 'b' ? <HomeVariantFocus ctx={ctx} /> : null}
      {variant === 'c' ? <HomeVariantHub ctx={ctx} /> : null}

      <GCelebrate
        active={model.isCaughtUp && !props.isPreview}
        celebrationKey={`parent-home-caught-up-${props.slug}`}
      />

      <ParentHomeSheets
        props={feedback.dashboardProps}
        model={model}
        onNotificationsMarkedRead={feedback.onNotificationsMarkedRead}
        onProfilePhotoUpdated={feedback.onProfilePhotoUpdated}
        onProgramSelected={feedback.onProgramSelected}
      />
    </View>
  );
}

function HomeLabErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={[styles.root, styles.centered]}>
      <GErrorCard message={message} onRetry={onRetry} />
    </View>
  );
}

export function HomeLabSkeleton() {
  return (
    <ScrollView
      style={styles.root}
      scrollEnabled={false}
      accessibilityLabel="Loading your Home"
      contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skKicker} />
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skSubtitle} />
      <GSkeleton style={styles.skCardTall} />
      <GSkeleton style={styles.skCard} />
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
  skCardTall: {
    height: 220,
  },
  skCard: {
    height: 140,
  },
});
