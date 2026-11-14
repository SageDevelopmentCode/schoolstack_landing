import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  CARD_SHADOW,
  CHIP_TONES,
  Garden,
  GardenFonts,
  PANEL_TINTS,
  PORTAL_EASE,
  useGardenAccent,
  type GChipTone,
} from '@/components/parent/garden/tokens';
import { ScalePressable } from '@/components/scale-pressable';
import { haptic } from '@/lib/haptics';
import { CARD_PRESS_SPRING } from '@/lib/motion/portal-motion';

type IoniconName = keyof typeof Ionicons.glyphMap;
type HapticKind = 'tap' | 'select' | 'press' | 'none';

function fireHaptic(kind: HapticKind) {
  if (kind === 'none') return;
  haptic[kind]();
}

/* ------------------------------------------------------------------ */
/* Pressable                                                           */
/* ------------------------------------------------------------------ */

export type GPressableProps = Omit<PressableProps, 'style' | 'accessibilityLabel'> & {
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
  haptic?: HapticKind;
};

/** Scale-on-press + light haptic. Every Garden tappable goes through this. */
export function GPressable({
  haptic: hapticKind = 'tap',
  onPress,
  accessibilityRole = 'button',
  hitSlop = 4,
  ...rest
}: GPressableProps) {
  return (
    <ScalePressable
      {...rest}
      hitSlop={hitSlop}
      accessibilityRole={accessibilityRole}
      onPress={(event: GestureResponderEvent) => {
        fireHaptic(hapticKind);
        onPress?.(event);
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Type                                                                */
/* ------------------------------------------------------------------ */

export function GKicker({
  children,
  light = false,
  style,
}: {
  children: ReactNode;
  light?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={[styles.kicker, { color: light ? 'rgba(255,255,255,0.7)' : Garden.soft }, style]}>
      {children}
    </Text>
  );
}

/** One decorative handwritten line (empty / celebration states only). Hidden from screen readers. */
export function GHand({ children, color = Garden.forest }: { children: string; color?: string }) {
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.hand, { color }]}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export type GCardTone = 'white' | 'paper' | 'dark';

export type GCardProps = {
  kicker?: string;
  title?: ReactNode;
  action?: ReactNode;
  tone?: GCardTone;
  index?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  testID?: string;
  onLayout?: (y: number) => void;
};

export function GCard({
  kicker,
  title,
  action,
  tone = 'white',
  index = 0,
  children,
  style,
  bodyStyle,
  testID,
  onLayout,
}: GCardProps) {
  const accent = useGardenAccent();
  const dark = tone === 'dark';
  const bg = dark ? accent.clayDeep : tone === 'paper' ? Garden.paper : Garden.white;

  return (
    <Animated.View
      testID={testID}
      onLayout={onLayout ? (event) => onLayout(event.nativeEvent.layout.y) : undefined}
      entering={FadeInDown.delay(40 + index * 50)
        .duration(320)
        .easing(PORTAL_EASE)}
      style={[
        styles.card,
        { backgroundColor: bg, borderColor: dark ? 'transparent' : Garden.ink12 },
        style,
      ]}>
      {kicker || title || action ? (
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderCopy}>
            {kicker ? <GKicker light={dark}>{kicker}</GKicker> : null}
            {title ? (
              <Text
                accessibilityRole="header"
                style={[styles.cardTitle, { color: dark ? Garden.white : Garden.ink }]}>
                {title}
              </Text>
            ) : null}
          </View>
          {action ? <View style={styles.cardAction}>{action}</View> : null}
        </View>
      ) : null}
      <View style={bodyStyle}>{children}</View>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* Chips, icons, ticks                                                 */
/* ------------------------------------------------------------------ */

export function GChip({
  label,
  tone = 'neutral',
  icon,
  style,
}: {
  label: string;
  tone?: GChipTone;
  icon?: IoniconName;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = CHIP_TONES[tone];
  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }, style]}>
      {icon ? <Ionicons name={icon} size={12} color={colors.fg} /> : null}
      <Text style={[styles.chipText, { color: colors.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const ICON_SIZES = { sm: [32, 16], md: [44, 20], lg: [56, 24] } as const;

export function GIcon({
  name,
  size = 'md',
  color,
  bg = Garden.white,
}: {
  name: IoniconName;
  size?: keyof typeof ICON_SIZES;
  color?: string;
  bg?: string;
}) {
  const accent = useGardenAccent();
  const [box, glyph] = ICON_SIZES[size];
  return (
    <View
      style={[
        styles.icon,
        { width: box, height: box, borderRadius: box / 2, backgroundColor: bg },
      ]}>
      <Ionicons name={name} size={glyph} color={color ?? accent.clayDeep} />
    </View>
  );
}

/** Done tick (forest on mint) — the mobile stand-in for the hand-drawn web `Tick`. */
export function GTick({ size = 24 }: { size?: number }) {
  return (
    <View
      style={[
        styles.tick,
        { width: size, height: size, borderRadius: size / 2 },
      ]}>
      <Ionicons name="checkmark" size={Math.round(size * 0.62)} color={Garden.forest} />
    </View>
  );
}

/** To-do ring (empty circle). */
export function GRing({ size = 24 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: Garden.ink60,
        backgroundColor: Garden.white,
      }}
    />
  );
}

export function GBadge({ count, style }: { count: number; style?: StyleProp<ViewStyle> }) {
  const accent = useGardenAccent();
  if (count <= 0) return null;
  return (
    <View style={[styles.badge, { backgroundColor: accent.clay }, style]}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

/** Dashed rule (iOS can't dash a single border side reliably). */
export function GDashedRule({
  vertical = false,
  color = Garden.ink15,
  style,
}: {
  vertical?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[
        vertical ? styles.ruleVertical : styles.ruleHorizontal,
        style,
      ]}>
      {Array.from({ length: 60 }).map((_, i) => (
        <View
          key={i}
          style={[
            vertical ? styles.dashVertical : styles.dashHorizontal,
            { backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Note tile                                                           */
/* ------------------------------------------------------------------ */

export function GTape({ color = 'rgba(255,255,255,0.75)', rotate = 2 }: { color?: string; rotate?: number }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.tape, { backgroundColor: color, transform: [{ rotate: `${rotate}deg` }] }]}
    />
  );
}

export type GNoteTileProps = {
  tint: string;
  title: string;
  subtitle?: string;
  icon?: IoniconName;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  tape?: boolean;
  trailing?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  titleLines?: number;
  subtitleLines?: number;
};

/** Pastel note with tape. Never tilted (it holds data). */
export function GNoteTile({
  tint,
  title,
  subtitle,
  icon,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  tape = true,
  trailing,
  children,
  style,
  titleLines = 2,
  subtitleLines = 2,
}: GNoteTileProps) {
  const body = (
    <>
      {tape ? <GTape /> : null}
      <View style={styles.noteRow}>
        {icon ? <GIcon name={icon} size="sm" /> : null}
        <View style={styles.noteCopy}>
          <Text style={styles.noteTitle} numberOfLines={titleLines}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.noteSubtitle} numberOfLines={subtitleLines}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={Garden.ink60} /> : null)}
      </View>
      {children}
    </>
  );

  if (!onPress) {
    return <View style={[styles.note, { backgroundColor: tint }, style]}>{body}</View>;
  }

  return (
    <GPressable
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}. ${subtitle}` : title)}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={[styles.note, { backgroundColor: tint }, style]}>
      {body}
    </GPressable>
  );
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

export function GProgress({
  value,
  label,
  done = false,
  style,
}: {
  /** 0..1 */
  value: number;
  label: string;
  done?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const accent = useGardenAccent();
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, value));
  const width = useSharedValue(reduceMotion ? clamped * 100 : 0);

  useEffect(() => {
    width.value = reduceMotion
      ? clamped * 100
      : withDelay(200, withTiming(clamped * 100, { duration: 800, easing: PORTAL_EASE }));
  }, [clamped, reduceMotion, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.progressTrack, style]}>
      <Animated.View
        style={[
          styles.progressFill,
          { backgroundColor: done ? Garden.forest : accent.clay },
          fillStyle,
        ]}
      />
    </View>
  );
}

/** Segmented setup pills (done = accent, rest = white). */
export function GSegmentDots({
  done,
  total,
  max = 8,
  onDark = false,
}: {
  done: number;
  total: number;
  max?: number;
  onDark?: boolean;
}) {
  const accent = useGardenAccent();
  const count = Math.min(total, max);
  const doneShown = total > max ? Math.round((done / total) * max) : done;
  return (
    <View
      accessible
      accessibilityLabel={`${done} of ${total} complete`}
      style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i < doneShown ? (onDark ? Garden.butter : accent.clay) : Garden.white,
              borderColor: onDark ? 'rgba(255,255,255,0.6)' : Garden.ink,
            },
          ]}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Date stamp + child thumb                                            */
/* ------------------------------------------------------------------ */

export function parseEventDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** "Friday, Nov 14 · 3:00 PM" — matches web `eventWhen`. */
export function eventWhen(event: { date: string; time?: string; isAllDay: boolean }): string {
  const label = parseEventDate(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  return !event.isAllDay && event.time ? `${label} · ${event.time}` : label;
}

export function DateStamp({
  date,
  size = 'sm',
  dark = false,
}: {
  date: string;
  size?: 'sm' | 'md';
  dark?: boolean;
}) {
  const accent = useGardenAccent();
  const parsed = parseEventDate(date);
  const month = parsed.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const weekday = parsed.toLocaleDateString('en-US', { weekday: 'short' });
  const md = size === 'md';
  return (
    <View
      accessible
      accessibilityLabel={parsed.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}
      style={[
        styles.stamp,
        md ? styles.stampMd : styles.stampSm,
        { borderColor: dark ? 'rgba(255,255,255,0.4)' : Garden.ink25 },
      ]}>
      <Text style={[styles.stampMonth, { color: dark ? Garden.butter : accent.clayDeep }]}>
        {month}
      </Text>
      <Text
        style={[
          styles.stampDay,
          { fontSize: md ? 38 : 24, lineHeight: md ? 40 : 26, color: dark ? Garden.white : Garden.ink },
        ]}>
        {parsed.getDate()}
      </Text>
      <Text
        style={[
          styles.stampWeekday,
          { fontSize: md ? 11 : 10, color: dark ? 'rgba(255,255,255,0.75)' : 'rgba(43,36,29,0.75)' },
        ]}>
        {weekday}
      </Text>
    </View>
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Small polaroid. A slight tilt is allowed here (photos only). */
export function ChildThumb({
  name,
  photoUrl,
  size = 64,
  tilt = 0,
  index = 0,
}: {
  name: string;
  photoUrl: string | null;
  size?: number;
  tilt?: number;
  index?: number;
}) {
  const inner = size - 8;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.polaroid, { width: size, transform: [{ rotate: `${tilt}deg` }] }]}>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: inner, height: inner, borderRadius: 3 }}
          contentFit="cover"
          transition={180}
        />
      ) : (
        <View
          style={[
            styles.initials,
            { width: inner, height: inner, backgroundColor: PANEL_TINTS[index % PANEL_TINTS.length] },
          ]}>
          <Text style={[styles.initialsText, { fontSize: Math.round(inner * 0.36) }]}>
            {initialsOf(name)}
          </Text>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons + links                                                     */
/* ------------------------------------------------------------------ */

export type GToyButtonProps = {
  label: string;
  onPress: () => void;
  /** `accent` = school colour face (default); `white` = white pill for use on an accent strip. */
  variant?: 'accent' | 'white';
  size?: 'sm' | 'md';
  icon?: IoniconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * The ONE primary "toy" button per view: 2px ink border + hard ink offset.
 * The offset is a real ink underlay so it looks the same on iOS and Android.
 */
export function GToyButton({
  label,
  onPress,
  variant = 'accent',
  size = 'sm',
  icon = 'arrow-forward',
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: GToyButtonProps) {
  const accent = useGardenAccent();
  const offset = size === 'md' ? 5 : 4;
  const press = useSharedValue(0);
  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * (offset - 1) }],
  }));
  const face = variant === 'white' ? Garden.white : accent.clay;
  const fg = variant === 'white' ? Garden.ink : Garden.white;
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      hitSlop={6}
      onPressIn={() => {
        press.value = withSpring(1, CARD_PRESS_SPRING);
      }}
      onPressOut={() => {
        press.value = withSpring(0, CARD_PRESS_SPRING);
      }}
      onPress={() => {
        haptic.press();
        onPress();
      }}
      style={[{ paddingBottom: offset, alignSelf: fullWidth ? 'stretch' : 'flex-start' }, style]}>
      <View style={[styles.toyUnderlay, { top: offset }]} />
      <Animated.View
        style={[
          styles.toyFace,
          size === 'md' ? styles.toyFaceMd : styles.toyFaceSm,
          { backgroundColor: face, opacity: disabled ? 0.55 : 1 },
          faceStyle,
        ]}>
        {loading ? <ActivityIndicator size="small" color={fg} /> : null}
        <Text style={[styles.toyLabel, { color: fg, fontSize: size === 'md' ? 16 : 14 }]}>
          {label}
        </Text>
        {!loading && icon ? <Ionicons name={icon} size={16} color={fg} /> : null}
      </Animated.View>
    </Pressable>
  );
}

export function GOutlineButton({
  label,
  onPress,
  icon,
  accessibilityLabel,
  style,
  onDark = false,
}: {
  label: string;
  onPress: () => void;
  icon?: IoniconName;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  onDark?: boolean;
}) {
  return (
    <GPressable
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={[
        styles.outline,
        onDark
          ? { backgroundColor: Garden.butter, borderColor: 'transparent' }
          : { backgroundColor: Garden.white, borderColor: Garden.ink25 },
        style,
      ]}>
      <Text style={styles.outlineLabel}>{label}</Text>
      {icon ? <Ionicons name={icon} size={15} color={Garden.ink} /> : null}
    </GPressable>
  );
}

export function GLink({
  label,
  onPress,
  icon = 'arrow-forward',
  light = false,
  accessibilityLabel,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IoniconName | null;
  light?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const accent = useGardenAccent();
  const color = light ? Garden.white : accent.clayDeep;
  return (
    <GPressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      haptic="select"
      hitSlop={10}
      style={[styles.link, style]}>
      <Text style={[styles.linkText, { color }]}>{label}</Text>
      {icon ? <Ionicons name={icon} size={14} color={color} /> : null}
    </GPressable>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton, error, count-up                                           */
/* ------------------------------------------------------------------ */

export function GSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(
      withSequence(withTiming(0.45, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
    );
  }, [opacity, reduceMotion]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.skeleton, animated, style]} />;
}

export function GErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <GCard kicker="Something went wrong" title="We couldn't load your Home">
      <Text style={styles.errorCopy}>{message}</Text>
      <GToyButton label="Try again" icon="refresh" onPress={onRetry} style={styles.errorRetry} />
    </GCard>
  );
}

/** Counts up to `value` once. Renders the final value under reduced motion. */
export function GCountUp({ value, style }: { value: number; style?: StyleProp<TextStyle> }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(reduceMotion ? value : 0);
  const fromRef = useRef(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setShown(value);
      return;
    }
    const from = fromRef.current;
    const start = Date.now();
    const duration = 650;
    let frame = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        fromRef.current = value;
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, value]);

  return <Text style={style}>{shown}</Text>;
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

export const gText = StyleSheet.create({
  display: { fontFamily: GardenFonts.display, color: Garden.ink, letterSpacing: -0.6 },
  itemTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, lineHeight: 20, color: Garden.ink },
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  body: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 21, color: Garden.ink },
});

const styles = StyleSheet.create({
  kicker: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  hand: {
    fontFamily: GardenFonts.hand,
    fontSize: 20,
    lineHeight: 26,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 18,
    ...CARD_SHADOW,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  cardHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  cardTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 25,
    letterSpacing: -0.6,
  },
  cardAction: {
    flexShrink: 0,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  chipText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12,
    lineHeight: 16,
  },
  icon: {
    borderWidth: 2,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    backgroundColor: Garden.mint,
    borderWidth: 2,
    borderColor: Garden.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Garden.white,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 10,
    lineHeight: 12,
  },
  ruleHorizontal: {
    flexDirection: 'row',
    gap: 4,
    height: 1.5,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  ruleVertical: {
    gap: 4,
    width: 1.5,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  dashHorizontal: {
    width: 6,
    height: 1.5,
  },
  dashVertical: {
    width: 1.5,
    height: 6,
  },
  tape: {
    position: 'absolute',
    top: -7,
    alignSelf: 'center',
    width: 48,
    height: 14,
    borderRadius: 2,
  },
  note: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 14,
    minHeight: 56,
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 2,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  noteTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  noteSubtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.ink65,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 20,
    height: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  stamp: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
  },
  stampSm: {
    width: 58,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  stampMd: {
    minWidth: 76,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  stampMonth: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2,
  },
  stampDay: {
    fontFamily: GardenFonts.display,
    letterSpacing: -0.5,
  },
  stampWeekday: {
    fontFamily: GardenFonts.bodyBold,
  },
  polaroid: {
    backgroundColor: Garden.white,
    padding: 4,
    paddingBottom: 6,
    borderRadius: 6,
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  initials: {
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: GardenFonts.display,
    color: 'rgba(43,36,29,0.7)',
  },
  toyUnderlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: Garden.ink,
  },
  toyFace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink,
  },
  toyFaceSm: {
    minHeight: 44,
    paddingHorizontal: 18,
  },
  toyFaceMd: {
    minHeight: 52,
    paddingHorizontal: 24,
  },
  toyLabel: {
    fontFamily: GardenFonts.bodyExtra,
  },
  outline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  outlineLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    minHeight: 32,
  },
  linkText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
  },
  skeleton: {
    borderRadius: 24,
    backgroundColor: Garden.ink06,
  },
  errorCopy: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 21,
    color: Garden.soft,
  },
  errorRetry: {
    marginTop: 16,
  },
});
