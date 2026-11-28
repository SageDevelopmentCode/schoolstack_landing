import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GSkeleton } from '@/components/parent/garden/ui';
import { CALM_EASE, MOTION, calmFadeIn } from '@/lib/motion/portal-motion';

/** After this long the caption admits the document is big (curriculum books are 20–70 MB). */
const SLOW_OPEN_HINT_MS = 6_000;
/** A4 portrait: height / width. */
const PAGE_RATIO = Math.SQRT2;
const MAX_PAGE_WIDTH = 420;
const CAPTION_SPACE = 44;
const SIDE_PADDING = 20;

/** Text line widths (as % of the page body), with `null` as a paragraph break. */
const LINE_PATTERN: (number | null)[] = [100, 96, 98, 72, null, 100, 94, 97, 88, 64, null, 98, 92, 80];

type ParentEmbeddedPdfLoadingPlaceholderProps = {
  style?: StyleProp<ViewStyle>;
  /** Document title for the caption ("Opening {title}…"). */
  title?: string;
};

/**
 * Garden "paper page" skeleton shown while a PDF opens. The caption sits above the page so the
 * preview's bottom-right "Tap to expand" pill never covers it.
 */
export function ParentEmbeddedPdfLoadingPlaceholder({
  style,
  title,
}: ParentEmbeddedPdfLoadingPlaceholderProps) {
  const [area, setArea] = useState<{ width: number; height: number } | null>(null);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_OPEN_HINT_MS);
    return () => clearTimeout(timer);
  }, []);

  const trimmedTitle = title?.trim();
  const caption = slow
    ? 'Large guide, still opening'
    : trimmedTitle
      ? `Opening ${trimmedTitle}`
      : 'Opening document';

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setArea((previous) =>
      previous && previous.width === width && previous.height === height ? previous : { width, height },
    );
  };

  const page = area ? pageSize(area.width, area.height) : null;

  return (
    <View
      style={[styles.block, style]}
      onLayout={onLayout}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${caption}…`}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite">
      <View style={styles.captionRow}>
        <Animated.Text
          key={slow ? 'slow' : 'opening'}
          entering={calmFadeIn()}
          style={styles.caption}
          numberOfLines={1}>
          {caption}
        </Animated.Text>
        <LoadingDots />
      </View>
      {page ? <PaperPage width={page.width} height={page.height} /> : null}
    </View>
  );
}

function pageSize(areaWidth: number, areaHeight: number): { width: number; height: number } | null {
  const maxHeight = areaHeight - CAPTION_SPACE - SIDE_PADDING * 2;
  const maxWidth = Math.min(areaWidth - SIDE_PADDING * 2, MAX_PAGE_WIDTH);
  if (maxHeight < 80 || maxWidth < 60) return null;
  const width = Math.min(maxWidth, maxHeight / PAGE_RATIO);
  return { width: Math.round(width), height: Math.round(width * PAGE_RATIO) };
}

function PaperPage({ width, height }: { width: number; height: number }) {
  const padding = Math.max(14, Math.round(width * 0.1));
  const lineHeight = Math.max(6, Math.round(width * 0.03));
  const lineGap = Math.round(lineHeight * 0.9);
  const headerHeight = lineHeight * 2.4 + lineHeight + 3 * lineGap;
  const available = height - padding * 2 - headerHeight;
  const lineCount = Math.max(0, Math.min(LINE_PATTERN.length, Math.floor(available / (lineHeight + lineGap))));

  return (
    <View
      style={[styles.page, { width, height, padding }]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden>
      <GSkeleton
        style={[styles.line, { height: lineHeight * 2.4, width: '62%', borderRadius: lineHeight }]}
      />
      <GSkeleton
        style={[
          styles.line,
          { height: lineHeight, width: '38%', marginTop: lineGap, borderRadius: lineHeight / 2 },
        ]}
      />
      <View style={{ height: lineGap * 2 }} />
      {LINE_PATTERN.slice(0, lineCount).map((lineWidth, index) =>
        lineWidth === null ? (
          <View key={`gap-${index}`} style={{ height: lineHeight + lineGap }} />
        ) : (
          <GSkeleton
            key={`line-${index}`}
            style={[
              styles.line,
              {
                height: lineHeight,
                width: `${lineWidth}%`,
                marginBottom: lineGap,
                borderRadius: lineHeight / 2,
              },
            ]}
          />
        ),
      )}
    </View>
  );
}

/** Three dots that brighten in turn (opacity only, no travel). Static under reduced motion. */
function LoadingDots() {
  return (
    <View style={styles.dots} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {[0, 1, 2].map((index) => (
        <LoadingDot key={index} index={index} />
      ))}
    </View>
  );
}

function LoadingDot({ index }: { index: number }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0.3);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      return;
    }
    const timing = { duration: MOTION.slow, easing: CALM_EASE };
    opacity.value = withDelay(
      index * MOTION.fast,
      withRepeat(
        withSequence(
          withTiming(1, timing),
          withTiming(0.3, timing),
          // Rest so the three dots read as one calm wave, not a strobe.
          withTiming(0.3, { duration: MOTION.slow * 2 - index * MOTION.fast }),
          withTiming(0.3, { duration: index * MOTION.fast }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(opacity);
  }, [index, opacity, reduceMotion]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, animated]} />;
}

const styles = StyleSheet.create({
  block: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: SIDE_PADDING,
    backgroundColor: Garden.cream,
  },
  page: {
    backgroundColor: Garden.paper,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  line: {
    backgroundColor: Garden.ink10,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    minHeight: 30,
  },
  caption: {
    flexShrink: 1,
    fontFamily: GardenFonts.bodyBold,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 3,
    paddingTop: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Garden.soft,
  },
});
