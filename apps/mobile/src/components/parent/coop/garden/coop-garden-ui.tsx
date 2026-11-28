import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GCountUp, GIcon, GKicker, GPressable } from '@/components/parent/garden/ui';

type IoniconName = keyof typeof Ionicons.glyphMap;

/**
 * Root for the co-op program screens. They are flat routes inside the parent
 * layout's SafeAreaView, so cream is pulled up under the status bar (tab-route
 * recipe); the scroll view inside stays below the inset.
 */
export function CoopScreenRoot({ children, testID }: { children: ReactNode; testID?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      testID={testID}
      style={[styles.root, { marginTop: -insets.top, paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      {children}
    </View>
  );
}

export const coopContentStyle = {
  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 48,
  gap: 16,
} as const;

export type CoopStat = { label: string; value: number };

/**
 * "At a glance" (web parity): three numbers split by hairlines, then an optional
 * full-width Next up band on the accent wash.
 */
export function CoopStatStrip({
  stats,
  nextUp,
  index = 0,
  testID,
}: {
  stats: CoopStat[];
  nextUp?: { title: string; meta?: string | null } | null;
  index?: number;
  testID?: string;
}) {
  return (
    <GCard index={index} style={styles.statCard} testID={testID}>
      <View style={styles.statRow}>
        {stats.map((stat, i) => (
          <View
            key={stat.label}
            accessible
            accessibilityLabel={`${stat.value} ${stat.label}`}
            style={[styles.statCell, i > 0 && styles.statCellDivider]}>
            <GCountUp value={stat.value} style={styles.statValue} />
            <Text style={styles.statLabel} numberOfLines={2}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
      {nextUp ? (
        <View
          accessible
          accessibilityLabel={`Next up: ${nextUp.title}${nextUp.meta ? `, ${nextUp.meta}` : ''}`}
          style={styles.nextUp}>
          <GKicker>Next up</GKicker>
          <Text style={styles.nextUpTitle} numberOfLines={2}>
            {nextUp.title}
          </Text>
          {nextUp.meta ? <Text style={styles.nextUpMeta}>{nextUp.meta}</Text> : null}
        </View>
      ) : null}
    </GCard>
  );
}

/**
 * Row-level action (web parity: rows never get toy buttons). Outline pill with
 * a spinner while the request runs.
 */
export function CoopActionPill({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon = 'add',
  accessibilityLabel,
  testID,
  style,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IoniconName | null;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const accent = useGardenAccent();
  const inactive = loading || disabled;
  return (
    <GPressable
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      haptic="press"
      hitSlop={6}
      onPress={onPress}
      style={[styles.pill, { borderColor: accent.clay }, style]}>
      {loading ? (
        <ActivityIndicator size="small" color={accent.clayDeep} />
      ) : icon ? (
        <Ionicons name={icon} size={15} color={accent.clayDeep} />
      ) : null}
      <Text style={[styles.pillLabel, { color: accent.clayDeep }]} numberOfLines={1}>
        {label}
      </Text>
    </GPressable>
  );
}

export function CoopSignedUpChip({ label = "You're signed up" }: { label?: string }) {
  return <GChip tone="success" icon="checkmark" label={label} />;
}

/** Calm empty / no-results panel inside a card. */
export function CoopEmptyPanel({
  icon,
  message,
  testID,
}: {
  icon: IoniconName;
  message: string;
  testID?: string;
}) {
  return (
    <View style={styles.empty} testID={testID}>
      <GIcon name={icon} size="md" bg={Garden.white} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

/** Rounded search field with a magnifier and a clear button. */
export function CoopSearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
}) {
  const accent = useGardenAccent();
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.search,
        { borderColor: focused ? accent.clay : Garden.ink15, borderWidth: focused ? 2 : 1.5 },
      ]}>
      <Ionicons name="search" size={18} color={Garden.soft} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Garden.ink60}
        accessibilityLabel={accessibilityLabel}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="never"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.searchInput}
      />
      {value ? (
        <GPressable
          accessibilityLabel="Clear search"
          haptic="select"
          hitSlop={10}
          onPress={() => onChangeText('')}
          style={styles.searchClear}>
          <Ionicons name="close-circle" size={18} color={Garden.ink60} />
        </GPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  statCard: { padding: 0, overflow: 'hidden' },
  statRow: { flexDirection: 'row' },
  statCell: { flex: 1, paddingVertical: 16, paddingHorizontal: 14, gap: 2 },
  statCellDivider: { borderLeftWidth: 1.5, borderLeftColor: Garden.ink10 },
  statValue: {
    fontFamily: GardenFonts.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.8,
    color: Garden.ink,
  },
  statLabel: { fontFamily: GardenFonts.bodyBold, fontSize: 13, lineHeight: 17, color: Garden.soft },
  // Butter, not the accent wash: mixed from a purple accent the wash reads as grey.
  nextUp: {
    backgroundColor: Garden.butter,
    borderTopWidth: 1.5,
    borderTopColor: Garden.ink10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 3,
  },
  nextUpTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 21,
    lineHeight: 25,
    letterSpacing: -0.4,
    color: Garden.ink,
  },
  nextUpMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  pill: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    backgroundColor: Garden.white,
  },
  pillLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Garden.paper,
  },
  emptyText: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 15,
    lineHeight: 21,
    color: Garden.soft,
  },
  search: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Garden.white,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 16,
    color: Garden.ink,
  },
  searchClear: { padding: 2 },
});
