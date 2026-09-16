import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { ParentFormHomeSnapshot } from '@/lib/parent/parent-portal-api';

type ParentHomeFormsSnapshotCardProps = {
  snapshot: ParentFormHomeSnapshot;
  onOpenForm: (formsHref: string) => void;
  onViewAll: () => void;
};

function formatFormDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split('-').map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSignedDate(signedAt: string): string {
  return new Date(signedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusPresentation(item: ParentFormHomeSnapshot['items'][number]) {
  if (item.listStatus === 'signed') {
    return { tone: 'success' as const, label: 'Signed' };
  }
  if (item.responseStatus === 'overdue') {
    return { tone: 'alert' as const, label: 'Overdue' };
  }
  return { tone: 'warning' as const, label: 'Needs action' };
}

export function ParentHomeFormsSnapshotCard({
  snapshot,
  onOpenForm,
  onViewAll,
}: ParentHomeFormsSnapshotCardProps) {
  const theme = useParentTheme();

  return (
    <StoryCard style={styles.card}>
      <StorySectionKicker>Forms &amp; documents</StorySectionKicker>
      <StoryDisplayHeading size="section" style={styles.heading}>
        Your family&apos;s forms
      </StoryDisplayHeading>

      <View style={styles.chipRow}>
        {snapshot.counts.needsAction > 0 ? (
          <StoryChip tone="warning" label={`Needs action · ${snapshot.counts.needsAction}`} />
        ) : null}
        {snapshot.counts.signed > 0 ? (
          <StoryChip tone="success" label={`Signed · ${snapshot.counts.signed}`} />
        ) : null}
      </View>

      <View style={styles.rows}>
        {snapshot.items.map((item) => {
          const status = getStatusPresentation(item);

          return (
            <Pressable
              key={item.formId}
              onPress={() => onOpenForm(item.formsHref)}
              style={({ pressed }) => [styles.rowPressable, pressed && styles.rowPressed]}>
              <StoryCard style={styles.rowCard}>
                <View style={styles.rowContent}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="document-text-outline" size={18} color="#475569" />
                  </View>
                  <View style={styles.rowBody}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.rowTitle, { color: theme.ink }]} numberOfLines={2}>
                        {item.formTitle}
                      </Text>
                      <StoryChip tone={status.tone} label={status.label} />
                    </View>
                    {item.studentNames.length > 0 ? (
                      <Text style={[styles.rowMeta, { color: theme.muted }]} numberOfLines={2}>
                        {item.studentNames.join(', ')}
                      </Text>
                    ) : null}
                    {item.listStatus === 'signed' && item.signedAt ? (
                      <Text style={[styles.rowMeta, { color: theme.muted }]}>
                        Signed on {formatSignedDate(item.signedAt)}
                      </Text>
                    ) : item.dueDate ? (
                      <Text style={[styles.rowMeta, { color: theme.muted }]}>
                        Due {formatFormDueDate(item.dueDate)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </StoryCard>
            </Pressable>
          );
        })}
      </View>

      <StoryTextLink label="View all forms" onPress={onViewAll} style={styles.viewAllLink} />
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  heading: {
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  rows: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  rowPressable: {
    borderRadius: 14,
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowCard: {
    padding: 12,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowTitle: {
    flexShrink: 1,
    fontFamily: StoryFonts.display,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  rowMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  viewAllLink: {
    marginTop: Spacing.three,
    paddingVertical: 0,
  },
});
