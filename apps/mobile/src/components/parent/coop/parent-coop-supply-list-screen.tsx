import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ParentCoopSupplyListSkeleton } from '@/components/parent/coop/parent-coop-supply-list-skeleton';
import { ParentCoopSupplyListStoryHeader } from '@/components/parent/coop/parent-coop-supply-list-story-header';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  COOP_SUPPLY_MAX_ASSIGNED_FAMILIES,
  computeSupplyListSummary,
  formatSupplyAssignedFamilies,
  isSupplyFamilyAssigned,
  supplyItemDisplayName,
  supplyItemTypeChipTone,
  supplyItemTypeLabel,
  supplyUsageTimingLabel,
} from '@/lib/parent/coop/supply-list-helpers';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import {
  claimParentCoopSupplyItem,
  fetchParentCoopSupplyListPageData,
  unclaimParentCoopSupplyItem,
  type ParentCoopSupplyListItem,
} from '@/lib/parent/parent-portal-api';

type ParentCoopSupplyListScreenProps = {
  organizationId: string;
  programId: string;
};

function SummaryStatCard({
  label,
  value,
  ink,
  muted,
}: {
  label: string;
  value: string;
  ink: string;
  muted: string;
}) {
  return (
    <StoryCard compact style={styles.summaryCard}>
      <Text style={[styles.summaryLabel, { color: muted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: ink }]}>{value}</Text>
    </StoryCard>
  );
}

export function ParentCoopSupplyListScreen({
  organizationId,
  programId,
}: ParentCoopSupplyListScreenProps) {
  const theme = useParentTheme();
  const previewReadOnly = usePortalReadOnly();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ParentCoopSupplyListItem[]>([]);
  const [currentFamilyId, setCurrentFamilyId] = useState('');
  const [familyNameMap, setFamilyNameMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchParentCoopSupplyListPageData(organizationId, programId);
      setItems(data.items);
      setCurrentFamilyId(data.currentFamilyId);
      setFamilyNameMap(data.familyNameMap);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load supply list.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, programId]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.name, item.whereToBuy, item.quantityLabel].join(' ').toLowerCase().includes(query),
    );
  }, [items, search]);

  const summary = useMemo(() => computeSupplyListSummary(items), [items]);

  const handleToggle = async (item: ParentCoopSupplyListItem) => {
    if (previewReadOnly || pendingId) return;
    setPendingId(item.id);
    try {
      const signedUp = isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId);
      const result = signedUp
        ? await unclaimParentCoopSupplyItem({
            organizationId,
            programId,
            itemId: item.id,
          })
        : await claimParentCoopSupplyItem({
            organizationId,
            programId,
            itemId: item.id,
          });
      setItems((prev) => prev.map((row) => (row.id === item.id ? result.item : row)));
    } catch {
      await load();
    } finally {
      setPendingId(null);
    }
  };

  if (loading) {
    return <ParentCoopSupplyListSkeleton />;
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={{ color: theme.muted }}>{error}</Text>
        <StoryButton label="Try again" previewSafe onPress={() => void load()} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="parent-coop-supply-list-ready"
      style={{ flex: 1, backgroundColor: Story.paper }}
      contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(280)}>
        <ParentCoopSupplyListStoryHeader search={search} onSearchChange={setSearch} />
      </Animated.View>

      {items.length > 0 ? (
        <Animated.View entering={FadeInDown.duration(300).delay(40)} style={styles.summaryRow}>
          <SummaryStatCard
            label="ITEMS"
            value={String(summary.itemCount)}
            ink={theme.ink}
            muted={theme.muted}
          />
          <SummaryStatCard
            label="ASSIGNED"
            value={String(summary.assignedCount)}
            ink={theme.ink}
            muted={theme.muted}
          />
          <SummaryStatCard
            label="OPEN"
            value={String(summary.openCount)}
            ink={theme.ink}
            muted={theme.muted}
          />
        </Animated.View>
      ) : null}

      {visibleItems.length === 0 ? (
        <Text style={[styles.empty, { color: theme.muted }]}>
          {items.length === 0 ? 'No supply items yet.' : 'No items match your search.'}
        </Text>
      ) : (
        visibleItems.map((item, index) => {
          const signedUp = isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId);
          const full = item.assignedFamilyIds.length >= COOP_SUPPLY_MAX_ASSIGNED_FAMILIES;
          const canSignUp = !signedUp && !full;
          const showLiveAction = signedUp || canSignUp;
          const metaLine = [
            supplyUsageTimingLabel(item),
            item.quantityLabel,
            item.whereToBuy?.trim(),
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <Animated.View key={item.id} entering={FadeInDown.duration(280).delay(80 + index * 25)}>
              <StoryCard>
                <View style={styles.cardInner}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.itemTitle, { color: theme.ink, flex: 1 }]}>
                      {supplyItemDisplayName(item)}
                    </Text>
                    <StoryChip
                      tone={supplyItemTypeChipTone(item.itemType)}
                      label={supplyItemTypeLabel(item.itemType)}
                      uppercase={false}
                    />
                  </View>
                  {metaLine ? (
                    <Text style={[styles.meta, { color: theme.muted }]}>{metaLine}</Text>
                  ) : null}
                  <Text style={[styles.meta, { color: theme.muted }]}>
                    <Text style={[styles.metaLabel, { color: theme.ink }]}>Signed up: </Text>
                    {formatSupplyAssignedFamilies(item.assignedFamilyIds, familyNameMap)}
                  </Text>
                  {previewReadOnly ? (
                    signedUp ? (
                      <StoryChip tone="success" label="You're signed up" uppercase={false} />
                    ) : full ? (
                      <StoryChip tone="neutral" label="Full" uppercase={false} />
                    ) : null
                  ) : showLiveAction ? (
                    <Pressable
                      disabled={Boolean(pendingId) || (!signedUp && full)}
                      onPress={() => void handleToggle(item)}
                      style={[
                        styles.action,
                        {
                          backgroundColor: signedUp ? theme.primarySoft : theme.primary,
                          opacity: pendingId === item.id ? 0.6 : 1,
                        },
                      ]}>
                      <Text
                        style={{
                          color: signedUp ? theme.primary : theme.white,
                          fontFamily: StoryFonts.bodyMedium,
                          fontSize: 13,
                        }}>
                        {signedUp ? 'Withdraw' : full ? 'Full' : 'Sign up'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </StoryCard>
            </Animated.View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.three,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  summaryCard: {
    minWidth: '30%',
    flexGrow: 1,
    padding: Spacing.three,
    gap: 4,
  },
  summaryLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 22,
  },
  empty: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    paddingVertical: Spacing.four,
  },
  cardInner: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  itemTitle: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 16,
    lineHeight: 22,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  metaLabel: {
    fontFamily: StoryFonts.bodyMedium,
  },
  action: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
});
