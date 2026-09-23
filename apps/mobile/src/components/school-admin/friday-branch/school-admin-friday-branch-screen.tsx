import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SchoolAdminFridayBranchBlockActionsSheet } from '@/components/school-admin/friday-branch/school-admin-friday-branch-block-actions-sheet';
import { SchoolAdminFridayBranchBlockDetailsSheet } from '@/components/school-admin/friday-branch/school-admin-friday-branch-block-details-sheet';
import { SchoolAdminFridayBranchBlockStrip } from '@/components/school-admin/friday-branch/school-admin-friday-branch-block-strip';
import { SchoolAdminFridayBranchRecentActivity } from '@/components/school-admin/friday-branch/school-admin-friday-branch-recent-activity';
import { SchoolAdminFridayBranchSchedule } from '@/components/school-admin/friday-branch/school-admin-friday-branch-schedule';
import { SchoolAdminFridayBranchSkeleton } from '@/components/school-admin/friday-branch/school-admin-friday-branch-skeleton';
import { SchoolAdminFridayBranchStoryHeader } from '@/components/school-admin/friday-branch/school-admin-friday-branch-story-header';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useSchoolAdminFridayBranch } from '@/contexts/school-admin-friday-branch-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { confirmDiscardUnsavedChanges } from '@/lib/unsaved-changes';
import {
  blockScheduleEntering,
  blockScheduleExiting,
  type FridayBranchBlockTransitionDirection,
} from '@/lib/school-admin/friday-branch/friday-branch-block-motion';
import {
  findBlockIdForClass,
  formatBlockTabDateRange,
  formatGapReviewLabel,
  getBlockDisplayLabel,
  getScheduleGaps,
} from '@/lib/school-admin/friday-branch/friday-branch-utils';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING, screenScrollContentPadding } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

const FRIDAY_BRANCH_SAVE_FOOTER_HEIGHT = 88;

type SchoolAdminFridayBranchScreenProps = {
  organizationId: string;
  initialClassId?: string | null;
};

