import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type CopyableUrlRowProps = {
  url: string;
};

export function CopyableUrlRow({ url }: CopyableUrlRowProps) {
  const theme = useParentTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: Story.white, borderColor: Story.line }]}>
      <Text numberOfLines={2} style={[styles.url, { color: theme.ink }]}>
        {url}
      </Text>
      <StoryTextLink
        label={copied ? 'Copied' : 'Copy'}
        onPress={() => void handleCopy()}
        style={styles.copyLink}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  url: {
    flex: 1,
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  copyLink: {
    alignSelf: 'center',
  },
});
