import { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Fonts, Radius } from '@/constants/theme';

const CODE_LENGTH = 6;

type VerificationCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function normalizeCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, CODE_LENGTH);
}

export function VerificationCodeInput({
  value,
  onChange,
  disabled = false,
}: VerificationCodeInputProps) {
  const normalized = normalizeCode(value);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const updateValue = useCallback(
    (next: string) => {
      onChange(normalizeCode(next));
    },
    [onChange],
  );

  const focusInput = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(CODE_LENGTH - 1, index));
    inputRefs.current[clamped]?.focus();
  }, []);

  const applyPaste = useCallback(
    (pasted: string, startIndex = 0) => {
      const digits = normalizeCode(pasted);
      if (!digits) return;

      const before = normalized.slice(0, startIndex);
      const next = normalizeCode(before + digits);
      updateValue(next);

      const focusIndex = Math.min(next.length, CODE_LENGTH - 1);
      requestAnimationFrame(() => focusInput(focusIndex));
    },
    [focusInput, normalized, updateValue],
  );

  const setDigitAt = useCallback(
    (index: number, digit: string) => {
      const next = normalizeCode(
        normalized.slice(0, index) + digit + normalized.slice(index + 1),
      );
      updateValue(next);

      if (index < CODE_LENGTH - 1) {
        requestAnimationFrame(() => focusInput(index + 1));
      }
    },
    [focusInput, normalized, updateValue],
  );

  const handleBackspace = useCallback(
    (index: number) => {
      if (normalized[index]) {
        const next = normalized.slice(0, index) + normalized.slice(index + 1);
        updateValue(next);
        requestAnimationFrame(() => focusInput(index));
        return;
      }

      if (index > 0) {
        const prevIndex = index - 1;
        const next = normalized.slice(0, prevIndex) + normalized.slice(prevIndex + 1);
        updateValue(next);
        requestAnimationFrame(() => focusInput(prevIndex));
      }
    },
    [focusInput, normalized, updateValue],
  );

  const handleKeyPress = useCallback(
    (index: number, event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const key = event.nativeEvent.key;

      if (key === 'Backspace') {
        handleBackspace(index);
        return;
      }

      if (key === 'ArrowLeft') {
        focusInput(index - 1);
        return;
      }

      if (key === 'ArrowRight') {
        focusInput(index + 1);
      }
    },
    [focusInput, handleBackspace],
  );

  useEffect(() => {
    if (disabled) return;
    requestAnimationFrame(() => focusInput(0));
    // Initial focus only when the verify screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  return (
    <View style={styles.wrapper}>
      <ThemedText type="label">Verification code</ThemedText>

      <View
        accessibilityLabel="Verification code"
        accessibilityRole="none"
        style={styles.cellsWrapper}>
        <TextInput
          accessibilityElementsHidden
          importantForAutofill="yes"
          autoComplete="one-time-code"
          caretHidden
          editable={!disabled}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          style={styles.hiddenAutofill}
          textContentType="oneTimeCode"
          value={normalized}
          onChangeText={updateValue}
        />

        <View style={styles.cellsRow}>
          {Array.from({ length: CODE_LENGTH }, (_, index) => (
            <TextInput
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              accessibilityLabel={`Digit ${index + 1} of ${CODE_LENGTH}`}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              editable={!disabled}
              keyboardType="number-pad"
              maxLength={index === 0 ? CODE_LENGTH : 1}
              selectTextOnFocus
              style={[
                styles.cell,
                focusedIndex === index && styles.cellFocused,
                disabled && styles.cellDisabled,
              ]}
              textContentType={index === 0 ? 'oneTimeCode' : 'none'}
              value={normalized[index] ?? ''}
              onChangeText={(nextValue) => {
                if (nextValue.length > 1) {
                  applyPaste(nextValue, index);
                  return;
                }
                if (/^\d$/.test(nextValue)) {
                  setDigitAt(index, nextValue);
                }
              }}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex((current) => (current === index ? null : current))}
              onKeyPress={(event) => handleKeyPress(index, event)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  cellsWrapper: {
    position: 'relative',
  },
  hiddenAutofill: {
    position: 'absolute',
    height: 1,
    width: 1,
    opacity: 0,
  },
  cellsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cell: {
    flex: 1,
    height: 48,
    fontFamily: Fonts.mono,
    fontSize: 22,
    textAlign: 'center',
    color: Brand.text,
    backgroundColor: Brand.input,
    borderWidth: 1,
    borderColor: Brand.inputBorder,
    borderRadius: Radius.md,
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  cellFocused: {
    borderColor: Brand.accent,
  },
  cellDisabled: {
    opacity: 0.6,
  },
});
