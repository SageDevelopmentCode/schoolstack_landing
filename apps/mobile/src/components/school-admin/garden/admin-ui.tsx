import { Ionicons } from '@expo/vector-icons';
import { useEffect, type ReactNode } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GBadge, GCountUp, GDashedRule, GLink, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { CALM_EASE } from '@/lib/motion/portal-motion';

type IoniconName = keyof typeof Ionicons.glyphMap;

/* ------------------------------------------------------------------ */
/* Icon chip                                                           */
/* ------------------------------------------------------------------ */

/** Rounded-square pastel icon chip used on admin rows (web `FOCUS_TINTS` chip). */
export function AdminIconChip({
  name,
  tint,
  size = 36,
  onDark = false,
}: {
  name: IoniconName;
  tint: string;
  size?: number;
  onDark?: boolean;
}) {
  return (
    <View
      style={[
        styles.iconChip,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size / 3),
          backgroundColor: onDark ? 'rgba(255,255,255,0.15)' : tint,
          borderColor: onDark ? 'rgba(255,255,255,0.7)' : 'transparent',
          borderWidth: onDark ? 2 : 0,
        },
      ]}>
      <Ionicons name={name} size={Math.round(size * 0.47)} color={onDark ? Garden.white : Garden.ink65} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Work row                                                            */
/* ------------------------------------------------------------------ */

/**
 * Dense admin work row (web `ROW_INTERACTIVE`): optional step number, icon chip,
 * title + meta, CTA label + chevron. The WHOLE row is the tap target.
 */
export function AdminWorkRow({
  title,
  meta,
  icon,
  tint,
  step,
  ctaLabel,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  trailing,
  pending = false,
  flash = false,
  divider = false,
  testID,
  leading,
}: {
  title: string;
  meta?: string | null;
  icon?: IoniconName;
  tint?: string;
  step?: number;
  ctaLabel?: string | null;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Replaces the CTA + chevron (e.g. a chip). */
  trailing?: ReactNode;
  /** Replaces the icon chip (e.g. an avatar). */
  leading?: ReactNode;
  pending?: boolean;
  /** Mint wash after a successful save. */
  flash?: boolean;
  divider?: boolean;
  testID?: string;
}) {
  const accent = useGardenAccent();
  const body = (
    <>
      {step != null ? (
        <Text style={styles.step} accessibilityElementsHidden importantForAccessibility="no">
          {step}
        </Text>
      ) : null}
      {leading ?? (icon ? <AdminIconChip name={icon} tint={tint ?? Garden.sky} /> : null)}
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {title}
        </Text>
        {meta ? (
          <Text style={styles.rowMeta} numberOfLines={2}>
            {meta}
          </Text>
        ) : null}
      </View>
      {pending ? (
        <ActivityIndicator size="small" color={accent.clayDeep} />
      ) : (
        (trailing ?? (
          <View style={styles.rowCta}>
            {ctaLabel ? <Text style={[styles.rowCtaText, { color: accent.clayDeep }]}>{ctaLabel}</Text> : null}
            {onPress ? <Ionicons name="chevron-forward" size={16} color={accent.clayDeep} /> : null}
          </View>
        ))
      )}
    </>
  );

  const rowStyle: StyleProp<ViewStyle> = [
    styles.row,
    divider && styles.rowDivider,
    flash && { backgroundColor: Garden.mint },
  ];

  if (!onPress) {
    return (
      <View testID={testID} style={rowStyle} accessible accessibilityLabel={accessibilityLabel}>
        {body}
      </View>
    );
  }

  return (
    <GPressable
      testID={testID}
      accessibilityLabel={
        accessibilityLabel ?? `${title}${meta ? `. ${meta}` : ''}${ctaLabel ? `. ${ctaLabel}` : ''}`
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: pending }}
      pressedScale={0.985}
      onPress={onPress}
      style={rowStyle}>
      {body}
    </GPressable>
  );
}

/* ------------------------------------------------------------------ */
/* Lead strip                                                          */
/* ------------------------------------------------------------------ */

/**
 * "Do this first" strip (web `FocusLeadStrip`): solid accent, icon ring, group
 * label, title + meta, white toy pill. The whole strip is the button and counts
 * as the view's one toy button.
 */
