import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentFormSignatureFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  onFocus?: () => void;
};

export function ParentFormSignatureField({
  value,
  onChange,
  disabled = false,
  label = 'Type your full legal name',
  onFocus,
}: ParentFormSignatureFieldProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        editable={!disabled}
        autoCapitalize="words"
        autoCorrect={false}
        placeholder="Full legal name"
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          {
            borderColor: theme.line,
            backgroundColor: theme.white,
            color: theme.ink,
          },
        ]}
      />
      <View style={styles.previewWrap}>
        {value.trim() ? (
          <Text style={[styles.preview, { color: theme.ink }]}>{value.trim()}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  previewWrap: {
    minHeight: 40,
    paddingTop: Spacing.two,
    justifyContent: 'center',
  },
  preview: {
    fontFamily: StoryFonts.display,
    fontSize: 24,
    fontStyle: 'italic',
    lineHeight: 32,
  },
});
