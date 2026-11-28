import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef } from 'react';
import { RefreshControl, StyleSheet, Text, View, type ScrollView } from 'react-native';

import {
  CoopEmptyPanel,
  CoopScreenRoot,
  coopContentStyle,
} from '@/components/parent/coop/garden/coop-garden-ui';
import { CoopCurriculumSkeleton } from '@/components/parent/coop/garden/coop-garden-skeletons';
import { CurriculumDiscussionCard } from '@/components/parent/coop/garden/curriculum-discussion-card';
import type { CoopCurriculumController } from '@/components/parent/coop/garden/use-coop-curriculum-controller';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GLink, GOutlineButton } from '@/components/parent/garden/ui';
import { ParentKeyboardAwareScrollView } from '@/components/parent/parent-keyboard-aware-scroll-view';
import { ParentEmbeddedPdfLoadingPlaceholder } from '@/components/parent/shared/parent-embedded-pdf-loading-placeholder';
import { ParentEmbeddedPdfPreview } from '@/components/parent/shared/parent-embedded-pdf-preview';
import { curriculumGuideLabel, formatGuideFileSize } from '@/lib/parent/coop/curriculum-helpers';

const TITLE = 'Curriculum';
const SUBTITLE = 'Guides and discussion for your co-op week.';
/** Tall enough to read page 1 of a portrait guide without expanding. */
const PREVIEW_HEIGHT = 440;

/**
 * Co-op Curriculum in Garden: header → guide picker → the guide (page 1,
 * tap for the full reader) → the guide's discussion.
 */
export function CoopCurriculumGardenScreen({ controller }: { controller: CoopCurriculumController }) {
  const accent = useGardenAccent();
  const scrollRef = useRef<ScrollView>(null);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Curriculum',
    id: 'coop-curriculum-refresh',
  });

  const guideItems = useMemo(
    () =>
      controller.curricula.map((guide) => ({
        id: guide.id,
        label: curriculumGuideLabel(guide),
        testID: `parent-coop-curriculum-guide-${guide.id}`,
      })),
    [controller.curricula],
  );

  const scrollDiscussionIntoView = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  if (controller.status === 'loading') {
    return <CoopCurriculumSkeleton title={TITLE} subtitle={SUBTITLE} />;
  }

  const ready = controller.status === 'ready';
  const active = controller.activeCurriculum;
  const guideName = active ? curriculumGuideLabel(active) : 'Curriculum';
  const size = formatGuideFileSize(controller.pdf.fileSizeBytes);
  const { pdf } = controller;

  return (
    <CoopScreenRoot>
      <ParentKeyboardAwareScrollView
        ref={scrollRef}
        testID={ready ? 'parent-coop-curriculum-ready' : undefined}
        includeTabBarPadding={false}
        contentContainerStyle={coopContentStyle}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }>
        <GBackHeader
          title={TITLE}
          accentWord={TITLE}
          subtitle={SUBTITLE}
          testID="parent-coop-curriculum-header"
        />

        {!ready ? (
          <GErrorCard
            title="We couldn't load the curriculum"
            message={`${controller.error ?? 'Something went wrong.'} Check your connection, then try again.`}
            onRetry={() => void onPullRefresh()}
          />
        ) : controller.curricula.length === 0 ? (
          <CoopEmptyPanel icon="book-outline" message="No curriculum guides yet." />
        ) : (
          <>
            {controller.error && !pullRefreshing ? (
              <GInlineBanner
                tone="warning"
                title="Showing the guides we loaded earlier"
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

            {guideItems.length > 1 && active ? (
              <GSegmented
                items={guideItems}
                activeId={active.id}
                onChange={controller.selectCurriculum}
                scrollable
                accessibilityLabel="Choose a curriculum guide"
              />
            ) : null}

            <GCard
              index={1}
              title={guideName}
              action={size ? <GChip tone="neutral" icon="document-outline" label={size} /> : null}
              testID="parent-coop-curriculum-guide">
              <View style={styles.preview}>
                {pdf.url ? (
                  <ParentEmbeddedPdfPreview
                    key={pdf.url}
                    url={pdf.url}
                    title={guideName}
                    minHeight={PREVIEW_HEIGHT}
                    reportEntityType="curriculum"
                    reportEntityId={active?.id}
                  />
                ) : pdf.failed ? (
                  <View style={styles.failed}>
                    <Ionicons name="document-text-outline" size={28} color={Garden.soft} />
                    <Text style={styles.failedTitle}>{"We couldn't open this guide"}</Text>
                    <Text style={styles.failedBody}>Check your connection, then try again.</Text>
                    <GOutlineButton label="Try again" icon="refresh" onPress={controller.retryPdf} style={styles.centered} />
                  </View>
                ) : (
                  <View style={styles.loadingBox}>
                    <ParentEmbeddedPdfLoadingPlaceholder title={guideName} />
                  </View>
                )}
              </View>
              {pdf.url ? (
                <View style={styles.hintRow}>
                  <Ionicons name="hand-left-outline" size={15} color={Garden.soft} />
                  <Text style={styles.hint}>Tap the page to read the whole guide.</Text>
                </View>
              ) : null}
            </GCard>

            <CurriculumDiscussionCard
              index={2}
              guideName={guideName}
              open={controller.discussionOpen}
              onToggle={() => controller.setDiscussionOpen(!controller.discussionOpen)}
              messages={controller.messages}
              loading={controller.messagesLoading}
              currentGuardianId={controller.currentGuardianId}
              readOnly={controller.readOnly}
              onSend={controller.sendMessage}
              onComposerFocus={scrollDiscussionIntoView}
            />
          </>
        )}
      </ParentKeyboardAwareScrollView>
    </CoopScreenRoot>
  );
}

const styles = StyleSheet.create({
  bannerLink: { alignSelf: 'flex-start', marginTop: 6, minHeight: 28 },
  preview: {
    minHeight: PREVIEW_HEIGHT,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.cream,
    overflow: 'hidden',
  },
  loadingBox: { height: PREVIEW_HEIGHT },
  failed: {
    minHeight: PREVIEW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  failedTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 16, color: Garden.ink, textAlign: 'center' },
  failedBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    color: Garden.soft,
    textAlign: 'center',
    marginBottom: 6,
  },
  centered: { alignSelf: 'center' },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  hint: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
});
