import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ParentFridayBranchBlockStrip } from '@/components/parent/friday-branch/parent-friday-branch-block-strip';
import { ParentFridayBranchClassSheet } from '@/components/parent/friday-branch/parent-friday-branch-class-sheet';
import { ParentFridayBranchFlyerSheet } from '@/components/parent/friday-branch/parent-friday-branch-flyer-sheet';
import { ParentFridayBranchSchedule } from '@/components/parent/friday-branch/parent-friday-branch-schedule';
import { ParentFridayBranchSkeleton } from '@/components/parent/friday-branch/parent-friday-branch-skeleton';
import { ParentFridayBranchStoryHeader } from '@/components/parent/friday-branch/parent-friday-branch-story-header';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentFridayBranch } from '@/contexts/parent-friday-branch-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type {
  ParentFridayBranchClassDetailBundle,
  ParentFridayBranchFlyerTarget,
} from '@/lib/parent/parent-friday-branch-types';
import {
  findBlockIdForClass,
  formatBlockTabDateRange,
  getBlockDisplayLabel,
  resolveValidClassId,
} from '@/lib/parent/parent-friday-branch-utils';
import { parentChildrenRoute } from '@/lib/parent/parent-nav';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { screenScrollContentPadding } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type ParentFridayBranchScreenProps = {
  slug: string;
  organizationId: string;
  initialClassId?: string | null;
};

