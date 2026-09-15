import { StyleSheet, View } from 'react-native';

import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { DetailRowListSkeleton } from '@/components/school-admin/submission-detail-skeleton';
import { Spacing } from '@/constants/theme';

export function StudentHealthTabSkeleton() {
  return (
    <View style={styles.container}>
      <StoryDetailSection title="Allergies" description="Loading health profile…">
        <DetailRowListSkeleton rowCount={2} />
      </StoryDetailSection>
      <StoryDetailSection title="Medications" description="Loading health profile…">
        <DetailRowListSkeleton rowCount={2} />
      </StoryDetailSection>
      <StoryDetailSection title="Health updates" description="Loading health profile…">
        <DetailRowListSkeleton rowCount={2} />
      </StoryDetailSection>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
});
