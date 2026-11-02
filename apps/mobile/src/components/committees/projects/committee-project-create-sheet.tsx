import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type CommitteeProjectCreateSheetProps = {
  visible: boolean;
  saving?: boolean;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    description: string;
    status: 'draft' | 'active';
  }) => void | Promise<void>;
};

export function CommitteeProjectCreateSheet({
  visible,
  saving = false,
  onClose,
  onCreate,
}: CommitteeProjectCreateSheetProps) {
  const theme = useParentTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const reset = () => {
    setName('');
    setDescription('');
    setActive(true);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await onCreate({
      name: trimmed,
      description: description.trim(),
      status: active ? 'active' : 'draft',
    });
    reset();
  };

  return (
    <ParentBottomSheet visible={visible} onClose={handleClose} title="New project">
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.muted }]}>Project name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Spring fair"
          placeholderTextColor={theme.muted}
          style={[
            styles.input,
            { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
          ]}
        />
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.muted }]}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Optional"
          placeholderTextColor={theme.muted}
          multiline
          style={[
            styles.input,
            styles.textArea,
            { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
          ]}
        />
      </View>
      <View style={styles.toggleRow}>
        <Text style={[styles.label, { color: theme.ink }]}>Active project</Text>
        <Switch value={active} onValueChange={setActive} />
      </View>
      <StoryButton
        label={saving ? 'Creating…' : 'Create project'}
        onPress={() => void handleCreate()}
        disabled={saving || !name.trim()}
      />
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
    fontSize: 15,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
});
