import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GSegmented } from '@/components/parent/garden/segmented';
import { GSheet } from '@/components/parent/garden/sheet';
import {
  Garden,
  GardenFonts,
  PORTAL_EASE,
  useGardenAccent,
} from '@/components/parent/garden/tokens';
import { GChip, GKicker, GPressable, GSkeleton, GTick } from '@/components/parent/garden/ui';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { StoryMoreMenuTabPanel } from '@/components/story/more/story-more-menu-tab-panel';
import { isMobileE2e } from '@/lib/e2e';
import type { MoreMenuTab, MoreMenuTabId } from '@/lib/more-menu-tab-ids';

type IoniconName = keyof typeof Ionicons.glyphMap;

/* ------------------------------------------------------------------ */
/* Pastel mapping                                                       */
/* ------------------------------------------------------------------ */

export type GardenPastel = 'butter' | 'peach' | 'mint' | 'sky' | 'lav';

const PASTEL: Record<GardenPastel, { bg: string; fg: string }> = {
  butter: { bg: Garden.butter, fg: '#6B4F00' },
  peach: { bg: Garden.peach, fg: '#7E4533' },
  mint: { bg: Garden.mint, fg: Garden.forest },
  sky: { bg: Garden.sky, fg: '#24507A' },
  lav: { bg: Garden.lav, fg: '#5B3F73' },
};

function hueOf(hex: string): number | null {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return null;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

/**
 * Map an existing menu icon background (Tailwind-style tint) to the nearest
 * fixed Garden pastel, so item colours stay recognisable after the redesign.
 */
export function gardenPastelForColor(hex: string): GardenPastel {
  const hue = hueOf(hex);
  if (hue == null) return 'sky';
  if (hue >= 30 && hue < 70) return 'butter';
  if (hue >= 70 && hue < 175) return 'mint';
  if (hue >= 175 && hue < 250) return 'sky';
  if (hue >= 250 && hue < 340) return 'lav';
  return 'peach';
}

/**
 * True when `pathname` is the screen for More item `id` (`…/more/{id}` or deeper).
 * Exact segment match, so `staff` is not "open" while on `staff-hours`.
 */
export function isMoreItemPathActive(pathname: string, id: string): boolean {
  const marker = `/more/${id}`;
  const at = pathname.indexOf(marker);
  if (at < 0) return false;
  const next = pathname.charAt(at + marker.length);
  return next === '' || next === '/' || next === '?';
}

/* ------------------------------------------------------------------ */
/* Sheet shell + header tabs                                            */
/* ------------------------------------------------------------------ */

export function GardenMoreSheet({
  visible,
  onClose,
  title = 'More',
  subtitle,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      accessibilityLabel="Close more menu">
      {children}
    </GSheet>
  );
}

export function GardenMoreSectionTabs({
  tabs,
  activeId,
  onChange,
  loading = false,
}: {
  tabs: MoreMenuTab[];
  activeId: MoreMenuTabId;
  onChange: (id: MoreMenuTabId) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Loading menu sections"
        style={styles.tabsSkeleton}>
        {tabs.map((tab) => (
          <GSkeleton key={tab.id} style={styles.tabsSkeletonPill} />
        ))}
      </View>
    );
  }
  return (
    <GSegmented
      items={tabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
        icon: tab.icon,
        testID: `more-menu-section-${tab.id}`,
      }))}
      activeId={activeId}
      onChange={onChange}
    />
  );
}

/** Fades a section in when it becomes the active one (instant under E2E). */
export const GardenMorePanel = StoryMoreMenuTabPanel;

/* ------------------------------------------------------------------ */
/* Profile card                                                         */
/* ------------------------------------------------------------------ */

