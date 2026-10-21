import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type GalleryEditDateModalProps = {
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
};

export function GalleryEditDateModal({
  visible,
  value,
  onChange,
  onClose,
  onSave,
  saving = false,
}: GalleryEditDateModalProps) {
  const theme = useParentTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: Story.white }]} onPress={() => {}}>
          <Text style={[styles.title, { color: theme.ink }]}>Photo date</Text>
          <Text style={[styles.hint, { color: theme.muted }]}>Use YYYY-MM-DD format.</Text>
          <StoryTextField
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            placeholder="2026-10-20"
          />
          <View style={styles.actions}>
            <StoryButton label="Cancel" variant="outline" onPress={onClose} disabled={saving} />
            <StoryButton label="Save" onPress={onSave} disabled={saving} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 17,
    fontWeight: '600',
  },
  hint: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
});
