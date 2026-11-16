import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  DateStamp,
  GChip,
  GPressable,
  GProgress,
  parseEventDate,
} from '@/components/parent/garden/ui';

/**
 * One time slot or role to pick. Selected = accent border + tick; full (and not
 * yours) = dimmed with a "Full" chip — tapping it still answers, so the parent
 * learns why (the form toasts "That one's full").
 */
export function SignupOptionCard({
  title,
  lines,
  date,
  fillCount,
  capacity,
  selected,
  multiple,
  interactive,
  onPress,
  testID,
}: {
  title: string;
  lines: string[];
  date?: string | null;
  fillCount: number;
  capacity: number;
  selected: boolean;
  /** Checkbox semantics (many allowed) vs radio (one). */
  multiple: boolean;
  /** False when the signup is closed: a static summary row. */
  interactive: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const accent = useGardenAccent();
  const full = fillCount >= capacity;
  const taken = full && !selected;
  const spotsLeft = Math.max(0, capacity - fillCount);
  const fillLabel = `${fillCount} of ${capacity} ${capacity === 1 ? 'spot' : 'spots'} filled`;
  const dateSpoken = date
    ? `${parseEventDate(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}. `
    : '';
  const spoken = `${title}. ${dateSpoken}${lines.join('. ')}. ${
    taken ? 'Full' : selected ? 'Selected' : `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`
  }`;

  const body = (
    <>
      {date ? <DateStamp date={date} /> : null}
      <View style={styles.copy}>
        <Text style={[styles.title, selected && { color: accent.clayDeep }]} numberOfLines={2}>
          {title}
        </Text>
        {lines.map((line) => (
          <Text key={line} style={styles.line} numberOfLines={3}>
            {line}
          </Text>
        ))}
        <View style={styles.fillRow}>
          <GProgress
            value={capacity > 0 ? fillCount / capacity : 0}
            label={fillLabel}
            done={full}
            style={styles.fillBar}
          />
          <Text style={styles.fillText}>{fillLabel}</Text>
        </View>
        {taken ? <GChip label="Full" tone="neutral" icon="lock-closed" style={styles.chip} /> : null}
      </View>
      <View
        style={[
          multiple ? styles.box : styles.radio,
          selected
            ? { backgroundColor: accent.clay, borderColor: accent.clay }
            : { backgroundColor: Garden.white, borderColor: taken ? Garden.ink25 : Garden.ink60 },
        ]}>
        {selected ? <Ionicons name="checkmark" size={16} color={Garden.white} /> : null}
      </View>
    </>
  );

  const cardStyle = [
    styles.card,
    selected
      ? { borderColor: accent.clay, backgroundColor: accent.wash, borderWidth: 2 }
      : { borderColor: Garden.ink12, backgroundColor: Garden.white },
    taken && styles.taken,
  ];

  if (!interactive) {
    return (
      <View testID={testID} accessible accessibilityLabel={spoken} style={cardStyle}>
        {body}
      </View>
    );
  }

  return (
    <GPressable
      testID={testID}
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityLabel={spoken}
      accessibilityState={{ checked: selected, disabled: taken }}
      accessibilityHint={taken ? 'This option is full' : undefined}
      haptic="none"
      pressedScale={0.98}
      onPress={onPress}
      style={cardStyle}>
      {body}
    </GPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    minHeight: 64,
  },
  taken: { opacity: 0.6 },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontFamily: GardenFonts.bodyExtra, fontSize: 15.5, lineHeight: 20, color: Garden.ink },
  line: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  fillRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  fillBar: { flex: 1, maxWidth: 110, height: 8 },
  fillText: { fontFamily: GardenFonts.bodyBold, fontSize: 12, color: Garden.soft },
  chip: { alignSelf: 'flex-start', marginTop: 4 },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
