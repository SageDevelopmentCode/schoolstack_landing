import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ParentCommitteeResourceDetailSheet } from '@/components/parent/committees/parent-committee-resource-detail-sheet';
import { ParentCommitteeResourceRow } from '@/components/parent/committees/parent-committee-resource-row';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import type { CommitteeResource } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export function ParentCommitteeResourcesSection({
  committee,
  supabase,
}: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const [selectedResource, setSelectedResource] = useState<CommitteeResource | null>(null);

  if (committee.resources.length === 0) {
    return (
      <StoryDetailSection title="Resources">
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>No resources yet.</Text>
      </StoryDetailSection>
    );
  }

  return (
    <>
      <StoryDetailSection title="Resources">
        <View style={styles.list}>
          {committee.resources.map((resource) => (
            <ParentCommitteeResourceRow
              key={resource.id}
              resource={resource}
              onPress={() => setSelectedResource(resource)}
            />
          ))}
        </View>
      </StoryDetailSection>

      <ParentCommitteeResourceDetailSheet
        visible={Boolean(selectedResource)}
        resource={selectedResource}
        supabase={supabase}
        onClose={() => setSelectedResource(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
});
