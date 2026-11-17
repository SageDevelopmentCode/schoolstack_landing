import { Image } from 'expo-image';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Garden, GardenFonts, PORTAL_EASE } from '@/components/parent/garden/tokens';
import { GTape } from '@/components/parent/garden/ui';
import { DayTrack } from '@/components/pre-auth/intro-day/day-track';
import { NotificationStack } from '@/components/pre-auth/intro-day/notification-stack';
import { INTRO_DAY, INTRO_PHOTO } from '@/constants/intro-day';

const SWIPE_DISTANCE = 40;

type IntroDayStageProps = {
  /** Small phones drop the polaroid and show two notes instead of three. */
  compact: boolean;
  activeIndex: number;
  select: (index: number) => void;
  step: (delta: number) => void;
  hold: () => void;
  reduceMotion: boolean;
};

/**
 * "What is MudKitchen?" as one school day: sample notifications drop onto a
 * taped Sage Field polaroid while a sun walks along the day. Tap a stop or
 * swipe the stage to move through it. The screen owns the day cycle so its
 * backdrop can follow the same moment.
 */
export function IntroDayStage({
  compact,
  activeIndex,
  select,
  step,
  hold,
  reduceMotion,
}: IntroDayStageProps) {
  const moment = INTRO_DAY[activeIndex];

  // Horizontal swipes move through the day; taps still reach the day-track stops.
  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-14, 14])
        .failOffsetY([-14, 14])
        .onBegin(hold)
        .onEnd((event) => {
          if (event.translationX <= -SWIPE_DISTANCE) step(1);
          else if (event.translationX >= SWIPE_DISTANCE) step(-1);
        }),
    [hold, step],
  );

  const captionEntering = reduceMotion ? undefined : FadeIn.duration(320).easing(PORTAL_EASE);
  const captionExiting = reduceMotion ? undefined : FadeOut.duration(160);

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={swipe}>
        <View style={styles.stage} onTouchStart={hold}>
          <DayTrack
            moments={INTRO_DAY}
            activeIndex={activeIndex}
            onSelect={select}
            accent={moment.ink}
            reduceMotion={reduceMotion}
          />

          <View style={styles.wall}>
            {compact ? null : (
              <View style={styles.polaroid}>
                <GTape color="rgba(255,255,255,0.85)" rotate={-4} />
                <Image
                  source={INTRO_PHOTO.source}
                  accessibilityLabel={INTRO_PHOTO.alt}
                  accessible
                  style={styles.photo}
                  contentFit="cover"
                  transition={reduceMotion ? 0 : 250}
                />
              </View>
            )}
            <View style={[styles.stackColumn, compact && styles.stackColumnCompact]}>
              <NotificationStack
                moments={INTRO_DAY}
                activeIndex={activeIndex}
                depth={compact ? 2 : 3}
                reduceMotion={reduceMotion}
              />
            </View>
          </View>

          <View style={styles.captionSlot}>
            <Animated.View
              key={moment.id}
              entering={captionEntering}
              exiting={captionExiting}
              style={styles.caption}>
              <Text style={styles.captionTitle}>{moment.title}</Text>
              <Text style={styles.captionBody} numberOfLines={3}>
                {moment.description}
              </Text>
            </Animated.View>
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  wall: {
    minHeight: 232,
    justifyContent: 'center',
  },
  polaroid: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    aspectRatio: 0.66,
    padding: 8,
    paddingBottom: 26,
    borderRadius: 6,
    backgroundColor: Garden.white,
    transform: [{ rotate: '4deg' }],
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
  },
  photo: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: Garden.mint,
  },
  stackColumn: {
    width: '78%',
  },
  stackColumnCompact: {
    width: '100%',
  },
  captionSlot: {
    minHeight: 96,
  },
  caption: {
    gap: 6,
  },
  captionTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: Garden.ink,
  },
  captionBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 15,
    lineHeight: 21,
    color: Garden.soft,
  },
});
