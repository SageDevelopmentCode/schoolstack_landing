import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ParentDocumentationGuideSheet } from '@/components/parent/home/parent-documentation-guide-sheet';
import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentDocGuide } from '@/lib/parent/parent-portal-api';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

function groupGuidesByCategory(guides: ParentDocGuide[]) {
  const map = new Map<string, ParentDocGuide[]>();
  for (const guide of guides) {
    const list = map.get(guide.category) ?? [];
    list.push(guide);
    map.set(guide.category, list);
  }
  return [...map.entries()].map(([category, categoryGuides]) => ({
    category,
    guides: categoryGuides,
  }));
}

type ParentHomeHowToGuidesCardProps = {
  guides: ParentDocGuide[];
  onStepAction: (href: string) => void;
};

export function ParentHomeHowToGuidesCard({ guides, onStepAction }: ParentHomeHowToGuidesCardProps) {
  const theme = useParentTheme();
  const grouped = useMemo(() => groupGuidesByCategory(guides), [guides]);
  const [activeGuide, setActiveGuide] = useState<ParentDocGuide | null>(null);

  if (guides.length === 0) {
    return null;
  }

  return (
    <>
      <StoryCard style={styles.card}>
        <StorySectionKicker>How-to guides</StorySectionKicker>
        <Text style={[styles.heading, { color: theme.ink }]}>Step-by-step help</Text>

        {grouped.map((group) => (
          <View key={group.category} style={styles.categoryBlock}>
            <Text style={[styles.category, { color: theme.muted }]}>{group.category}</Text>
            {group.guides.map((guide, index) => (
              <Pressable
                key={guide.id}
                accessibilityRole="button"
                onPress={() => setActiveGuide(guide)}
                style={({ pressed }) => [
                  styles.guideRow,
                  index > 0 && styles.guideRowBorder,
                  pressed && { opacity: 0.85 },
                ]}>
                <View style={styles.guideCopy}>
                  <Text style={[styles.guideTitle, { color: theme.ink }]}>{guide.title}</Text>
                  <Text style={[styles.guideSummary, { color: theme.muted }]} numberOfLines={2}>
                    {guide.summary}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: theme.primary }]}>›</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </StoryCard>

      <ParentDocumentationGuideSheet
        visible={Boolean(activeGuide)}
        guide={activeGuide}
        onClose={() => setActiveGuide(null)}
        onStepAction={onStepAction}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  heading: {
    fontFamily: StoryFonts.display,
    fontSize: 19,
    fontWeight: '600',
  },
  categoryBlock: {
    gap: 0,
  },
  category: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.one,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  guideRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7ECE7',
  },
  guideCopy: {
    flex: 1,
    gap: 2,
  },
  guideTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  guideSummary: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  chevron: {
    fontSize: 22,
    lineHeight: 24,
  },
});
