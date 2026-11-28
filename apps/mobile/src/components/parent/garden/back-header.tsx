import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GLink } from '@/components/parent/garden/ui';

/**
 * Header for screens pushed inside the More stack: a back link, a display
 * title with one accent word, and a muted subtitle. No eyebrow above the title.
 * Leave out `onBack` on flat routes (e.g. co-op program screens) for the same
 * header without a back link.
 */
export function GBackHeader({
  backLabel,
  backAccessibilityLabel,
  onBack,
  backTestID,
  title,
  accentWord,
  subtitle,
  aside,
  children,
  testID,
}: {
  backLabel?: string;
  backAccessibilityLabel?: string;
  onBack?: () => void;
  backTestID?: string;
  title: string;
  /** A word inside `title` to colour with the school accent. */
  accentWord?: string | null;
  subtitle?: string | null;
  aside?: ReactNode;
  children?: ReactNode;
  testID?: string;
}) {
  const accent = useGardenAccent();
  const at = accentWord ? title.indexOf(accentWord) : -1;

  return (
    <View style={styles.root} testID={testID}>
      {onBack && backLabel ? (
        <GLink
          label={backLabel}
          icon="chevron-back"
          accessibilityLabel={backAccessibilityLabel ?? `Back to ${backLabel}`}
          onPress={onBack}
          testID={backTestID}
          style={styles.back}
          reverse
        />
      ) : null}
      <View style={styles.titleRow}>
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.title}>
            {at >= 0 && accentWord ? (
              <>
                {title.slice(0, at)}
                <Text style={{ color: accent.clay }}>{accentWord}</Text>
                {title.slice(at + accentWord.length)}
              </>
            ) : (
              title
            )}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {aside ? <View style={styles.aside}>{aside}</View> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10 },
  back: { alignSelf: 'flex-start', minHeight: 36 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  copy: { flex: 1, gap: 4 },
  title: {
    fontFamily: GardenFonts.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: Garden.ink,
  },
  subtitle: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft },
  aside: { paddingTop: 4 },
});
