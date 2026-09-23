import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryMoreMenuIcon } from '@/components/story/more/story-more-menu-icon';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export type FridayBranchActionSheetItem = {
  label: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  destructive?: boolean;
  onPress: () => void;
};

type SchoolAdminFridayBranchActionsSheetProps = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  actions: FridayBranchActionSheetItem[];
  onClose: () => void;
};

export function SchoolAdminFridayBranchActionsSheet({
  visible,
  title,
  subtitle,
  actions,
  onClose,
}: SchoolAdminFridayBranchActionsSheetProps) {
  const theme = useParentTheme();

  const handleActionPress = (action: FridayBranchActionSheetItem) => {
    action.onPress();
    onClose();
  };

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Close actions">
      <View style={styles.content}>
        {title ? (
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actions}>
          {actions.map((action, index) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => handleActionPress(action)}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowBordered,
                pressed && styles.pressed,
              ]}>
              <StoryMoreMenuIcon
                name={action.icon}
                iconBg={action.iconBg}
                iconColor={action.iconColor}
              />
              <View style={styles.copy}>
                <Text
                  style={[
                    styles.label,
                    { color: action.destructive ? theme.alert : theme.ink },
                  ]}>
                  {action.label}
                </Text>
                {action.subtitle ? (
                  <Text style={[styles.actionSubtitle, { color: theme.muted }]}>
                    {action.subtitle}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.four,
  },
  header: {
    gap: 2,
    marginBottom: Spacing.two,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  rowBordered: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7EBE2',
  },
  pressed: {
    opacity: 0.85,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  actionSubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
