import { Text, StyleSheet } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { ParentCommitteeResourceViewer } from '@/components/parent/committees/parent-committee-resource-viewer';
import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { COMMITTEE_RESOURCE_TYPE_LABELS } from '@/lib/parent/committees/constants';
import type { CommitteeResource } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { SupabaseClient } from '@supabase/supabase-js';

type ParentCommitteeResourceDetailSheetProps = {
  visible: boolean;
  resource: CommitteeResource | null;
  supabase: SupabaseClient;
  onClose: () => void;
};

export function ParentCommitteeResourceDetailSheet({
  visible,
  resource,
  supabase,
  onClose,
}: ParentCommitteeResourceDetailSheetProps) {
  const theme = useParentTheme();

  if (!resource) return null;

  const isOpenable = Boolean(resource.url || resource.storagePath);

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={resource.title}
      subtitle={COMMITTEE_RESOURCE_TYPE_LABELS[resource.type]}>
      {resource.description ? (
        <Text style={[styles.description, { color: theme.muted }]}>{resource.description}</Text>
      ) : null}
      {resource.fileName ? (
        <Text style={[styles.meta, { color: theme.muted }]}>File: {resource.fileName}</Text>
      ) : null}
      <StoryChip tone="info" label={COMMITTEE_RESOURCE_TYPE_LABELS[resource.type]} />
      {isOpenable ? (
        <ParentCommitteeResourceViewer supabase={supabase} resource={resource} />
      ) : (
        <Text style={[styles.unavailable, { color: theme.muted }]}>
          This resource is not available to open yet.
        </Text>
      )}
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.two,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    marginBottom: Spacing.two,
  },
  unavailable: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    marginTop: Spacing.three,
  },
});
