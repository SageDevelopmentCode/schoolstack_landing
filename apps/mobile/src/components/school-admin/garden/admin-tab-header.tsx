import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { useUpdatedLabel } from '@/components/school-admin/dashboard/garden/sections/admin-header';
import { useStatusBarBleed } from '@/hooks/use-status-bar-bleed';

/**
 * Tab routes sit inside the admin layout's SafeAreaView: let the cream run
 * under the status bar (same trick as the Dashboard).
 */
export function useAdminTopBleed() {
  return useStatusBarBleed();
}

/**
 * Header for admin tab screens (Admissions, Students, Messages): a Bricolage
 * title with one accent word, a status line built only from data, "Updated N
 * min ago", and an optional toolbar on the right. No eyebrow (skill §2).
 */
export function AdminTabHeader({
  title,
  accentWord,
  statusLine,
  lastUpdatedAt = null,
  toolbar,
  testID,
  statusTestID,
}: {
  title: string;
  /** A word inside `title` to colour with the school accent. */
  accentWord?: string;
  statusLine?: string | null;
  lastUpdatedAt?: number | null;
  toolbar?: ReactNode;
  testID?: string;
  statusTestID?: string;
}) {
  const accent = useGardenAccent();
  const updated = useUpdatedLabel(lastUpdatedAt);
  const at = accentWord ? title.indexOf(accentWord) : -1;

  return (
    <View style={styles.header} testID={testID}>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
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
        {toolbar ? <View style={styles.toolbar}>{toolbar}</View> : null}
      </View>
      {statusLine ? (
        <Text style={styles.status} testID={statusTestID}>
          {statusLine}
        </Text>
      ) : null}
      {updated ? <Text style={styles.updated}>{updated}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
  },
  title: {
    flex: 1,
    fontFamily: GardenFonts.display,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.9,
    color: Garden.ink,
  },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  status: { fontFamily: GardenFonts.bodyBold, fontSize: 14.5, lineHeight: 20, color: Garden.ink },
  updated: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
});
