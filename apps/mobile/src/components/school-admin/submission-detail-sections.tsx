import { StyleSheet, Text, View } from 'react-native';

import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { DetailRowListSkeleton } from '@/components/school-admin/submission-detail-skeleton';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import type { FamilyGuardianRecord } from '@/lib/admissions/family-guardians';

/**
 * Story guardians list, still used by `StudentDetailWorkspace` (the student
 * profile sheet on the Classrooms and Staff screens). The Admissions and
 * Students screens use the Garden `GuardiansCard` instead.
 */
export function SubmissionGuardiansSection({
  guardians,
  loading,
}: {
  guardians: FamilyGuardianRecord[];
  loading: boolean;
}) {
  const theme = useParentTheme();

  if (loading) {
    return (
      <StoryDetailSection title="Guardians" description="Family contacts for this application.">
        <DetailRowListSkeleton rowCount={2} />
      </StoryDetailSection>
    );
  }

  if (guardians.length === 0) {
    return (
      <StoryDetailSection title="Guardians" description="No linked family contacts yet.">
        <Text style={[styles.bodyText, { color: theme.muted }]}>
          This application is not linked to a family record.
        </Text>
      </StoryDetailSection>
    );
  }

  return (
    <StoryDetailSection title="Guardians" description="Family contacts for this application.">
      {guardians.map((guardian) => {
        const name = [guardian.firstName, guardian.lastName].filter(Boolean).join(' ') || 'Unnamed';
        return (
          <View key={guardian.id} style={styles.guardianRow}>
            <Text style={[styles.bodyTextBold, { color: theme.ink }]}>
              {name}
              {guardian.isPrimary ? ' · Primary' : ''}
            </Text>
            {guardian.email ? (
              <Text style={[styles.bodyText, { color: theme.muted }]}>{guardian.email}</Text>
            ) : null}
          </View>
        );
      })}
    </StoryDetailSection>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyTextBold: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  guardianRow: {
    gap: 4,
  },
});
