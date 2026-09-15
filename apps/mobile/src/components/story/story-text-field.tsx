import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Story, StoryRadius, StoryFonts } from '@/constants/story-theme';

type StoryTextFieldProps = TextInputProps & {
  label?: string;
};

export function StoryTextField({ label, style, ...rest }: StoryTextFieldProps) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={Story.muted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Story.ink,
  },
  input: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    color: Story.ink,
    backgroundColor: Story.white,
    borderWidth: 1,
    borderColor: Story.line,
    borderRadius: StoryRadius.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
