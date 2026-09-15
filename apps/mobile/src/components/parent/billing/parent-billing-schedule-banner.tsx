import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentBillingScheduleBannerProps = {
  message: string;
};

export function ParentBillingScheduleBanner({ message }: ParentBillingScheduleBannerProps) {
  const theme = useParentTheme();

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: theme.warningBg, borderColor: `${theme.warning}33` },
      ]}>
      <Ionicons name="calendar-outline" size={20} color={theme.warning} />
      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: theme.ink }]}>Payment schedule pending</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{message}</Text>
      </View>
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
