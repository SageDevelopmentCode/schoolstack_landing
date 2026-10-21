import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { StoryCard } from '@/components/story/story-card';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  mudKitchenSupportContact,
  MUDKITCHEN_SUPPORT_TEAM_NAME,
  MUDKITCHEN_SUPPORT_TERRACOTTA,
} from '@/lib/messages/platform-support';

type PortalMudKitchenSupportMessagesCardProps = {
  onPress: () => void;
};

export function PortalMudKitchenSupportMessagesCard({
  onPress,
}: PortalMudKitchenSupportMessagesCardProps) {
  const theme = useParentTheme();
  const supportContact = mudKitchenSupportContact();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <StoryCard
        style={{
          ...styles.card,
          backgroundColor: 'rgba(194, 105, 79, 0.06)',
          borderColor: theme.line,
          borderLeftWidth: 3,
          borderLeftColor: MUDKITCHEN_SUPPORT_TERRACOTTA,
        }}>
        <View style={styles.row}>
          <MessagesAvatar
            name={supportContact.name}
            color={supportContact.color}
            photoUrl={supportContact.profilePhotoUrl}
            size="lg"
            photoBackgroundColor="#FFFFFF"
            photoContentFit="contain"
          />
          <View style={styles.textColumn}>
            <Text numberOfLines={2} style={[styles.title, { color: theme.ink }]}>
              Message {MUDKITCHEN_SUPPORT_TEAM_NAME}
            </Text>
            <Text style={[styles.cta, { color: MUDKITCHEN_SUPPORT_TERRACOTTA }]}>Open chat →</Text>
          </View>
        </View>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textColumn: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  cta: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
  },
});
