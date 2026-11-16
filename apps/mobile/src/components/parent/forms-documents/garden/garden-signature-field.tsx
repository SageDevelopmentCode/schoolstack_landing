import { forwardRef } from 'react';
import { StyleSheet, Text, View, type TextInput } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { GTextField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GDashedRule, GTick } from '@/components/parent/garden/ui';

/** Registered in `constants/app-fonts.ts`. */
const SIGNATURE_FONT = 'Lora_500Medium_Italic';

type GardenSignatureFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onSubmit?: () => void;
  disabled?: boolean;
  label?: string;
  /** Shown when the parent tried to sign without a name. */
  invalid?: boolean;
  testID?: string;
};

/**
 * Typed signature: a paper "signature line" with a live italic preview of the
 * name, then the name field. Same value as the Story field (plain string).
 */
export const GardenSignatureField = forwardRef<TextInput, GardenSignatureFieldProps>(
  function GardenSignatureField(
    {
      value,
      onChange,
      onFocus,
      onSubmit,
      disabled = false,
      label = 'Type your full legal name',
      invalid = false,
      testID,
    },
    ref,
  ) {
    const accent = useGardenAccent();
    const trimmed = value.trim();
    const showError = invalid && !trimmed;

    return (
      <View style={styles.root}>
        <View
          accessible
          accessibilityLabel={trimmed ? `Signature preview: ${trimmed}` : 'Signature preview, empty'}
          accessibilityLiveRegion="polite"
          style={[
            styles.paper,
            trimmed
              ? { backgroundColor: accent.wash, borderColor: accent.clay, borderStyle: 'solid' }
              : null,
          ]}>
          <View style={styles.line}>
            <Text style={styles.cross}>×</Text>
            <Animated.Text
              key={trimmed ? 'signed' : 'empty'}
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(120)}
              style={[styles.preview, { color: trimmed ? accent.clayDeep : Garden.ink25 }]}
              numberOfLines={2}>
              {trimmed || 'Your signature will appear here'}
            </Animated.Text>
            {trimmed ? <GTick size={22} /> : null}
          </View>
          <GDashedRule />
        </View>

        <GTextField
          ref={ref}
          testID={testID}
          label={label}
          value={value}
          onChangeText={onChange}
          onFocus={onFocus}
          onSubmitEditing={trimmed && onSubmit ? onSubmit : undefined}
          returnKeyType="done"
          disabled={disabled}
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="name"
          textContentType="name"
          placeholder="Full legal name"
          error={showError ? 'Type your name here to sign.' : null}
          helper="Your typed name becomes your signature on this form."
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: { gap: 14 },
  paper: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Garden.ink15,
    backgroundColor: Garden.paper,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 6,
  },
  line: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, minHeight: 48 },
  cross: {
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 28,
    color: Garden.ink25,
  },
  preview: { flex: 1, fontFamily: SIGNATURE_FONT, fontSize: 26, lineHeight: 34 },
});
