import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentClassroomSignupListItem } from '@/lib/parent/parent-classroom-signups-types';
import { SIGNUP_TYPE_LABELS } from '@/lib/parent/parent-classroom-signups-types';
import {
  formatSignupDeadline,
  getSignupActionLabel,
} from '@/lib/parent/parent-classroom-signups-utils';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentClassroomSignupListItemProps = {
  item: ParentClassroomSignupListItem;
  onPress: () => void;
};

export function ParentClassroomSignupListItemCard({
  item,
  onPress,
}: ParentClassroomSignupListItemProps) {
  const theme = useParentTheme();
  const { signup, listStatus } = item;
  const deadline = formatSignupDeadline(signup.responseDeadline);
  const actionLabel = getSignupActionLabel(listStatus);
  const actionVariant =
    listStatus === 'needs_response' ? 'primary' : listStatus === 'signed_up' ? 'soft' : 'outline';
  const showMeta = listStatus === 'needs_response';

  return (
    <StoryCard variant={showMeta ? 'today' : 'default'} style={styles.card}>
      <View style={styles.row}>
        {showMeta ? (
          <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="clipboard-outline" size={18} color={theme.primary} />
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.content, pressed && { opacity: 0.95 }]}>
          <StoryDisplayHeading size="section" style={styles.title}>
            {signup.title}
          </StoryDisplayHeading>
          <Text style={[styles.meta, { color: theme.muted }]}>
            From {signup.teacherName}
            {signup.classroomName ? ` · ${signup.classroomName}` : ''}
          </Text>
          {showMeta ? (
            <View style={styles.metaRow}>
              <Text style={[styles.metaDetail, { color: theme.muted }]}>
                {SIGNUP_TYPE_LABELS[signup.signupType]}
              </Text>
              {deadline ? (
                <Text style={[styles.metaDetail, { color: theme.muted }]}>
                  Sign up by {deadline}
                </Text>
              ) : null}
            </View>
          ) : null}
        </Pressable>
      </View>
      <StoryButton label={actionLabel} variant={actionVariant} onPress={onPress} />
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: 16,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: 4,
  },
  metaDetail: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
