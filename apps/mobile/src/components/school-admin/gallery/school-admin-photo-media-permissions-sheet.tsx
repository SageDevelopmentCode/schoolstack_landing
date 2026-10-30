import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryButton } from '@/components/story/story-button';
import { ThemedText } from '@/components/themed-text';
import { StoryChip, type StoryChipTone } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import {
  fetchSchoolAdminPhotoMediaConsents,
  type SchoolAdminPhotoMediaConsentRow,
} from '@/lib/school-admin/school-admin-photo-media-consent-api';
import type { PhotoMediaConsent } from '@/lib/students/photo-media-consent';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type SchoolAdminPhotoMediaPermissionsSheetProps = {
  visible: boolean;
  organizationId: string;
  onClose: () => void;
};

function formatUpdatedAt(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function consentChipTone(consent: PhotoMediaConsent | null): StoryChipTone {
  if (consent === 'full') return 'success';
  if (consent === 'limited') return 'warning';
  if (consent === 'none') return 'alert';
  return 'info';
}

function PermissionsRowSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      <SkeletonPulse style={styles.skeletonName} backgroundColor="#E8ECEE" />
      <SkeletonPulse style={styles.skeletonProgram} backgroundColor="#E8ECEE" />
      <SkeletonPulse style={styles.skeletonChip} backgroundColor="#E8ECEE" />
    </View>
  );
}

function PermissionsRow({ row }: { row: SchoolAdminPhotoMediaConsentRow }) {
  const theme = useParentTheme();
  const studentName = `${row.firstName} ${row.lastName}`.trim();

  return (
    <View style={[styles.row, { borderColor: theme.line }]}>
      <Text style={[styles.studentName, { color: theme.ink }]}>{studentName}</Text>
      <Text style={[styles.program, { color: theme.muted }]} numberOfLines={2}>
        {row.programLabel}
      </Text>
      <View style={styles.rowMeta}>
        <StoryChip
          label={row.consentLabel}
          tone={consentChipTone(row.consent)}
          uppercase={false}
        />
        <Text style={[styles.updated, { color: theme.muted }]}>
          Updated {formatUpdatedAt(row.updatedAt)}
        </Text>
      </View>
    </View>
  );
}

export function SchoolAdminPhotoMediaPermissionsSheet({
  visible,
  organizationId,
  onClose,
}: SchoolAdminPhotoMediaPermissionsSheetProps) {
  const theme = useParentTheme();
  const [students, setStudents] = useState<SchoolAdminPhotoMediaConsentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { reportError } = useMobileErrorReporter(organizationId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchSchoolAdminPhotoMediaConsents(organizationId);
      setStudents(rows);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load photo permissions.';
      setError(message);
      setStudents([]);
      reportError('school_admin_photo_media_consents_load', err, { error: message });
    } finally {
      setLoading(false);
    }
  }, [organizationId, reportError]);

  useEffect(() => {
    if (!visible) return;
    void load();
  }, [visible, load]);

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel="Close photo permissions"
      header={
        <View style={styles.header}>
          <ThemedText type="title" style={{ color: theme.ink }}>Photo permissions</ThemedText>
          <ThemedText type="small" style={{ color: theme.muted, marginTop: 4 }}>
            Stored consent for enrolled students (from enrollment and parent updates).
          </ThemedText>
        </View>
      }>
      <View testID="school-admin-photo-media-permissions-sheet">
      {loading ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 8 }).map((_, index) => (
            <PermissionsRowSkeleton key={index} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.messageBlock}>
          <Text style={[styles.errorText, { color: theme.alert }]}>{error}</Text>
          <StoryButton label="Try again" variant="outline" onPress={() => void load()} />
        </View>
      ) : students.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.muted }]}>No enrolled students yet.</Text>
      ) : (
        <View style={styles.list}>
          {students.map((row) => (
            <PermissionsRow key={row.studentId} row={row} />
          ))}
        </View>
      )}
      </View>
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  studentName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
  },
  program: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  rowMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  updated: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  skeletonList: {
    gap: Spacing.two,
  },
  skeletonRow: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E8ECEE',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  skeletonName: {
    height: 14,
    width: '55%',
    borderRadius: Radius.sm,
  },
  skeletonProgram: {
    height: 12,
    width: '80%',
    borderRadius: Radius.sm,
  },
  skeletonChip: {
    height: 22,
    width: 100,
    borderRadius: Radius.md,
  },
  messageBlock: {
    gap: Spacing.three,
  },
  errorText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  emptyText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
});
