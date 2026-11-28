import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import {
  CoopEmptyPanel,
  CoopScreenRoot,
  CoopSearchField,
  CoopStatStrip,
  coopContentStyle,
} from '@/components/parent/coop/garden/coop-garden-ui';
import { CoopSupplyListSkeleton } from '@/components/parent/coop/garden/coop-garden-skeletons';
import { SupplyItemCard } from '@/components/parent/coop/garden/supply-item-card';
import { SupplyItemSheet } from '@/components/parent/coop/garden/supply-item-sheet';
import type { CoopSupplyListController } from '@/components/parent/coop/garden/use-coop-supply-list-controller';
import { useCoopSignupFeedback } from '@/components/parent/coop/garden/use-coop-signup-feedback';
import { GBackHeader } from '@/components/parent/garden/back-header';
import {
  closeThen,
  useGardenPullRefresh,
  useGardenReadOnlyGate,
} from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GErrorCard, GLink } from '@/components/parent/garden/ui';
import {
  MOBILE_SUPPLY_FILTER_PILLS,
  computeSupplyListSummary,
  countMySupplySignups,
  filterMobileSupplyItems,
  supplyItemDisplayName,
  type MobileSupplyFilterKey,
} from '@/lib/parent/coop/supply-list-helpers';
import type { ParentCoopSupplyListItem } from '@/lib/parent/parent-portal-api';

const TITLE = 'Supply list';
const SUBTITLE = 'Sign up for shared supplies your family can bring to co-op weeks.';

/**
 * Co-op Supply list in Garden: header → search → at a glance → sign-up filter
 * → item cards (virtualized). Tapping an item opens its detail sheet.
 */
