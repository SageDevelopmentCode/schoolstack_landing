import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, PANEL_TINTS } from '@/components/parent/garden/tokens';
import { GCard, GChip, GSkeleton } from '@/components/parent/garden/ui';
import type { FamilyGuardianRecord } from '@/lib/admissions/family-guardians';

function initials(first: string | null, last: string | null): string {
  const value = `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
  return value || '?';
}

/**
 * Family contacts (Garden version of `SubmissionGuardiansSection`, same copy):
 * pastel initials, name, Primary chip, email. Used by the application and
 * student details.
 */
export function GuardiansCard({
  guardians,
  loading,
  index = 0,
  testID,
}: {
  guardians: FamilyGuardianRecord[];
  loading: boolean;
  index?: number;
  testID?: string;
}) {
  return (
    <GCard title="Guardians" index={index} testID={testID}>
      {loading ? (
        <View style={styles.rows} accessibilityLabel="Loading guardians">
          {[0, 1].map((i) => (
            <View key={i} style={styles.row}>
              <GSkeleton style={styles.skAvatar} />
              <View style={styles.copy}>
                <GSkeleton style={styles.skName} />
                <GSkeleton style={styles.skMeta} />
              </View>
            </View>
          ))}
        </View>
      ) : guardians.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No linked family contacts yet.</Text>
          <Text style={styles.emptyBody}>This application is not linked to a family record.</Text>
        </View>
      ) : (
        <View style={styles.rows}>
          <Text style={styles.description}>Family contacts for this application.</Text>
          {guardians.map((guardian, i) => {
            const name = [guardian.firstName, guardian.lastName].filter(Boolean).join(' ') || 'Unnamed';
            return (
              <View
                key={guardian.id}
                style={[styles.row, i > 0 && styles.divider]}
                accessible
                accessibilityLabel={`${name}${guardian.isPrimary ? ', primary' : ''}${
                  guardian.email ? `, ${guardian.email}` : ''
                }`}>
                <View style={[styles.avatar, { backgroundColor: PANEL_TINTS[i % PANEL_TINTS.length] }]}>
                  <Text style={styles.avatarText}>{initials(guardian.firstName, guardian.lastName)}</Text>
                </View>
                <View style={styles.copy}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {name}
                    </Text>
                    {guardian.isPrimary ? <GChip label="Primary" tone="success" /> : null}
                  </View>
                  {guardian.email ? (
                    <Text style={styles.meta} selectable numberOfLines={1}>
                      {guardian.email}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </GCard>
  );
}

const styles = StyleSheet.create({
  rows: { gap: 2 },
  description: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, color: Garden.soft, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink65 },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  empty: { gap: 4 },
  emptyTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  emptyBody: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft },
  skAvatar: { width: 40, height: 40, borderRadius: 20 },
  skName: { width: '50%', height: 14, borderRadius: 7 },
  skMeta: { width: '70%', height: 12, borderRadius: 6 },
});