export function AdminLeadStrip({
  label = 'Do this first',
  title,
  subtitle,
  icon,
  pillLabel,
  onPress,
  testID,
}: {
  label?: string;
  title: string;
  subtitle?: string | null;
  icon: IoniconName;
  pillLabel: string;
  onPress: () => void;
  testID?: string;
}) {
  const accent = useGardenAccent();
  return (
    <GPressable
      testID={testID}
      accessibilityLabel={`${label}: ${title}${subtitle ? `. ${subtitle}` : ''}. ${pillLabel}`}
      haptic="press"
      pressedScale={0.985}
      onPress={onPress}
      style={[styles.lead, { backgroundColor: accent.clay }]}>
      <View style={styles.leadTop}>
        <AdminIconChip name={icon} tint={Garden.white} size={44} onDark />
        <View style={styles.leadCopy}>
          <Text style={styles.leadLabel}>{label}</Text>
          <Text style={styles.leadTitle} numberOfLines={3}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.leadSubtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.pillWrap}>
        <View style={styles.pillUnderlay} />
        <View style={styles.pillFace}>
          <Text style={styles.pillLabel}>{pillLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color={Garden.ink} />
        </View>
      </View>
    </GPressable>
  );
}

/* ------------------------------------------------------------------ */
/* Live dot                                                            */
/* ------------------------------------------------------------------ */

/** Pulsing forest dot for "live right now" (static under reduced motion). */
export function AdminLiveDot({ color = Garden.forest }: { color?: string }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1600, easing: CALM_EASE }),
        withTiming(1, { duration: 0 }),
      ),
      -1,
    );
  }, [reduceMotion, scale]);
  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: reduceMotion ? 0 : Math.max(0, 1.5 - scale.value) * 0.7,
  }));
  return (
    <View style={styles.liveWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.liveRing, { backgroundColor: color }, ring]} />
      <View style={[styles.liveDot, { backgroundColor: color }]} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* KPI tiles                                                           */
/* ------------------------------------------------------------------ */

export type AdminKpiTile = {
  id: string;
  label: string;
  value: string;
  barColor: string;
  onPress: () => void;
  testID?: string;
};

/** Split "$1,250" / "22" / "3.5 h" into a countable number + affixes. */
function splitNumeric(value: string): { prefix: string; number: number; suffix: string; decimals: number } | null {
  const match = value.match(/^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/);
  if (!match) return null;
  const raw = match[2].replace(/,/g, '');
  const number = Number(raw);
  if (!Number.isFinite(number)) return null;
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  return { prefix: match[1], number, suffix: match[3], decimals };
}

function KpiValue({ value }: { value: string }) {
  const parts = splitNumeric(value);
  if (!parts) {
    return (
      <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    );
  }
  const hasGrouping = value.includes(',');
  return (
    <GCountUp
      value={parts.number}
      accessibilityLabel={value}
      format={(n) =>
        `${parts.prefix}${n.toLocaleString('en-US', {
          minimumFractionDigits: parts.decimals,
          maximumFractionDigits: parts.decimals,
          useGrouping: hasGrouping,
        })}${parts.suffix}`
      }
      style={styles.kpiValue}
    />
  );
}

