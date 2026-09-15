import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { Committee, CommitteeResourceType } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeResourcesSectionProps = {
  committee: Committee;
};

function resourceIcon(type: CommitteeResourceType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'pdf':
      return 'document-outline';
    case 'doc':
      return 'document-text-outline';
    case 'link':
      return 'link-outline';
    case 'checklist':
      return 'list-outline';
    default:
      return 'document-outline';
  }
}

export function ParentCommitteeResourcesSection({ committee }: ParentCommitteeResourcesSectionProps) {
  const theme = useParentTheme();

  if (committee.resources.length === 0) {
    return (
      <StoryDetailSection title="Resources">
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>No resources yet.</Text>
      </StoryDetailSection>
    );
  }

  return (
    <StoryDetailSection title="Resources">
      <View style={styles.list}>
        {committee.resources.map((resource) => (
          <Pressable
            key={resource.id}
            accessibilityRole="button"
            disabled={!resource.url}
            onPress={() => {
              if (resource.url) {
                void Linking.openURL(resource.url);
              }
            }}
            style={({ pressed }) => [pressed && resource.url && { opacity: 0.85 }]}>
            <StoryCard compact style={styles.card}>
              <View style={styles.row}>
                <Ionicons name={resourceIcon(resource.type)} size={18} color={theme.primary} />
                <View style={styles.copy}>
                  <Text style={[styles.title, { color: theme.ink }]}>{resource.title}</Text>
                  {resource.description ? (
                    <Text style={[styles.description, { color: theme.muted }]} numberOfLines={2}>
                      {resource.description}
                    </Text>
                  ) : null}
                </View>
                {resource.url ? (
                  <Ionicons name="open-outline" size={16} color={theme.muted} />
                ) : null}
              </View>
            </StoryCard>
          </Pressable>
        ))}
      </View>
    </StoryDetailSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  card: {
    padding: StoryCardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
});
