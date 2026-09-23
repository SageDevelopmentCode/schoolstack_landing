import { Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BillingListSeparator } from '@/components/parent/billing/parent-billing-list-separator';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { TuitionCharge } from '@/lib/parent/parent-portal-api';

type ParentBillingChargesSheetProps = {
  visible: boolean;
  charges: TuitionCharge[];
  onClose: () => void;
  renderChargeRow: (charge: TuitionCharge) => ReactNode;
};

export function ParentBillingChargesSheet({
  visible,
  charges,
  onClose,
  renderChargeRow,
}: ParentBillingChargesSheetProps) {
  const theme = useParentTheme();

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel="Close upcoming charges"
      backgroundColor={Story.white}
      borderColor={theme.line}
      handleColor={theme.line}
      maxHeight="85%"
      header={
        <View style={[styles.header, { borderBottomColor: theme.line }]}>
          <Text style={[styles.title, { color: theme.ink }]}>Payment schedule</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {charges.length} open {charges.length === 1 ? 'charge' : 'charges'}
          </Text>
        </View>
      }
      scrollContentStyle={styles.list}>
      {charges.map((charge, index) => (
        <Fragment key={charge.id}>
          {index > 0 ? <BillingListSeparator /> : null}
          {renderChargeRow(charge)}
        </Fragment>
      ))}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    marginTop: 4,
  },
  list: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
});
