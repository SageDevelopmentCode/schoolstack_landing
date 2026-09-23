import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { COMMITTEE_RESOURCE_TYPE_LABELS } from '@/lib/parent/committees/constants';
import type { CommitteeResource, CommitteeResourceType } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeResourceRowProps = {
  resource: CommitteeResource;
  onPress: () => void;
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

function resourceSubtitle(resource: CommitteeResource): string | null {
  if (resource.fileName) return resource.fileName;
  if (resource.url) return 'External link';
  if (resource.storagePath) return 'Uploaded file';
  return null;
}

export function ParentCommitteeResourceRow({ resource, onPress }: ParentCommitteeResourceRowProps) {
  const theme = useParentTheme();
  const subtitle = resourceSubtitle(resource);
  const isOpenable = Boolean(resource.url || resource.storagePath);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!isOpenable}
      onPress={onPress}
      style={({ pressed }) => [pressed && isOpenable && { opacity: 0.85 }]}>
      <StoryCard compact style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name={resourceIcon(resource.type)} size={18} color={theme.primary} />
          </View>
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.ink }]} numberOfLines={2}>
                {resource.title}
              </Text>
              <StoryChip tone="info" label={COMMITTEE_RESOURCE_TYPE_LABELS[resource.type]} />
            </View>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: theme.muted }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            {resource.description ? (
              <Text style={[styles.description, { color: theme.muted }]} numberOfLines={2}>
                {resource.description}
              </Text>
            ) : null}
          </View>
          <Ionicons
            name={isOpenable ? 'chevron-forward' : 'lock-closed-outline'}
            size={16}
            color={theme.muted}
          />
        </View>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