export function GardenProfileCard({
  name,
  photoUrl,
  meta,
  onPress,
  accessibilityLabel,
  children,
}: {
  name: string;
  photoUrl?: string | null;
  meta?: (string | null | undefined)[];
  /** When set, the whole card opens account settings. */
  onPress?: () => void;
  accessibilityLabel?: string;
  children?: ReactNode;
}) {
  const accent = useGardenAccent();
  const lines = (meta ?? []).filter((line): line is string => Boolean(line && line.trim()));

  const row = (
    <View style={styles.profileRow}>
      <View style={styles.profileAvatarRing}>
        <MessagesAvatar name={name} color={accent.clay} photoUrl={photoUrl} size="md" />
      </View>
      <View style={styles.profileCopy}>
        <Text style={styles.profileName} numberOfLines={1}>
          {name}
        </Text>
        {lines.map((line) => (
          <Text key={line} style={styles.profileMeta} numberOfLines={1}>
            {line}
          </Text>
        ))}
      </View>
      {onPress ? (
        <View style={[styles.profileChevron, { backgroundColor: accent.wash }]}>
          <Ionicons name="chevron-forward" size={18} color={accent.clayDeep} />
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.profileCard}>
      {onPress ? (
        <GPressable
          accessibilityLabel={accessibilityLabel ?? `Account for ${name}`}
          accessibilityHint="Opens your account settings"
          pressedScale={0.98}
          onPress={onPress}>
          {row}
        </GPressable>
      ) : (
        row
      )}
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Menu tile grid                                                       */
/* ------------------------------------------------------------------ */

export type GardenMoreItem<Id extends string> = {
  id: Id;
  label: string;
  subtitle: string;
  icon: IoniconName;
  /** Original icon tint; mapped to a Garden pastel. */
  iconBg: string;
};

export type GardenMoreGroup<Id extends string> = {
  key: string;
  kicker?: string;
  items: GardenMoreItem<Id>[];
};

export function GardenMoreGrid<Id extends string>({
  groups,
  currentId,
  onSelect,
}: {
  groups: GardenMoreGroup<Id>[];
  /** The item whose screen is open right now ("Open now"). */
  currentId?: Id | null;
  onSelect: (id: Id) => void;
}) {
  let index = 0;
  return (
    <View style={styles.groups}>
      {groups
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <View key={group.key} style={styles.group}>
            {group.kicker ? <GKicker style={styles.groupKicker}>{group.kicker}</GKicker> : null}
            <View style={styles.grid}>
              {pairs(group.items).map((row) => (
                <View key={row.map((item) => item.id).join('|')} style={styles.gridRow}>
                  {row.map((item) => {
                    const tileIndex = index++;
                    return (
                      <GardenMoreTile
                        key={item.id}
                        item={item}
                        index={tileIndex}
                        current={currentId === item.id}
                        onPress={() => onSelect(item.id)}
                      />
                    );
                  })}
                  {/* An odd last tile stays half width. */}
                  {row.length === 1 ? <View style={styles.tileCell} /> : null}
                </View>
              ))}
            </View>
          </View>
        ))}
    </View>
  );
}

/** Split into rows of two so every tile in the grid has the same width and height. */
function pairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

function GardenMoreTile<Id extends string>({
  item,
  index,
  current,
  onPress,
}: {
  item: GardenMoreItem<Id>;
  index: number;
  current: boolean;
  onPress: () => void;
}) {
  const accent = useGardenAccent();
  const pastel = PASTEL[gardenPastelForColor(item.iconBg)];

  return (
    <Animated.View
      style={styles.tileCell}
      entering={
        isMobileE2e
          ? undefined
          : FadeInDown.delay(40 + Math.min(index, 10) * 35)
              .duration(280)
              .easing(PORTAL_EASE)
      }>
      <GPressable
        testID={`more-menu-item-${item.id}`}
        accessibilityLabel={item.label}
        accessibilityHint={current ? `${item.subtitle}. You're on this page` : item.subtitle}
        accessibilityState={{ selected: current }}
        pressedScale={0.96}
        onPress={onPress}
        style={[
          styles.tile,
          { backgroundColor: pastel.bg },
          current ? { borderColor: accent.clay, borderWidth: 2.5 } : null,
        ]}>
        <View style={styles.tileTop}>
          <View style={styles.tileIcon}>
            <Ionicons name={item.icon} size={19} color={pastel.fg} />
          </View>
          {current ? (
            <View style={[styles.currentChip, { backgroundColor: accent.clay }]}>
              <Text style={styles.currentChipText}>Open now</Text>
            </View>
          ) : (
            <Ionicons name="arrow-forward" size={16} color={Garden.ink25} />
          )}
        </View>
        <View style={styles.tileCopy}>
          <Text
            style={styles.tileLabel}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}>
            {item.label}
          </Text>
          <Text style={styles.tileSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
        </View>
      </GPressable>
    </Animated.View>
  );
}

export function GardenMoreGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading menu"
      style={styles.grid}>
      {pairs(Array.from({ length: count }, (_, index) => index)).map((row) => (
        <View key={row.join('-')} style={styles.gridRow}>
          {row.map((index) => (
            <View key={index} style={styles.tileCell}>
              <GSkeleton style={styles.tileSkeleton} />
            </View>
          ))}
          {row.length === 1 ? <View style={styles.tileCell} /> : null}
        </View>
      ))}
    </View>
  );
}

