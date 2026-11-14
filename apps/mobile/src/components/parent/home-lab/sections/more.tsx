import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ParentDocumentationGuideSheet } from '@/components/parent/home/parent-documentation-guide-sheet';
import { ParentHomeCoopFamiliesCard } from '@/components/parent/home/parent-home-coop-families-card';
import { ParentHomeFridayBranchCard } from '@/components/parent/home/parent-home-friday-branch-card';
import { ParentPortalMudKitchenSupportMessagesCard } from '@/components/parent/home/parent-portal-mudkitchen-support-messages-card';
import { GCard, GNoteTile, GPressable } from '@/components/parent/garden/ui';
import { Garden, GardenFonts, NOTE_TINTS, useGardenAccent } from '@/components/parent/garden/tokens';
import type { HomeLabCtx } from '@/components/parent/home-lab/types';
import type { ParentDocGuide } from '@/lib/parent/parent-portal-api';

/* ------------------------------------------------------------------ */
/* What's new                                                          */
/* ------------------------------------------------------------------ */

export function WhatsNewSection({ ctx, index = 5 }: { ctx: HomeLabCtx; index?: number }) {
  const accent = useGardenAccent();
  const announcements = ctx.props.featureAnnouncements ?? [];
  if (announcements.length === 0) return null;
  return (
    <GCard index={index} kicker="What's new" title="New features for you">
      <View style={styles.stack}>
        {announcements.map((announcement, i) => (
          <GNoteTile
            key={announcement.id}
            tape={false}
            tint={NOTE_TINTS[(i + 1) % NOTE_TINTS.length]}
            title={announcement.title}
            subtitle={announcement.description}
            subtitleLines={3}
            accessibilityLabel={`${announcement.title}. ${announcement.ctaLabel}`}
            onPress={() => ctx.props.onFeatureAnnouncement(announcement)}
            trailing={<View />}>
            <Text style={[styles.cta, { color: accent.clayDeep }]}>{announcement.ctaLabel} →</Text>
          </GNoteTile>
        ))}
      </View>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* How-to guides                                                       */
/* ------------------------------------------------------------------ */

function groupGuides(guides: ParentDocGuide[]) {
  const map = new Map<string, ParentDocGuide[]>();
  for (const guide of guides) {
    const list = map.get(guide.category) ?? [];
    list.push(guide);
    map.set(guide.category, list);
  }
  return [...map.entries()].map(([category, list]) => ({ category, guides: list }));
}

/** Index of help: category groups of rows that open the existing guide sheet. */
export function GuidesSection({
  ctx,
  index = 6,
  onLayout,
}: {
  ctx: HomeLabCtx;
  index?: number;
  onLayout?: (y: number) => void;
}) {
  const guides = useMemo(() => ctx.props.documentationGuides ?? [], [ctx.props.documentationGuides]);
  const grouped = useMemo(() => groupGuides(guides), [guides]);
  const [activeGuide, setActiveGuide] = useState<ParentDocGuide | null>(null);

  if (guides.length === 0) return null;

  return (
    <>
      <GCard index={index} kicker="How-to guides" title="Step-by-step help" onLayout={onLayout}>
        <View style={styles.guides}>
          {grouped.map((group) => (
            <View key={group.category} style={styles.group}>
              <Text style={styles.category}>{group.category}</Text>
              {group.guides.map((guide, i) => (
                <GPressable
                  key={guide.id}
                  accessibilityLabel={`${guide.title}. ${guide.steps.length} steps`}
                  accessibilityHint="Opens the step-by-step guide"
                  pressedScale={0.99}
                  onPress={() => setActiveGuide(guide)}
                  style={[styles.guideRow, i > 0 && styles.guideRowLine]}>
                  <View style={styles.guideCopy}>
                    <Text style={styles.guideTitle}>{guide.title}</Text>
                    <Text style={styles.guideSummary} numberOfLines={2}>
                      {guide.summary}
                    </Text>
                  </View>
                  <View style={styles.stepCount}>
                    <Text style={styles.stepCountText}>{guide.steps.length} steps</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
                </GPressable>
              ))}
            </View>
          ))}
        </View>
      </GCard>
      <ParentDocumentationGuideSheet
        visible={activeGuide !== null}
        guide={activeGuide}
        onClose={() => setActiveGuide(null)}
        onStepAction={ctx.props.onDocumentationStep}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Help                                                                */
/* ------------------------------------------------------------------ */

export function HelpSection({ ctx, index = 7 }: { ctx: HomeLabCtx; index?: number }) {
  return (
    <GCard index={index} kicker="Need help">
      <View style={styles.stack}>
        <ParentPortalMudKitchenSupportMessagesCard
          slug={ctx.props.slug}
          messagesEnabled={ctx.model.messagesEnabled}
        />
        <GNoteTile
          tint={Garden.lav}
          icon="help-buoy-outline"
          title="Need help?"
          subtitle="Tell us what's going on and attach screenshots if helpful."
          accessibilityHint="Opens a help request form"
          onPress={() => ctx.model.setSupportSheetOpen(true)}
        />
      </View>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Program islands (unmigrated, reused as-is)                          */
/* ------------------------------------------------------------------ */

export function FridayBranchIsland({ ctx }: { ctx: HomeLabCtx }) {
  const { props, model } = ctx;
  if (!model.fridayBranchEnabled || !props.data.fridayBranchHome) return null;
  return (
    <ParentHomeFridayBranchCard
      slug={props.slug}
      programSlug={props.programSlug}
      organizationId={props.data.organizationId}
      initialBundle={props.data.fridayBranchHome}
    />
  );
}

export function CoopFamiliesIsland({ ctx }: { ctx: HomeLabCtx }) {
  const { props, model } = ctx;
  if (!props.coopModeEnabled || !props.programPortalLabel || !props.programId) return null;
  return (
    <ParentHomeCoopFamiliesCard
      programLabel={props.programPortalLabel}
      families={props.coopFamilies ?? []}
      organizationId={props.data.organizationId}
      programId={props.programId}
      messagesEnabled={model.messagesEnabled}
      onOpenThread={props.onCoopMessageThread}
    />
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  cta: {
    marginTop: 10,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
  },
  guides: {
    gap: 16,
  },
  group: {
    gap: 2,
  },
  category: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: Garden.soft,
    marginBottom: 4,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    minHeight: 52,
  },
  guideRowLine: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Garden.ink15,
  },
  guideCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  guideTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    lineHeight: 19,
    color: Garden.ink,
  },
  guideSummary: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    lineHeight: 17,
    color: Garden.soft,
  },
  stepCount: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Garden.ink06,
  },
  stepCountText: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 11,
    color: Garden.soft,
  },
});
