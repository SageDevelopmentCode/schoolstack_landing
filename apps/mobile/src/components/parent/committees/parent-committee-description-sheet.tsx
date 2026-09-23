import { Text, StyleSheet } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeDescriptionSheetProps = {
  visible: boolean;
  committeeName: string;
  description: string;
  leaderLine?: string | null;
  onClose: () => void;
};

export function ParentCommitteeDescriptionSheet({
  visible,
  committeeName,
  description,
  leaderLine,
  onClose,
}: ParentCommitteeDescriptionSheetProps) {
  const theme = useParentTheme();

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={committeeName}
      subtitle="Committee description">
      <Text style={[styles.body, { color: theme.muted }]}>{description}</Text>
      {leaderLine ? (
        <Text style={[styles.leaderLine, { color: theme.muted }]}>{leaderLine}</Text>
      ) : null}
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  leaderLine: {
    marginTop: Spacing.three,
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
});
