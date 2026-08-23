import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

type CopyableUrlRowProps = {
  url: string;
};

export function CopyableUrlRow({ url }: CopyableUrlRowProps) {
  const theme = useAdminTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.elevated,
          borderColor: theme.border,
        },
      ]}>
      <ThemedText
        type="small"
        numberOfLines={2}
        style={[styles.url, { color: theme.textPrimary }]}>
        {url}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Copy sign-in URL"
        onPress={() => void handleCopy()}
        style={({ pressed }) => [styles.copyButton, pressed && { opacity: 0.7 }]}>
        {copied ? (
          <ThemedText type="smallBold" style={{ color: theme.success }}>
            Copied
          </ThemedText>
        ) : (
          <Ionicons name="copy-outline" size={18} color={theme.accent} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  url: {
    flex: 1,
  },
  copyButton: {
    padding: Spacing.one,
  },
});
