import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import {
  ChildThumb,
  GCard,
  GChip,
  GLink,
  GOutlineButton,
  GPressable,
  GProgress,
  GRing,
  GTick,
} from '@/components/parent/garden/ui';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import type { HomeLabCtx } from '@/components/parent/home-lab/types';
import { resolveWebUrl, schoolApplyUrl } from '@/lib/admissions/school-apply-url';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { programPortalChildrenEmptyMessage } from '@/lib/parent/parent-children-utils';
import type { FamilyChildOverview, ParentFormHomeSnapshot } from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/* ------------------------------------------------------------------ */
/* Children                                                            */
/* ------------------------------------------------------------------ */

function ChildMiniCard({
  ctx,
  child,
  index,
  width,
}: {
  ctx: HomeLabCtx;
  child: FamilyChildOverview;
  index: number;
  width?: number;
}) {
  const firstName = child.studentName.split(' ')[0] ?? child.studentName;
  const progress = child.checklistProgress;
  const showEnrollmentLink = child.isEnrolled || child.status === 'enrolling';
  const progressDone = progress ? progress.completed >= progress.total && progress.total > 0 : false;

  return (
    <View style={[styles.child, width ? { width } : null]}>
      <View style={styles.childTop}>
        <ChildThumb
          name={child.studentName}
          photoUrl={child.profilePhotoUrl}
          size={64}
          tilt={index % 2 === 0 ? -3 : 3}
          index={index}
        />
        <View style={styles.childCopy}>
          <Text style={styles.childName} numberOfLines={1}>
            {firstName}
          </Text>
          <GChip label={`● ${child.statusLabel}`} tone={child.isEnrolled ? 'success' : 'info'} />
          <Text style={styles.childMeta}>
            {child.grade ? `Grade ${child.grade}` : 'Grade not listed'}
          </Text>
        </View>
      </View>
      {progress && progress.total > 0 ? (
        <View style={styles.checklist}>
          <View style={styles.checklistRow}>
            <Text style={styles.checklistLabel}>Enrollment checklist</Text>
            <Text style={[styles.checklistCount, progressDone && { color: Garden.forest }]}>
              {progress.completed} of {progress.total} complete
            </Text>
          </View>
          <GProgress
            value={progress.completed / progress.total}
            done={progressDone}
            label={`${firstName}'s enrollment checklist, ${progress.completed} of ${progress.total} complete`}
          />
        </View>
      ) : null}
      <View style={styles.childActions}>
        <GOutlineButton
          label={`See ${firstName}'s details`}
          icon="arrow-forward"
          onPress={() => {
            if (ctx.feedback.readOnly) {
              ctx.feedback.notifyReadOnly();
              return;
            }
            ctx.props.onOpenChildDetails(child.applicationId);
          }}
        />
        {showEnrollmentLink ? (
          <GLink
            label="Enrollment checklist"
            onPress={() => ctx.props.onOpenEnrollment(child.applicationId)}
          />
        ) : null}
      </View>
    </View>
  );
}

function ChildrenEmpty({ ctx }: { ctx: HomeLabCtx }) {
  const accent = useGardenAccent();
  const { reportError } = useMobileErrorReporter(ctx.props.data.organizationId);
  const { programPortalLabel, slug } = ctx.props;

  if (programPortalLabel) {
    return <Text style={styles.empty}>{programPortalChildrenEmptyMessage(programPortalLabel)}</Text>;
  }

  return (
    <Text style={styles.empty}>
      We don&apos;t have any student records from your applications yet. Visit your{' '}
      <Text
        accessibilityRole="link"
        style={[styles.emptyLink, { color: accent.clayDeep }]}
        onPress={() =>
          void openExternalUrlSafely(resolveWebUrl(schoolApplyUrl(slug)), reportError, {
            operation: 'parent_home_open_web_url',
            metadata: { href: schoolApplyUrl(slug) },
          })
        }>
        application dashboard
      </Text>{' '}
      to get started.
    </Text>
  );
}

