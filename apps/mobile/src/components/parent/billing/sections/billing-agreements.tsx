import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GChip, GHand, GPressable, GRing, GTick } from '@/components/parent/garden/ui';
import type { ParentFormListItem } from '@/lib/parent/parent-forms-documents-types';
import { formatFormDueDate, formatFormSignedDate } from '@/lib/parent/parent-forms-documents-utils';

/** Forms tab: agreements to sign first, then the signed ones (collapsed). */
export function BillingAgreements({
  agreements,
  onOpenAgreement,
  index = 0,
}: {
  agreements: ParentFormListItem[];
  onOpenAgreement: (formId: string) => void;
  index?: number;
}) {
  const [showSigned, setShowSigned] = useState(false);
  const pending = agreements.filter((item) => item.listStatus === 'needs_action');
  const signed = agreements.filter((item) => item.listStatus === 'signed');

  if (agreements.length === 0) {
    return (
      <GCard index={index} kicker="Tuition agreements" title="Nothing to sign">
        <Text style={styles.body}>No tuition agreements assigned to your family right now.</Text>
      </GCard>
    );
  }

  return (
    <GCard
      index={index}
      kicker="Tuition agreements"
      title={pending.length > 0 ? `${pending.length} to sign` : 'All agreements signed'}>
      <Text style={styles.body}>Review and sign agreements assigned to your family.</Text>
      <View style={styles.chips}>
        {pending.length > 0 ? (
          <GChip tone="warning" label={`Needs signature · ${pending.length}`} />
        ) : null}
        {signed.length > 0 ? <GChip tone="success" label={`Signed · ${signed.length}`} /> : null}
      </View>

      {pending.length > 0 ? (
        <View style={styles.notebook}>
          {pending.map((item, i) => {
            const due = item.form.dueDate ? `Due ${formatFormDueDate(item.form.dueDate)}` : 'No due date';
            return (
              <GPressable
                key={item.form.id}
                accessibilityLabel={`${item.form.title}. ${due}. Needs signature. Review and sign`}
                pressedScale={0.99}
                haptic="press"
                onPress={() => onOpenAgreement(item.form.id)}
                style={[styles.row, i > 0 && styles.divider]}>
                <GRing />
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{item.form.title}</Text>
                  <Text style={styles.rowMeta}>{due}</Text>
                </View>
                <Text style={styles.sign}>Review & sign</Text>
                <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
              </GPressable>
            );
          })}
        </View>
      ) : (
        <GHand>every page signed ✿</GHand>
      )}

      {signed.length > 0 ? (
        <>
          <GPressable
            accessibilityLabel={`Signed agreements (${signed.length})`}
            accessibilityState={{ expanded: showSigned }}
            haptic="select"
            onPress={() => setShowSigned((value) => !value)}
            style={styles.toggle}>
            <Ionicons
              name={showSigned ? 'chevron-down' : 'chevron-forward'}
              size={16}
              color={Garden.ink}
            />
            <Text style={styles.toggleText}>Signed agreements ({signed.length})</Text>
          </GPressable>
          {showSigned ? (
            <View style={styles.notebook}>
              {signed.map((item, i) => {
                const when = item.response.signedAt
                  ? `Signed ${formatFormSignedDate(item.response.signedAt)}`
                  : 'Signed';
                return (
                  <GPressable
                    key={item.form.id}
                    accessibilityLabel={`${item.form.title}. ${when}. Open`}
                    pressedScale={0.99}
                    onPress={() => onOpenAgreement(item.form.id)}
                    style={[styles.row, i > 0 && styles.divider]}>
                    <GTick />
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle}>{item.form.title}</Text>
                      <Text style={styles.rowMeta}>{when}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
                  </GPressable>
                );
              })}
            </View>
          ) : null}
        </>
      ) : null}
    </GCard>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: 4,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  notebook: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    backgroundColor: Garden.notebook,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,74,60,0.1)',
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    color: Garden.ink,
  },
  rowMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.soft,
  },
  sign: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
    color: Garden.ink65,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    marginTop: 8,
  },
  toggleText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
});
