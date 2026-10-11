import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { StoryTextLink } from '@/components/story/story-text-link';
import { Story } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export type PreAuthLinkItem = {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

type PreAuthLinkRowProps = {
  items: PreAuthLinkItem[];
};

export function PreAuthLinkRow({ items }: PreAuthLinkRowProps) {
  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    const item = items[0];
    return (
      <StoryTextLink
        label={item.label}
        icon={item.icon}
        accessibilityLabel={item.accessibilityLabel ?? item.label}
        onPress={item.onPress}
        disabled={item.disabled}
      />
    );
  }

  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <StoryTextLink
            label={item.label}
            icon={item.icon}
            accessibilityLabel={item.accessibilityLabel ?? item.label}
            onPress={item.onPress}
            disabled={item.disabled}
          />
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: Story.line,
  },
});
