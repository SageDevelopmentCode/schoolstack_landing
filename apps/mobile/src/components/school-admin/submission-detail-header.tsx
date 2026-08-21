import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';

export function SubmissionDetailHeader() {
  const theme = useAdminTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to submissions"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={20} color={theme.accent} />
        <ThemedText type="small" style={{ color: theme.accent }}>
          Submissions
        </ThemedText>
      </Pressable>
      <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
        Submission
      </ThemedText>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 110,
  },
  spacer: {
    minWidth: 110,
  },
});