export function ParentFridayBranchScreen({
  slug,
  organizationId,
  initialClassId = null,
}: ParentFridayBranchScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const {
    bundle,
    isLoading,
    isRefreshing,
    error,
    hasLoaded,
    ensureLoaded,
    refresh,
    applyClassDetailUpdate,
  } = useParentFridayBranch();

  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [flyerTarget, setFlyerTarget] = useState<ParentFridayBranchFlyerTarget | null>(null);
  const deepLinkAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  useEffect(() => {
    if (!initialClassId || !bundle) return;
    if (deepLinkAppliedRef.current === initialClassId) return;
    const valid = resolveValidClassId(initialClassId, bundle);
    if (valid) setActiveClassId(valid);
    deepLinkAppliedRef.current = initialClassId;
  }, [initialClassId, bundle]);

  const initialBlockId = useMemo(() => {
    if (!bundle || bundle.blocks.length === 0) return null;
    const blockForClass = findBlockIdForClass(bundle, activeClassId);
    if (blockForClass) return blockForClass;
    return bundle.blocks[0]?.block.id ?? null;
  }, [activeClassId, bundle]);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(initialBlockId);

  useEffect(() => {
    if (initialBlockId) {
      setSelectedBlockId(initialBlockId);
    }
  }, [initialBlockId]);

  const selectedBlock = useMemo(
    () => bundle?.blocks.find((entry) => entry.block.id === selectedBlockId) ?? null,
    [bundle?.blocks, selectedBlockId],
  );

  const selectedBlockMeta = useMemo(() => {
    if (!selectedBlock || !bundle) return null;
    const blockIndex = bundle.blocks.findIndex(
      (entry) => entry.block.id === selectedBlock.block.id,
    );
    return {
      label: getBlockDisplayLabel(selectedBlock.block, blockIndex),
      dateRange: formatBlockTabDateRange(
        selectedBlock.block.startDate,
        selectedBlock.block.endDate,
      ),
    };
  }, [bundle, selectedBlock]);

  const activeClassContext = useMemo(() => {
    if (!activeClassId || !bundle) return null;
    for (let index = 0; index < bundle.blocks.length; index += 1) {
      const entry = bundle.blocks[index];
      const match = entry.classes.find((classSummary) => classSummary.classId === activeClassId);
      if (match) {
        return {
          summary: match,
          blockLabel: getBlockDisplayLabel(entry.block, index),
          blockDateRange: formatBlockTabDateRange(
            entry.block.startDate,
            entry.block.endDate,
          ),
        };
      }
    }
    return null;
  }, [activeClassId, bundle]);

  const openClass = useCallback((classId: string) => {
    setActiveClassId(classId);
    const blockId = bundle ? findBlockIdForClass(bundle, classId) : null;
    if (blockId) setSelectedBlockId(blockId);
  }, [bundle]);

  const closeClass = useCallback(() => {
    setActiveClassId(null);
  }, []);

  const handleEnrollmentChange = useCallback(
    (classId: string, detail: ParentFridayBranchClassDetailBundle) => {
      applyClassDetailUpdate(classId, detail);
    },
    [applyClassDetailUpdate],
  );

  if (isLoading && !hasLoaded) {
    return (
      <View style={[styles.screen, styles.paddedContent]}>
        <ParentFridayBranchStoryHeader />
        <ParentFridayBranchSkeleton />
      </View>
    );
  }

  if (error && !bundle) {
    return (
      <View style={[styles.screen, styles.paddedContent]}>
        <ParentFridayBranchStoryHeader />
        <View style={styles.errorContainer}>
          <StoryErrorBanner message={error} />
          <StoryButton label="Try again" previewSafe onPress={() => void refresh()} />
        </View>
      </View>
    );
  }

  if (!bundle) return null;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.primary}
          />
        }>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ParentFridayBranchStoryHeader />
        </Animated.View>

        {error ? (
          <View style={styles.errorBanner}>
            <StoryErrorBanner message={error} />
          </View>
        ) : null}

        {bundle.blocks.length === 0 ? (
          <StoryCard style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={40} color="#B8C4BC" style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.ink }]}>Schedule coming soon</Text>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              Friday Branch classes will appear here when your school publishes them.
            </Text>
          </StoryCard>
        ) : (
          <>
            <ParentFridayBranchBlockStrip
              blocks={bundle.blocks.map((entry) => entry.block)}
              selectedId={selectedBlockId}
              onSelect={(blockId) => {
                setSelectedBlockId(blockId);
                if (activeClassId) {
                  const classInBlock = bundle.blocks
                    .find((entry) => entry.block.id === blockId)
                    ?.classes.some((classSummary) => classSummary.classId === activeClassId);
                  if (!classInBlock) closeClass();
                }
              }}
            />

            {bundle.studentOptions.length === 0 ? (
              <StoryCard style={styles.emptyCard}>
                <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                  Add a child under My children before signing up for Friday Branch classes.
                </Text>
                <StoryButton
                  label="Go to My children"
                  previewSafe
                  onPress={() => router.push(parentChildrenRoute(slug))}
                  style={styles.emptyAction}
                />
              </StoryCard>
            ) : null}

            {selectedBlock && selectedBlock.classes.length > 0 && selectedBlockMeta ? (
              <ParentFridayBranchSchedule
                classes={selectedBlock.classes}
                studentOptions={bundle.studentOptions}
                blockLabel={selectedBlockMeta.label}
                blockDateRange={selectedBlockMeta.dateRange}
                onOpenClass={openClass}
                onViewFlyer={setFlyerTarget}
              />
            ) : (
              <StoryCard style={styles.emptyCard}>
                <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                  No classes published yet for this block.
                </Text>
              </StoryCard>
            )}
          </>
        )}
      </ScrollView>

      <ParentFridayBranchClassSheet
        visible={Boolean(activeClassId)}
        organizationId={organizationId}
        classId={activeClassId}
        fallbackSummary={activeClassContext?.summary ?? null}
        blockLabel={activeClassContext?.blockLabel ?? selectedBlockMeta?.label}
        blockDateRange={activeClassContext?.blockDateRange ?? selectedBlockMeta?.dateRange}
        studentOptions={bundle.studentOptions}
        onClose={closeClass}
        onEnrollmentChange={handleEnrollmentChange}
        onViewFlyer={setFlyerTarget}
      />

      <ParentFridayBranchFlyerSheet
        visible={Boolean(flyerTarget)}
        organizationId={organizationId}
        target={flyerTarget}
        onClose={() => setFlyerTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  paddedContent: {
    ...screenScrollContentPadding,
  },
  content: {
    ...screenScrollContentPadding,
    gap: Spacing.four,
  },
  errorContainer: {
    gap: Spacing.four,
  },
  errorBanner: {
    marginBottom: Spacing.four,
  },
  emptyCard: {
    padding: StoryCardPadding,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: Spacing.four,
  },
});
