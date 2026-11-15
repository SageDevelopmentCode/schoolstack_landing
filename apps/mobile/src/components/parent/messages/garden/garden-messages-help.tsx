import { StyleSheet, Text, View } from 'react-native';

import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { PARENT_MESSAGES_STEPS } from '@/lib/messages/parent-messages-feedback';

/** Numbered "How messaging works" steps (web `StartHere`). `activeStep` highlights one (1-based). */
export function MessagesStepsList({ activeStep }: { activeStep?: number }) {
  const accent = useGardenAccent();
  return (
    <View accessibilityRole="list" accessibilityLabel="Steps" style={styles.list}>
      {PARENT_MESSAGES_STEPS.map((step, index) => {
        const number = index + 1;
        const active = activeStep === number;
        return (
          <View
            key={step.title}
            accessible
            accessibilityLabel={`Step ${number}: ${step.title}. ${step.detail}`}
            style={[styles.step, active ? { backgroundColor: accent.wash, borderColor: accent.clay } : null]}>
            <View
              style={[
                styles.number,
                active ? { backgroundColor: accent.clay, borderColor: Garden.ink } : null,
              ]}>
              <Text style={[styles.numberText, active ? { color: Garden.white } : null]}>{number}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.detail}>{step.detail}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function GardenMessagesHelpSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      kicker="Messages"
      title="How messaging works"
      subtitle="Three steps to reach your school office, teachers and families.">
      <MessagesStepsList />
      <Text style={styles.footnote}>
        Pull down on your inbox any time to check for new messages.
      </Text>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  number: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  detail: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 19,
    color: Garden.soft,
  },
  footnote: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 19,
    color: Garden.soft,
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
