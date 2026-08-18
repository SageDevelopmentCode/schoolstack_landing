import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Fonts, Radius } from '@/constants/theme';

type VerificationCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function VerificationCodeInput({
  value,
  onChange,
  disabled = false,
}: VerificationCodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const normalizedValue = value.replace(/\D/g, '').slice(0, 6);

  return (
    <View style={styles.wrapper}>
      <ThemedText type="label">Verification code</ThemedText>
      <TextInput
        ref={inputRef}
        accessibilityLabel="Verification code"
        autoComplete="one-time-code"
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
        placeholderTextColor={Brand.textMuted}
        style={styles.input}
        textContentType="oneTimeCode"
        value={normalizedValue}
        onChangeText={(next) => onChange(next.replace(/\D/g, '').slice(0, 6))}
        editable={!disabled}
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  input: {
    fontFamily: Fonts.mono,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    color: Brand.text,
    backgroundColor: Brand.input,
    borderWidth: 1,
    borderColor: Brand.inputBorder,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
