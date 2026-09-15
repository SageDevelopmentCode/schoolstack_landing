import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { LateFeeNotice } from '@/lib/tuition/late-fee-notice';
import { formatCents } from '@/lib/tuition/format-cents';

type ParentBillingLateFeeBannerProps = {
  notice: LateFeeNotice;
  onDismiss: () => void;
};

export function ParentBillingLateFeeBanner({
  notice,
  onDismiss,
}: ParentBillingLateFeeBannerProps) {
  const theme = useParentTheme();
  const labelText =
    notice.labels.length === 1
      ? ` for ${notice.labels[0]}`
      : ` across ${notice.labels.length} late fees`;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: theme.infoBg, borderColor: `${theme.info}33` },
      ]}>
      <Ionicons name="information-circle-outline" size={20} color={theme.info} />
      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: theme.ink }]}>Late fee added</Text>
        <Text style={[styles.body, { color: theme.muted }]}>
          {formatCents(notice.totalCents)} was added{labelText}.
        </Text>
      </View>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss late fee notice">
        <Text style={[styles.dismiss, { color: theme.muted }]}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  dismiss: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
});