/** Polaroid mini-cards. `carousel` swipes horizontally when there are 2+ children. */
export function ChildrenSection({
  ctx,
  index = 3,
  carousel = false,
  onLayout,
}: {
  ctx: HomeLabCtx;
  index?: number;
  carousel?: boolean;
  onLayout?: (y: number) => void;
}) {
  const { width } = useWindowDimensions();
  const children = ctx.props.data.familyChildren;
  const cardWidth = Math.min(320, width - 32 - 36 - 28);

  return (
    <GCard
      index={index}
      kicker="Your family"
      title="Your children"
      onLayout={onLayout}
      testID="home-lab-children">
      {children.length === 0 ? (
        <ChildrenEmpty ctx={ctx} />
      ) : carousel && children.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 12}
          decelerationRate="fast"
          style={styles.carouselBleed}
          contentContainerStyle={styles.carousel}>
          {children.map((child, i) => (
            <ChildMiniCard
              key={child.applicationId}
              ctx={ctx}
              child={child}
              index={i}
              width={cardWidth}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.stack}>
          {children.map((child, i) => (
            <ChildMiniCard key={child.applicationId} ctx={ctx} child={child} index={i} />
          ))}
        </View>
      )}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Forms                                                               */
/* ------------------------------------------------------------------ */

function formatDay(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formMeta(item: ParentFormHomeSnapshot['items'][number]): string {
  const names = item.studentNames.join(', ');
  let status = '';
  if (item.listStatus === 'signed') {
    status = item.signedAt
      ? `Signed ${new Date(item.signedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`
      : 'Signed';
  } else if (item.responseStatus === 'overdue') {
    status = item.dueDate ? `Overdue · was due ${formatDay(item.dueDate)}` : 'Overdue';
  } else {
    status = item.dueDate ? `Due ${formatDay(item.dueDate)}` : 'Needs action';
  }
  return names ? `${names} · ${status}` : status;
}

/** Notebook list: tick (signed) / empty ring (to do), title + meta, chevron. */
export function FormsNotebookList({
  snapshot,
  onOpenForm,
  max = 5,
}: {
  snapshot: ParentFormHomeSnapshot;
  onOpenForm: (formId: string) => void;
  max?: number;
}) {
  const items = snapshot.items.slice(0, max);
  if (items.length === 0) {
    return <Text style={styles.empty}>No forms right now.</Text>;
  }
  return (
    <View style={styles.notebook}>
      {items.map((item, i) => {
        const signed = item.listStatus === 'signed';
        const overdue = !signed && item.responseStatus === 'overdue';
        const meta = formMeta(item);
        return (
          <GPressable
            key={item.formId}
            accessibilityLabel={`${item.formTitle}. ${meta}`}
            pressedScale={0.99}
            onPress={() => onOpenForm(item.formId)}
            style={[styles.formRow, i > 0 && styles.formRowLine]}>
            {signed ? <GTick /> : <GRing />}
            <View style={styles.formCopy}>
              <Text style={styles.formTitle} numberOfLines={2}>
                {item.formTitle}
              </Text>
              <Text
                style={[styles.formMeta, overdue && { color: '#7E4533' }]}
                numberOfLines={1}>
                {meta}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
          </GPressable>
        );
      })}
    </View>
  );
}

export function FormsCounts({ snapshot }: { snapshot: ParentFormHomeSnapshot }) {
  return (
    <View style={styles.counts}>
      <GChip label={`Needs action · ${snapshot.counts.needsAction}`} tone="warning" />
      <GChip label={`Signed · ${snapshot.counts.signed}`} tone="success" />
    </View>
  );
}

export function FormsNotebookSection({
  ctx,
  index = 4,
  onLayout,
}: {
  ctx: HomeLabCtx;
  index?: number;
  onLayout?: (y: number) => void;
}) {
  const snapshot = ctx.props.data.formSnapshot;
  if (!snapshot) return null;
  return (
    <GCard
      index={index}
      kicker="Forms & documents"
      title="Your family's forms"
      onLayout={onLayout}
      testID="home-lab-forms"
      action={<GLink label="View all" onPress={ctx.props.onViewAllForms} accessibilityLabel="View all forms" />}>
      <View style={styles.formsBody}>
        <FormsCounts snapshot={snapshot} />
        <FormsNotebookList snapshot={snapshot} onOpenForm={ctx.props.onOpenForm} />
      </View>
    </GCard>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  carouselBleed: {
    marginHorizontal: -18,
  },
  carousel: {
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  child: {
    backgroundColor: Garden.paper,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    padding: 16,
    gap: 14,
  },
  childTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  childCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  childName: {
    fontFamily: GardenFonts.display,
    fontSize: 21,
    letterSpacing: -0.5,
    color: Garden.ink,
  },
  childMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.soft,
  },
  checklist: {
    gap: 6,
  },
  checklistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  checklistLabel: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: Garden.ink,
  },
  checklistCount: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: Garden.soft,
  },
  childActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
  },
  empty: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 21,
    color: Garden.soft,
  },
  emptyLink: {
    fontFamily: GardenFonts.bodyExtra,
    textDecorationLine: 'underline',
  },
  formsBody: {
    gap: 12,
  },
  counts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  notebook: {
    backgroundColor: Garden.notebook,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  formRowLine: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,74,60,0.1)',
  },
  formCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  formTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  formMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    color: Garden.soft,
  },
});
