import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StoryChip } from '@/components/story/story-chip';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentPhotoMediaConsentLearner } from '@/lib/parent/parent-photo-media-consent-api';
import { childFirstName, photoMediaConsentLabel } from '@/lib/students/photo-media-consent';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type ParentPhotoPermissionsBannerProps = {
  learners: ParentPhotoMediaConsentLearner[];
  onPressEdit: () => void;
};

function chipTone(consent: ParentPhotoMediaConsentLearner['consent']): 'success' | 'warning' | 'alert' | 'info' {
  if (consent === 'full') return 'success';
  if (consent === 'limited') return 'warning';
  if (consent === 'none') return 'alert';
  return 'info';
}

export function ParentPhotoPermissionsBanner({
  learners,
  onPressEdit,
}: ParentPhotoPermissionsBannerProps) {
  const theme = useParentTheme();
  const hasAnyUnset = learners.some((learner) => !learner.consent);
  const ctaLabel = hasAnyUnset ? 'Set permissions' : 'Edit permissions';

  if (learners.length === 0) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.white,
          borderColor: theme.line,
        },
      ]}
      testID="parent-photo-permissions-banner">
      <View style={styles.row}>
        <View
          style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="camera-outline" size={16} color={theme.primary} />
        </View>
        <View style={styles.main}>
          <StorySectionKicker>Photo permissions</StorySectionKicker>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.learnersRow}>
            {learners.map((learner, index) => (
              <View key={learner.studentId} style={styles.learnerItem}>
                {index > 0 ? (
                  <Text style={[styles.dot, { color: theme.muted }]}>·</Text>
                ) : null}
                <Text
                  style={[styles.name, { color: theme.ink }]}
                  numberOfLines={1}>
                  {childFirstName(learner.studentName)}
                </Text>
                <StoryChip label={photoMediaConsentLabel(learner.consent)} tone={chipTone(learner.consent)} />
              </View>
            ))}
          </ScrollView>
        </View>
        <Pressable
          onPress={onPressEdit}
          style={({ pressed }) => [
            styles.cta,
            {
              borderColor: theme.line,
              backgroundColor: pressed ? theme.primarySoft : theme.white,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}>
          <Ionicons name="create-outline" size={14} color={theme.primary} />
          <Text style={[styles.ctaText, { color: theme.ink }]}>{ctaLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  learnersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: 2,
  },
  learnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 200,
  },
  dot: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  name: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    flexShrink: 1,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    flexShrink: 0,
  },
  ctaText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
  },
});
