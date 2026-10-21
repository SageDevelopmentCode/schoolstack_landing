import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ParentCommitteeResourceDetailSheet } from '@/components/parent/committees/parent-committee-resource-detail-sheet';
import { ParentCommitteeResourceRow } from '@/components/parent/committees/parent-committee-resource-row';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { canAccessCommitteeResource } from '@/lib/committees/permissions';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import type { CommitteeResource } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export function ParentCommitteeResourcesSection({
  committee,
  supabase,
  currentMemberId,
  isAdmin = false,
}: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const [selectedResource, setSelectedResource] = useState<CommitteeResource | null>(null);

  const visibleResources = useMemo(() => {
    if (isAdmin) return committee.resources;
    return committee.resources.filter((resource) =>
      canAccessCommitteeResource(resource, currentMemberId, committee, false),
    );
  }, [committee, currentMemberId, isAdmin]);

  if (visibleResources.length === 0) {
    const roleLimited = !isAdmin && committee.resources.length > 0;
    return (
      <StoryDetailSection title="Resources">
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>
          {roleLimited
            ? 'No resources shared with your committee role yet. Ask a committee lead if you need access.'
            : 'No resources yet.'}
        </Text>
      </StoryDetailSection>
    );
  }

  return (
    <>
      <StoryDetailSection title="Resources">
        <View style={styles.list}>
          {visibleResources.map((resource) => (
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
