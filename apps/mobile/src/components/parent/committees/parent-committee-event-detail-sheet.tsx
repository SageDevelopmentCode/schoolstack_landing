import { StyleSheet, Text, View } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { CommitteeEvent } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeEventDetailSheetProps = {
  visible: boolean;
  event: CommitteeEvent | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ParentCommitteeEventDetailSheet({
  visible,
  event,
  canEdit,
  canDelete,
  onClose,
  onEdit,
  onDelete,
}: ParentCommitteeEventDetailSheetProps) {
  const theme = useParentTheme();

  if (!event) return null;

  const formattedDate = new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <ParentBottomSheet visible={visible} onClose={onClose} title={event.title} subtitle="Committee event">
      <View style={styles.content}>
        <StoryChip tone="info" label={event.type} />
        <DetailField label="Date" value={formattedDate} theme={theme} />
        {event.time ? <DetailField label="Time" value={event.time} theme={theme} /> : null}
        {event.location ? <DetailField label="Location" value={event.location} theme={theme} /> : null}

        <View style={styles.actions}>
          {canEdit && onEdit ? (
            <StoryButton label="Edit event" previewSafe onPress={onEdit} />
          ) : null}
          {canDelete && onDelete ? (
            <StoryButton label="Delete event" previewSafe onPress={onDelete} />
          ) : null}
        </View>
      </View>
    </ParentBottomSheet>
  );
}

function DetailField({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: { muted: string; ink: string };
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: theme.ink }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  fieldValue: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