export function GardenMoreEmpty({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="leaf-outline" size={20} color={Garden.forest} />
      </View>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Selection list (Program / Account switchers)                         */
/* ------------------------------------------------------------------ */

export function GardenSelectionList({
  kicker,
  hint,
  children,
}: {
  kicker?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.selection}>
      {kicker ? <GKicker>{kicker}</GKicker> : null}
      {hint ? <Text style={styles.selectionHint}>{hint}</Text> : null}
      <View style={styles.selectionCard}>{children}</View>
    </View>
  );
}

export function GardenSelectionRow({
  label,
  subtitle,
  icon,
  iconBg,
  selected = false,
  busy = false,
  disabled = false,
  isFirst = false,
  onPress,
  accessibilityLabel,
  testID,
}: {
  label: string;
  subtitle?: string;
  icon: IoniconName;
  iconBg: string;
  selected?: boolean;
  /** Shows "Opening…" with a spinner while this row's switch is in flight. */
  busy?: boolean;
  disabled?: boolean;
  isFirst?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const accent = useGardenAccent();
  const pastel = PASTEL[gardenPastelForColor(iconBg)];
  return (
    <GPressable
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={
        selected ? "You're using this one now" : subtitle ? `Switch to ${label}. ${subtitle}` : undefined
      }
      accessibilityState={{ selected, disabled, busy }}
      disabled={disabled}
      haptic={selected ? 'none' : 'select'}
      pressedScale={0.98}
      onPress={onPress}
      style={[
        styles.selectionRow,
        !isFirst && styles.selectionRowBorder,
        selected ? { backgroundColor: accent.wash } : null,
      ]}>
      <View style={[styles.selectionIcon, { backgroundColor: pastel.bg }]}>
        <Ionicons name={icon} size={18} color={pastel.fg} />
      </View>
      <View style={styles.selectionCopy}>
        <Text style={styles.selectionLabel} numberOfLines={2}>
          {label}
        </Text>
        {busy ? (
          <Text style={[styles.selectionSubtitle, { color: accent.clayDeep }]}>Opening…</Text>
        ) : subtitle ? (
          <Text style={styles.selectionSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {busy ? (
        <ActivityIndicator size="small" color={accent.clay} />
      ) : selected ? (
        <View style={styles.selectionCurrent}>
          <GChip label="Current" tone="success" />
          <GTick size={22} />
        </View>
      ) : (
        <Ionicons name="swap-horizontal" size={18} color={Garden.ink60} />
      )}
    </GPressable>
  );
}

export function GardenSelectionSkeleton({
  kicker,
  rowCount = 3,
}: {
  kicker?: string;
  rowCount?: number;
}) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={kicker ? `Loading ${kicker}` : 'Loading'}
      style={styles.selection}>
      {kicker ? <GKicker>{kicker}</GKicker> : null}
      <View style={styles.selectionCard}>
        {Array.from({ length: rowCount }, (_, index) => (
          <View key={index} style={[styles.selectionRow, index > 0 && styles.selectionRowBorder]}>
            <GSkeleton style={styles.selectionIconSkeleton} />
            <View style={styles.selectionCopy}>
              <GSkeleton style={styles.lineSkeletonWide} />
              <GSkeleton style={styles.lineSkeletonNarrow} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function GardenInlineError({ message }: { message: string }) {
  return (
    <View accessibilityRole="alert" style={styles.inlineError}>
      <Ionicons name="alert-circle" size={18} color="#7E4533" />
      <Text style={styles.inlineErrorText}>{message}</Text>
    </View>
  );
}

/** Every More tile is this tall, whatever its subtitle length. */
const TILE_HEIGHT = 128;

const styles = StyleSheet.create({
  tabsSkeleton: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  tabsSkeletonPill: {
    flex: 1,
    height: 40,
    borderRadius: 999,
  },
  profileCard: {
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
  },
  profileAvatarRing: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    padding: 2,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  profileName: {
    fontFamily: GardenFonts.display,
    fontSize: 19,
    lineHeight: 23,
    letterSpacing: -0.4,
    color: Garden.ink,
  },
  profileMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  profileChevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groups: {
    gap: 16,
  },
  group: {
    gap: 8,
  },
  groupKicker: {
    paddingHorizontal: 4,
  },
  grid: {
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tileCell: {
    flex: 1,
    minWidth: 0,
  },
  tile: {
    height: TILE_HEIGHT,
    padding: 13,
    gap: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    justifyContent: 'space-between',
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  currentChipText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    color: Garden.white,
  },
  tileCopy: {
    gap: 2,
  },
  tileLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 19,
    color: Garden.ink,
  },
  tileSubtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    lineHeight: 16,
    color: Garden.ink65,
  },
  tileSkeleton: {
    height: TILE_HEIGHT,
    borderRadius: 20,
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Garden.mint,
  },
  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.forest,
  },
  selection: {
    gap: 8,
  },
  selectionHint: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  selectionCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    overflow: 'hidden',
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Garden.ink10,
  },
  selectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIconSkeleton: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  selectionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  selectionLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  selectionSubtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    lineHeight: 17,
    color: Garden.soft,
  },
  selectionCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lineSkeletonWide: {
    height: 13,
    width: '60%',
    borderRadius: 6,
  },
  lineSkeletonNarrow: {
    height: 11,
    width: '40%',
    borderRadius: 6,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Garden.peach,
  },
  inlineErrorText: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: '#7E4533',
  },
});