export function SchoolAdminFridayBranchScreen({
  organizationId,
  initialClassId = null,
}: SchoolAdminFridayBranchScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const {
    blocks,
    selectedBlockId,
    isDirty,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    hasLoaded,
    setSelectedBlockId,
    updateBlock,
    addBlock,
    duplicateSelectedBlock,
    refresh,
    saveSchedule,
    persistSchedule,
  } = useSchoolAdminFridayBranch();

  const [blockDetailsOpen, setBlockDetailsOpen] = useState(false);
  const [blockActionsOpen, setBlockActionsOpen] = useState(false);
  const [addSlotOpen, setAddSlotOpen] = useState(false);
  const [highlightClassId, setHighlightClassId] = useState<string | null>(null);
  const [requestedClassId, setRequestedClassId] = useState<string | null>(initialClassId);
  const [transitionDirection, setTransitionDirection] =
    useState<FridayBranchBlockTransitionDirection>('forward');
  const previousBlockIndexRef = useRef(0);

  useEffect(() => {
    if (!initialClassId || blocks.length === 0) return;
    const blockId = findBlockIdForClass(blocks, initialClassId);
    if (blockId) {
      setSelectedBlockId(blockId);
      setRequestedClassId(initialClassId);
    }
  }, [blocks, initialClassId, setSelectedBlockId]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isDirty) return false;
      confirmDiscardUnsavedChanges(() => router.back());
      return true;
    });

    return () => subscription.remove();
  }, [isDirty, router]);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );

  const selectedBlockMeta = useMemo(() => {
    if (!selectedBlock) return null;
    const blockIndex = blocks.findIndex((block) => block.id === selectedBlock.id);
    return {
      label: getBlockDisplayLabel(selectedBlock, blockIndex),
      dateRange: formatBlockTabDateRange(selectedBlock.startDate, selectedBlock.endDate),
    };
  }, [blocks, selectedBlock]);

  const selectedBlockIndex = useMemo(
    () => blocks.findIndex((block) => block.id === selectedBlockId),
    [blocks, selectedBlockId],
  );

  const gapCount = useMemo(
    () => (selectedBlock ? getScheduleGaps(selectedBlock).length : 0),
    [selectedBlock],
  );

  useEffect(() => {
    if (selectedBlockIndex < 0) return;

    if (selectedBlockIndex !== previousBlockIndexRef.current) {
      setTransitionDirection(
        selectedBlockIndex >= previousBlockIndexRef.current ? 'forward' : 'back',
      );
      previousBlockIndexRef.current = selectedBlockIndex;
    }
  }, [selectedBlockIndex]);

  const handleSave = useCallback(async () => {
    try {
      await saveSchedule();
      Alert.alert('Saved', 'Friday Branch schedule saved.');
    } catch (saveError) {
      Alert.alert(
        'Save failed',
        saveError instanceof Error ? saveError.message : 'Failed to save Friday Branch schedule.',
      );
    }
  }, [saveSchedule]);

  const handleClassSaved = useCallback(
    async (nextBlock: Parameters<typeof updateBlock>[0]) => {
      const nextBlocks = blocks.map((block) => (block.id === nextBlock.id ? nextBlock : block));
      try {
        await persistSchedule(nextBlocks);
        Alert.alert('Saved', 'Class saved.');
      } catch (saveError) {
        Alert.alert(
          'Save failed',
          saveError instanceof Error ? saveError.message : 'Failed to save class.',
        );
        throw saveError;
      }
    },
    [blocks, persistSchedule],
  );

  const handleReviewGaps = useCallback(() => {
    if (!selectedBlock) return;
    const gaps = getScheduleGaps(selectedBlock);
    if (gaps.length === 0) return;
    setHighlightClassId(gaps[0].classId);
    setTimeout(() => setHighlightClassId(null), 3000);
  }, [selectedBlock]);

  const handleOpenClassFromActivity = useCallback(
    (classId: string, blockId: string) => {
      setSelectedBlockId(blockId);
      setRequestedClassId(classId);
      setHighlightClassId(classId);
      setTimeout(() => setHighlightClassId(null), 3000);
    },
    [setSelectedBlockId],
  );

  const handleBlockLongPress = useCallback(
    (blockId: string) => {
      setSelectedBlockId(blockId);
      setBlockActionsOpen(true);
    },
    [setSelectedBlockId],
  );

  if (isLoading && !hasLoaded) {
    return (
      <View style={[styles.screen, styles.paddedContent]}>
        <SchoolAdminFridayBranchStoryHeader />
        <SchoolAdminFridayBranchSkeleton />
      </View>
    );
  }

  if (error && blocks.length === 0) {
    return (
      <View style={[styles.screen, styles.paddedContent]}>
        <SchoolAdminFridayBranchStoryHeader />
        <View style={styles.errorContainer}>
          <StoryErrorBanner message={error} />
          <StoryButton label="Try again" previewSafe onPress={() => void refresh()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: FRIDAY_BRANCH_SAVE_FOOTER_HEIGHT + Spacing.two },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.primary}
          />
        }>
        {error ? (
          <View style={styles.errorBanner}>
            <StoryErrorBanner message={error} />
          </View>
        ) : null}

        <Animated.View entering={FadeInDown.duration(300)}>
          <SchoolAdminFridayBranchBlockStrip
            blocks={blocks}
            selectedId={selectedBlockId}
            onSelect={setSelectedBlockId}
            onBlockLongPress={handleBlockLongPress}
            onAddBlock={addBlock}
          />
        </Animated.View>

        {blocks.length === 0 ? (
          <StoryCard style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: theme.ink }]}>Add your first block</Text>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              Blocks group your Friday classes by date range.
            </Text>
            <StoryButton label="Add block" previewSafe onPress={addBlock} style={styles.emptyAction} />
          </StoryCard>
        ) : selectedBlock && selectedBlockMeta ? (
          <View style={styles.blockScheduleContainer}>
            <Animated.View
              key={selectedBlockId}
              entering={blockScheduleEntering(transitionDirection)}
              exiting={blockScheduleExiting(transitionDirection)}
              style={styles.blockScheduleContent}>
              <View style={styles.blockToolbar}>
                <View style={styles.blockActions}>
                  {gapCount > 0 ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={formatGapReviewLabel(gapCount)}
                      onPress={handleReviewGaps}
                      style={({ pressed }) => [
                        styles.toolbarButton,
                        {
                          backgroundColor: theme.warningBg,
                          borderColor: theme.warning,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}>
                      <Ionicons name="alert-circle-outline" size={18} color={theme.warning} />
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.toolbarButtonLabel, { color: theme.warning }]}>
                        {formatGapReviewLabel(gapCount)}
                      </Text>
                    </Pressable>
                  ) : null}

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add time slot"
                    disabled={isSaving}
                    onPress={() => setAddSlotOpen(true)}
                    style={({ pressed }) => [
                      styles.toolbarButton,
                      {
                        backgroundColor: theme.white,
                        borderColor: theme.line,
                        opacity: pressed ? 0.85 : isSaving ? 0.5 : 1,
                      },
                    ]}>
                    <Ionicons name="add" size={18} color={theme.primary} />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.toolbarButtonLabel, { color: theme.primary }]}>
                      Add time slot
                    </Text>
                  </Pressable>
                </View>
              </View>

              <SchoolAdminFridayBranchSchedule
                organizationId={organizationId}
                block={selectedBlock}
                saving={isSaving}
                highlightClassId={highlightClassId}
                requestedClassId={requestedClassId}
                addSlotOpen={addSlotOpen}
                onAddSlotOpenChange={setAddSlotOpen}
                onRequestedClassHandled={() => setRequestedClassId(null)}
                onChange={updateBlock}
                onClassSaved={handleClassSaved}
              />
            </Animated.View>
          </View>
        ) : (
          <StoryCard style={styles.emptyCard}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              Select a block to edit its Friday schedule.
            </Text>
          </StoryCard>
        )}

        <SchoolAdminFridayBranchRecentActivity
          organizationId={organizationId}
          onOpenClass={handleOpenClassFromActivity}
        />
      </ScrollView>

      <View style={[styles.saveFooterBar, { backgroundColor: theme.white, borderTopColor: theme.line }]}>
        <View style={styles.saveFooterInner}>
          {isDirty && !isSaving ? (
            <Text style={[styles.dirtyLabel, { color: theme.muted }]}>Unsaved changes</Text>
          ) : null}
          <StoryButton
            label={isSaving ? 'Saving…' : 'Save schedule'}
            previewSafe
            disabled={!isDirty || isSaving}
            onPress={() => void handleSave()}
          />
        </View>
      </View>

      <SchoolAdminFridayBranchBlockActionsSheet
        visible={blockActionsOpen}
        blockLabel={selectedBlockMeta?.label ?? 'Block'}
        onClose={() => setBlockActionsOpen(false)}
        onEditBlock={() => setBlockDetailsOpen(true)}
        onDuplicateBlock={duplicateSelectedBlock}
      />

      <SchoolAdminFridayBranchBlockDetailsSheet
        visible={blockDetailsOpen}
        block={selectedBlock}
        onClose={() => setBlockDetailsOpen(false)}
        onChange={updateBlock}
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
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  saveFooterBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
  },
  saveFooterInner: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  dirtyLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  errorContainer: {
    gap: Spacing.four,
  },
  errorBanner: {
    marginBottom: Spacing.two,
  },
  emptyCard: {
    padding: StoryCardPadding,
    alignItems: 'center',
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
  blockScheduleContainer: {
    overflow: 'hidden',
  },
  blockScheduleContent: {
    gap: Spacing.three,
  },
  blockToolbar: {
    width: '100%',
  },
  blockActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    gap: Spacing.two,
  },
  toolbarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  toolbarButtonLabel: {
    flexShrink: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
