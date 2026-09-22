import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ImpersonateSubjectRowProps = {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  onPreview: () => void;
};

export function ImpersonateSubjectRow({
  title,
  subtitle,
  meta,
  onPreview,
}: ImpersonateSubjectRowProps) {
  return (
    <StoryCard compact style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          {meta ? (
            <Text style={styles.meta} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
        </View>
        <StoryButton label="Preview" variant="soft" previewSafe onPress={onPreview} style={styles.button} />
      </View>
    </StoryCard>
  );
}

type ImpersonateSchoolRowProps = {
  organizationName: string;
  organizationSlug: string;
  onPress: () => void;
};

export function ImpersonateSchoolRow({
  organizationName,
  organizationSlug,
  onPress,
}: ImpersonateSchoolRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
      <StoryCard compact style={styles.schoolCard}>
        <Text style={styles.title} numberOfLines={1}>
          {organizationName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {organizationSlug}
        </Text>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: '#283943',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: '#65777F',
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 14,
    color: '#65777F',
  },
  button: {
    width: 108,
  },
  schoolCard: {
    padding: Spacing.three,
    gap: 4,
  },
});
