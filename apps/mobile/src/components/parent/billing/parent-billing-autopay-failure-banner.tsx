import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentBillingAutopayFailureBannerProps = {
  summary: string;
  onDismiss: () => void;
};

export function ParentBillingAutopayFailureBanner({
  summary,
  onDismiss,
}: ParentBillingAutopayFailureBannerProps) {
  const theme = useParentTheme();

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: theme.alertBg, borderColor: `${theme.alert}33` },
      ]}>
      <Ionicons name="alert-circle-outline" size={20} color={theme.alert} />
      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: theme.ink }]}>Autopay failed</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{summary}</Text>
      </View>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss autopay failure">
        <Ionicons name="close" size={18} color={theme.muted} />
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
});
