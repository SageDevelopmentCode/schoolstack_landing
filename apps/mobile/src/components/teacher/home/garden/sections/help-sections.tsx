import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GChip, GKicker, GNoteTile, GPressable } from '@/components/parent/garden/ui';
import { TeacherPortalMudKitchenSupportMessagesCard } from '@/components/teacher/home/teacher-portal-mudkitchen-support-messages-card';
import type { TeacherDocGuide } from '@/lib/teacher/teacher-portal-api';

function groupGuides(guides: TeacherDocGuide[]) {
  const map = new Map<string, TeacherDocGuide[]>();
  for (const guide of guides) {
    const list = map.get(guide.category) ?? [];
    list.push(guide);
    map.set(guide.category, list);
  }
  return [...map.entries()].map(([category, list]) => ({ category, guides: list }));
}

/** Index of help: category groups of guide rows with a step-count chip; each opens the guide sheet. */
export function GuidesCard({
  guides,
  onOpenGuide,
  index = 0,
}: {
  guides: TeacherDocGuide[];
  onOpenGuide: (guide: TeacherDocGuide) => void;
  index?: number;
}) {
  const grouped = useMemo(() => groupGuides(guides), [guides]);
  if (guides.length === 0) return null;

  return (
    <GCard title="Step-by-step help" index={index} testID="teacher-home-guides">
      <View style={styles.groups}>
        {grouped.map((group) => (
          <View key={group.category}>
            <GKicker style={styles.category}>{group.category}</GKicker>
            {group.guides.map((guide, i) => (
              <GPressable
                key={guide.id}
                accessibilityLabel={`${guide.title}. ${guide.steps.length} steps`}
                accessibilityHint="Opens the step-by-step guide"
                pressedScale={0.99}
                onPress={() => onOpenGuide(guide)}
                style={[styles.row, i > 0 && styles.rowLine]}>
                <View style={styles.copy}>
                  <Text style={styles.title}>{guide.title}</Text>
                  <Text style={styles.summary} numberOfLines={2}>
                    {guide.summary}
                  </Text>
                </View>
                <GChip
                  label={`${guide.steps.length} step${guide.steps.length === 1 ? '' : 's'}`}
                  tone="info"
                />
                <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
              </GPressable>
            ))}
          </View>
        ))}
      </View>
    </GCard>
  );
}

/** Support: the MudKitchen support thread (legacy island) and the help request form. */
export function SupportCard({
  slug,
  messagesEnabled,
  onRequestHelp,
  index = 0,
}: {
  slug: string;
  messagesEnabled: boolean;
  onRequestHelp: () => void;
  index?: number;
}) {
  return (
    <GCard title="Need help?" tone="paper" index={index} testID="teacher-home-need-help">
      <View style={styles.stack}>
        <TeacherPortalMudKitchenSupportMessagesCard slug={slug} messagesEnabled={messagesEnabled} />
        <GNoteTile
          tint={Garden.lav}
          icon="help-buoy-outline"
          title="Get help"
          subtitle="Tell us what's going on and attach screenshots if helpful."
          accessibilityLabel="Need help? Tell us what's going on and attach screenshots if helpful."
          accessibilityHint="Opens a help request form"
          onPress={onRequestHelp}
        />
      </View>
    </GCard>
  );
}

const styles = StyleSheet.create({
  groups: { gap: 16 },
  category: { marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingVertical: 10,
  },
  rowLine: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, lineHeight: 20, color: Garden.ink },
  summary: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  stack: { gap: 12 },
});
