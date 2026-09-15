import { StyleSheet, Text, View } from 'react-native';

import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { Committee } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type ParentCommitteeMessagesSectionProps = {
  committee: Committee;
};

export function ParentCommitteeMessagesSection({ committee }: ParentCommitteeMessagesSectionProps) {
  const theme = useParentTheme();

  if (committee.messages.length === 0) {
    return (
      <StoryDetailSection title="Messages">
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>No messages yet.</Text>
      </StoryDetailSection>
    );
  }

  return (
    <StoryDetailSection title="Messages">
      <View style={styles.list}>
        {committee.messages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubble, { backgroundColor: theme.white, borderColor: '#DCE4DC' }]}>
            <View style={styles.bubbleHeader}>
              <Text style={[styles.sender, { color: theme.ink }]}>{message.senderName}</Text>
              <Text style={[styles.time, { color: theme.muted }]}>{message.time}</Text>
            </View>
            <Text style={[styles.body, { color: theme.muted }]}>{message.text}</Text>
          </View>
        ))}
      </View>
    </StoryDetailSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  bubble: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    maxWidth: '100%',
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  sender: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
  },
  time: {
    fontFamily: StoryFonts.body,
    fontSize: 10,
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
});