export function CoopSupplyListGardenScreen({ controller }: { controller: CoopSupplyListController }) {
  const accent = useGardenAccent();
  const { guard } = useGardenReadOnlyGate();
  const notifySignup = useCoopSignupFeedback();
  const [search, setSearch] = useState('');
  const [filterKey, setFilterKey] = useState<MobileSupplyFilterKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Supply list',
    id: 'coop-supply-list-refresh',
  });

  const { items, currentFamilyId, colorLegend, toggleItem } = controller;
  const summary = useMemo(() => computeSupplyListSummary(items), [items]);
  const mine = useMemo(() => countMySupplySignups(items, currentFamilyId), [items, currentFamilyId]);
  const visibleItems = useMemo(
    () => filterMobileSupplyItems(items, { search, filterKey, currentFamilyId }),
    [items, search, filterKey, currentFamilyId],
  );
  const legendById = useMemo(
    () => new Map(colorLegend.map((entry) => [entry.id, { hex: entry.hex, label: entry.label }])),
    [colorLegend],
  );
  const highlightFor = useCallback(
    (item: ParentCoopSupplyListItem) => (item.colorId ? legendById.get(item.colorId) ?? null : null),
    [legendById],
  );
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const filterItems = useMemo(
    () =>
      MOBILE_SUPPLY_FILTER_PILLS.map((pill) => ({
        id: pill.key,
        label: pill.label,
        badge: pill.key === 'mine' && mine > 0 ? mine : undefined,
        testID: `parent-coop-supply-filter-${pill.key}`,
      })),
    [mine],
  );

  const runToggle = useCallback(
    async (item: ParentCoopSupplyListItem, fromSheet: boolean) => {
      const result = await toggleItem(item);
      const notify = () =>
        notifySignup(result, { itemName: supplyItemDisplayName(item) });
      // Toasts render behind a native sheet: close it first, then tell the parent.
      if (fromSheet && result.ok !== null) closeThen(() => setSheetOpen(false), notify);
      else notify();
    },
    [notifySignup, toggleItem],
  );
  const onToggleRow = useMemo(
    () => guard((item: ParentCoopSupplyListItem) => void runToggle(item, false)),
    [guard, runToggle],
  );
  const onToggleSheet = useMemo(
    () => guard((item: ParentCoopSupplyListItem) => void runToggle(item, true)),
    [guard, runToggle],
  );
  const onOpen = useCallback((item: ParentCoopSupplyListItem) => {
    setSelectedId(item.id);
    setSheetOpen(true);
  }, []);

  if (controller.status === 'loading') {
    return <CoopSupplyListSkeleton title={TITLE} subtitle={SUBTITLE} />;
  }

  const ready = controller.status === 'ready';
  const filtered = visibleItems.length !== items.length;

  const header = (
    <View style={styles.headerStack}>
      <GBackHeader title={TITLE} accentWord="list" subtitle={SUBTITLE} testID="parent-coop-supply-list-header" />

      {!ready ? (
        <GErrorCard
          title="We couldn't load the supply list"
          message={`${controller.error ?? 'Something went wrong.'} Check your connection, then try again.`}
          onRetry={() => void onPullRefresh()}
        />
      ) : (
        <>
          {controller.readOnly ? (
            <GInlineBanner tone="info" title="Preview mode" description="Sign-ups are turned off here." />
          ) : null}

          {controller.error && !pullRefreshing ? (
            <GInlineBanner
              tone="warning"
              title="Showing the last list we loaded"
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

          {items.length > 0 ? (
            <>
              <CoopSearchField
                value={search}
                onChangeText={setSearch}
                placeholder="Search items or stores"
                accessibilityLabel="Search supply items"
              />
              <CoopStatStrip
                index={1}
                testID="parent-coop-supply-list-summary"
                stats={[
                  { label: summary.itemCount === 1 ? 'Item' : 'Items', value: summary.itemCount },
                  { label: 'With sign-ups', value: summary.assignedCount },
                  { label: mine === 1 ? 'Your sign-up' : 'Your sign-ups', value: mine },
                ]}
              />
              <GSegmented
                items={filterItems}
                activeId={filterKey}
                onChange={setFilterKey}
                scrollable
                accessibilityLabel="Filter supply items"
              />
              <View style={styles.listHeading}>
                <Text style={styles.listTitle} accessibilityRole="header">
                  {filterKey === 'mine' ? 'Your family is bringing' : 'Supplies'}
                </Text>
                <GChip
                  tone="neutral"
                  label={filtered ? `${visibleItems.length} of ${items.length}` : `${items.length} items`}
                />
              </View>
            </>
          ) : null}
        </>
      )}
    </View>
  );

  const empty = !ready ? null : (
    <CoopEmptyPanel
      icon={items.length === 0 ? 'basket-outline' : 'search-outline'}
      message={
        items.length === 0
          ? 'No supply items yet.'
          : search.trim()
            ? 'No items match your search.'
            : filterKey === 'mine'
              ? "You haven't signed up for anything yet. Available shows what's still needed."
              : 'No supply items match the current filter.'
      }
    />
  );

  return (
    <CoopScreenRoot>
      <FlatList
        testID={ready ? 'parent-coop-supply-list-ready' : undefined}
        data={ready ? visibleItems : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={coopContentStyle}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={8}
        windowSize={7}
        renderItem={({ item, index }) => (
          <SupplyItemCard
            item={item}
            index={index}
            highlight={highlightFor(item)}
            currentFamilyId={currentFamilyId}
            familyNameMap={controller.familyNameMap}
            pendingId={controller.pendingId}
            onOpen={onOpen}
            onToggle={onToggleRow}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }
      />

      <SupplyItemSheet
        item={selectedItem}
        visible={sheetOpen && Boolean(selectedItem)}
        onClose={() => setSheetOpen(false)}
        highlight={selectedItem ? highlightFor(selectedItem) : null}
        currentFamilyId={currentFamilyId}
        familyNameMap={controller.familyNameMap}
        pending={Boolean(selectedItem) && controller.pendingId === selectedItem?.id}
        readOnly={controller.readOnly}
        onToggle={onToggleSheet}
      />
    </CoopScreenRoot>
  );
}

const styles = StyleSheet.create({
  headerStack: { gap: 16 },
  bannerLink: { alignSelf: 'flex-start', marginTop: 6, minHeight: 28 },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
  },
  listTitle: {
    flex: 1,
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.6,
    color: Garden.ink,
  },
});
