import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, type GChipTone } from '@/components/parent/garden/tokens';
import { GChip, GLink } from '@/components/parent/garden/ui';
import { AdminFilterChips, AdminRowSkeleton, AdminWorkRow, type AdminFilterChip } from '@/components/school-admin/garden/admin-ui';
import {
  fetchSchoolAdminPhotoMediaConsents,
  type SchoolAdminPhotoMediaConsentRow,
} from '@/lib/school-admin/school-admin-photo-media-consent-api';
import type { PhotoMediaConsent } from '@/lib/students/photo-media-consent';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ConsentFilter = 'all' | 'full' | 'limited' | 'none' | 'unset';

function formatUpdatedAt(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function consentTone(consent: PhotoMediaConsent | null): GChipTone {
  if (consent === 'full') return 'success';
  if (consent === 'limited') return 'warning';
  if (consent === 'none') return 'alert';
  return 'info';
}

function consentKey(consent: PhotoMediaConsent | null): Exclude<ConsentFilter, 'all'> {
  if (consent === 'full' || consent === 'limited' || consent === 'none') return consent;
  return 'unset';
}

/**
 * Garden "Photo permissions" sheet: same fetch, report operation and copy as
 * the Story sheet, plus consent filter chips so a teacher can check who can
 * appear in photos before sharing.
 */
export function AdminPhotoPermissionsSheet({
  visible,
  organizationId,
  onClose,
}: {
  visible: boolean;
  organizationId: string;
  onClose: () => void;
}) {
  const { reportError } = useMobileErrorReporter(organizationId);
  const [students, setStudents] = useState<SchoolAdminPhotoMediaConsentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConsentFilter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStudents(await fetchSchoolAdminPhotoMediaConsents(organizationId));
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
    queueMicrotask(() => {
      setFilter('all');
      void load();
    });
  }, [visible, load]);

  const counts = useMemo(() => {
    const result: Record<ConsentFilter, number> = { all: students.length, full: 0, limited: 0, none: 0, unset: 0 };
    for (const row of students) result[consentKey(row.consent)] += 1;
    return result;
  }, [students]);

  const chips = useMemo<AdminFilterChip<ConsentFilter>[]>(
    () =>
      (
        [
          { id: 'all', label: 'All' },
          { id: 'none', label: 'No photos' },
          { id: 'limited', label: 'Limited' },
          { id: 'full', label: 'Full' },
          { id: 'unset', label: 'Not set' },
        ] as const
      )
        .map((chip) => ({ ...chip, count: counts[chip.id] }))
        .filter((chip) => chip.id === 'all' || chip.id === filter || chip.count > 0),
    [counts, filter],
  );

  const visibleRows = filter === 'all' ? students : students.filter((row) => consentKey(row.consent) === filter);

  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title="Photo permissions"
      subtitle="Stored consent for enrolled students (from enrollment and parent updates)."
      accessibilityLabel="Close photo permissions"
      headerAside={counts.none > 0 && !loading ? <GChip label={`${counts.none} no photos`} tone="alert" /> : null}>
      <View testID="school-admin-photo-media-permissions-sheet" style={styles.body}>
        {loading ? (
          <AdminRowSkeleton count={6} />
        ) : error ? (
          <GInlineBanner
            tone="error"
            title="Couldn't load photo permissions"
            description={error}
            action={<GLink label="Try again" icon="refresh" onPress={() => void load()} />}
          />
        ) : students.length === 0 ? (
          <Text style={styles.empty}>No enrolled students yet.</Text>
        ) : (
          <>
            {counts.none > 0 ? (
              <GInlineBanner
                tone="warning"
                title={`${counts.none} student${counts.none === 1 ? ' has' : 's have'} no photo permission`}
                description="Check before sharing group photos."
              />
            ) : null}
            <AdminFilterChips accessibilityLabel="Filter by permission" items={chips} activeId={filter} onChange={setFilter} />
            {visibleRows.map((row, index) => (
              <AdminWorkRow
                key={row.studentId}
                divider={index > 0}
                title={`${row.firstName} ${row.lastName}`.trim()}
                meta={`${row.programLabel} · Updated ${formatUpdatedAt(row.updatedAt)}`}
                trailing={<GChip label={row.consentLabel} tone={consentTone(row.consent)} />}
              />
            ))}
          </>
        )}
      </View>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: 12 },
  empty: { fontFamily: GardenFonts.bodySemi, fontSize: 14, color: Garden.soft, paddingVertical: 12 },
});