/** Linked KPI tiles, two per row: colour bar, big tabular value, label, arrow. Every number leads somewhere. */
export function AdminKpiTiles({ tiles }: { tiles: AdminKpiTile[] }) {
  return (
    <View style={styles.kpiGrid}>
      {tiles.map((tile) => (
        <GPressable
          key={tile.id}
          testID={tile.testID}
          accessibilityRole="link"
          accessibilityLabel={`${tile.label}: ${tile.value}. Open`}
          pressedScale={0.97}
          onPress={tile.onPress}
          style={styles.kpiTile}>
          <View style={[styles.kpiBar, { backgroundColor: tile.barColor }]} />
          <KpiValue value={tile.value} />
          <View style={styles.kpiFoot}>
            <Text style={styles.kpiLabel} numberOfLines={2}>
              {tile.label}
            </Text>
            <Ionicons name="arrow-forward" size={14} color={Garden.ink60} />
          </View>
        </GPressable>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Stat strip                                                          */
/* ------------------------------------------------------------------ */

/** Paper stat strip: divided cells with a big tabular value and a label. */
export function AdminStatStrip({
  stats,
  live = false,
}: {
  stats: { label: string; value: string }[];
  live?: boolean;
}) {
  return (
    <View style={styles.statStrip}>
      {stats.map((stat, index) => (
        <View
          key={stat.label}
          accessible
          accessibilityLabel={`${stat.label}: ${stat.value}`}
          style={[styles.statCell, index > 0 && styles.statCellDivider]}>
          <View style={styles.statValueRow}>
            {live && index === 0 ? <AdminLiveDot /> : null}
            <Text style={styles.statValue} numberOfLines={1}>
              {stat.value}
            </Text>
          </View>
          <Text style={styles.statLabel} numberOfLines={2}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar button                                                      */
/* ------------------------------------------------------------------ */

/** 42pt round toolbar button (Dashboard header style), optional label pill and badge. */
export function AdminToolbarButton({
  icon,
  label,
  accessibilityLabel,
  onPress,
  badge = 0,
  disabled = false,
  testID,
}: {
  icon: IoniconName;
  /** Visible text next to the icon ("New"); icon-only when omitted. */
  label?: string;
  accessibilityLabel: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
  testID?: string;
}) {
  const accent = useGardenAccent();
  return (
    <GPressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        label ? styles.toolbarPill : styles.toolbarIcon,
        label ? { backgroundColor: accent.clay, borderColor: Garden.ink } : null,
        disabled && styles.dim,
      ]}>
      <Ionicons name={icon} size={label ? 17 : 19} color={label ? Garden.white : Garden.ink} />
      {label ? <Text style={styles.toolbarLabel}>{label}</Text> : null}
      {badge > 0 ? <GBadge count={badge} /> : null}
    </GPressable>
  );
}

/* ------------------------------------------------------------------ */
/* Search + filter chips                                               */
/* ------------------------------------------------------------------ */

/** Pill search field with a clear button (generic `AttendanceSearchField`). */
export function AdminSearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  testID,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel?: string;
  testID?: string;
}) {
  return (
    <View style={styles.search}>
      <Ionicons name="search" size={17} color={Garden.soft} />
      <TextInput
        testID={testID}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        placeholder={placeholder}
        placeholderTextColor={Garden.soft}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
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

export type AdminFilterChip<Id extends string> = {
  id: Id;
  label: string;
  count?: number;
  testID?: string;
};

/** Horizontal radio chips "Label · N" (generic `AttendanceFilterChips`). */
export function AdminFilterChips<Id extends string>({
  items,
  activeId,
  onChange,
  accessibilityLabel,
  style,
}: {
  items: AdminFilterChip<Id>[];
  activeId: Id;
  onChange: (id: Id) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const accent = useGardenAccent();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={style}
      contentContainerStyle={styles.chips}>
      {items.map((item) => {
        const active = item.id === activeId;
        const label = item.count != null ? `${item.label} · ${item.count}` : item.label;
        return (
          <GPressable
            key={item.id}
            testID={item.testID}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
            haptic="select"
            onPress={() => onChange(item.id)}
            style={[
              styles.filterChip,
              active
                ? { backgroundColor: accent.clay, borderColor: accent.clay }
                : { backgroundColor: Garden.white, borderColor: Garden.ink15 },
            ]}>
            <Text style={[styles.filterLabel, { color: active ? Garden.white : Garden.ink }]}>{label}</Text>
          </GPressable>
        );
      })}
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Empty panel, end line, info rows                                    */
/* ------------------------------------------------------------------ */

/** Paper (or mint) panel for empty and filtered-to-nothing states, with one optional link. */
export function AdminEmptyPanel({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  tone = 'paper',
  testID,
}: {
  icon: IoniconName;
  title: string;
  body?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'paper' | 'mint';
  testID?: string;
}) {
  const mint = tone === 'mint';
  return (
    <View
      testID={testID}
      style={[styles.empty, { backgroundColor: mint ? Garden.mint : Garden.paper }]}
      accessibilityLiveRegion="polite">
      <View style={[styles.emptyIcon, { backgroundColor: mint ? Garden.white : Garden.cream }]}>
        <Ionicons name={icon} size={22} color={mint ? Garden.forest : Garden.soft} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
      {actionLabel && onAction ? <GLink label={actionLabel} onPress={onAction} style={styles.emptyLink} /> : null}
    </View>
  );
}

/** Dashed "That's everything" line at the end of a finished list. */
export function AdminEndLine({ label }: { label: string }) {
  return (
    <View style={styles.endLine} accessible accessibilityLabel={label}>
      <GDashedRule style={styles.endRule} />
      <Text style={styles.endText}>{label}</Text>
      <GDashedRule style={styles.endRule} />
    </View>
  );
}

/** Label / value pair for detail cards. Empty values show an em dash. */
export function AdminInfoRow({
  label,
  value,
  divider = false,
  trailing,
}: {
  label: string;
  value?: string | null;
  divider?: boolean;
  trailing?: ReactNode;
}) {
  const shown = value?.trim() ? value : '—';
  return (
    <View
      style={[styles.info, divider && styles.infoDivider]}
      accessible={!trailing}
      accessibilityLabel={`${label}: ${shown}`}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Text style={styles.infoValue} selectable>
          {shown}
        </Text>
        {trailing}
      </View>
    </View>
  );
}

/** Skeleton rows shaped like `AdminWorkRow` with an avatar. */
export function AdminRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.skRows} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.skRow}>
          <GSkeleton style={styles.skAvatar} />
          <View style={styles.skCopy}>
            <GSkeleton style={styles.skTitle} />
            <GSkeleton style={styles.skMeta} />
          </View>
          <GSkeleton style={styles.skChip} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  iconChip: { alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderRadius: 14,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: Garden.ink06, borderRadius: 0 },
  step: {
    width: 18,
    textAlign: 'center',
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
    color: 'rgba(43,36,29,0.4)',
    fontVariant: ['tabular-nums'],
  },
  rowCopy: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, lineHeight: 20, color: Garden.ink },
  rowMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  rowCta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rowCtaText: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  lead: { borderRadius: 18, padding: 16, gap: 14 },
  leadTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  leadCopy: { flex: 1, minWidth: 0, gap: 2 },
  leadLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.75)',
  },
  leadTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 17, lineHeight: 22, color: Garden.white },
  leadSubtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13.5,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
  },
  pillWrap: { paddingBottom: 3, alignSelf: 'flex-start', marginLeft: 56 },
  pillUnderlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 3,
    borderRadius: 999,
    backgroundColor: Garden.ink,
  },
  pillFace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
  },
  pillLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  liveWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  liveRing: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiTile: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 104,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    padding: 14,
    paddingTop: 16,
    gap: 6,
    overflow: 'hidden',
  },
  kpiBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  kpiValue: {
    fontFamily: GardenFonts.display,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.8,
    color: Garden.ink,
    fontVariant: ['tabular-nums'],
  },
  kpiFoot: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  kpiLabel: { flex: 1, fontFamily: GardenFonts.bodyBold, fontSize: 13, lineHeight: 17, color: Garden.soft },
  statStrip: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: Garden.paper,
    borderWidth: 1,
    borderColor: Garden.ink10,
    paddingVertical: 12,
  },
  statCell: { flex: 1, paddingHorizontal: 12, gap: 2 },
  statCellDivider: { borderLeftWidth: 1, borderLeftColor: Garden.ink10 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: {
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 26,
    color: Garden.ink,
    fontVariant: ['tabular-nums'],
  },
  statLabel: { fontFamily: GardenFonts.bodyBold, fontSize: 12, lineHeight: 16, color: Garden.soft },
  dim: { opacity: 0.5 },
  toolbarIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarPill: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: 21,
    borderWidth: 2,
  },
  toolbarLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.white },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 16,
    color: Garden.ink,
    paddingVertical: 10,
  },
  searchClear: { padding: 4 },
  chips: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  filterChip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  filterLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, fontVariant: ['tabular-nums'] },
  empty: { borderRadius: 18, padding: 20, alignItems: 'center', gap: 6 },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    lineHeight: 21,
    color: Garden.ink,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
    textAlign: 'center',
  },
  emptyLink: { marginTop: 6 },
  endLine: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  endRule: { flex: 1 },
  endText: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  info: { paddingVertical: 10, gap: 2 },
  infoDivider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  infoLabel: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  infoValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoValue: { flexShrink: 1, fontFamily: GardenFonts.bodyBold, fontSize: 15, lineHeight: 21, color: Garden.ink },
  skRows: { gap: 4 },
  skRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  skAvatar: { width: 40, height: 40, borderRadius: 20 },
  skCopy: { flex: 1, gap: 6 },
  skTitle: { width: '60%', height: 14, borderRadius: 7 },
  skMeta: { width: '82%', height: 12, borderRadius: 6 },
  skChip: { width: 64, height: 24, borderRadius: 12 },
});
