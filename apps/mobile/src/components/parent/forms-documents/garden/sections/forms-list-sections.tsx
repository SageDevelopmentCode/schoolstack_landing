import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  OVERDUE_INK,
  formDateLine,
  formStatusChip,
  formsCount,
  joinStudentNames,
} from '@/components/parent/forms-documents/garden/forms-garden-ui';
import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  DateStamp,
  GCard,
  GChip,
  GHand,
  GIcon,
  GLink,
  GPressable,
  GProgress,
  GRing,
  GTick,
  gText,
} from '@/components/parent/garden/ui';
import type {
  ParentFormFilterStatus,
  ParentFormListItem,
} from '@/lib/parent/parent-forms-documents-types';
import { formatFormDueDate } from '@/lib/parent/parent-forms-documents-utils';

/* ------------------------------------------------------------------ */
/* Next up                                                             */
/* ------------------------------------------------------------------ */

/** Visual "Open" pill on the accent strip (the strip itself is the button). */
function OpenPill() {
  return (
    <View style={styles.pillWrap}>
      <View style={styles.pillUnderlay} />
      <View style={styles.pillFace}>
        <Text style={styles.pillLabel}>Open</Text>
        <Ionicons name="arrow-forward" size={14} color={Garden.ink} />
      </View>
    </View>
  );
}

/** The most urgent form as a solid accent strip; caught-up / nothing-yet panels otherwise. */
export function FormsNextUpCard({
  totalCount,
  queue,
  signedCount,
  onOpen,
  onShowWaiting,
}: {
  totalCount: number;
  queue: ParentFormListItem[];
  signedCount: number;
  onOpen: (formId: string) => void;
  onShowWaiting: () => void;
}) {
  const accent = useGardenAccent();

  if (totalCount === 0) {
    return (
      <GCard title="Nothing to sign yet" index={1} testID="parent-forms-next-up-card">
        <View style={styles.paperRow}>
          <GIcon name="document-text-outline" size="sm" />
          <Text style={[gText.body, styles.flex, { color: Garden.soft }]}>
            No forms have been assigned to your family yet.
          </Text>
        </View>
        <View style={styles.hand}>
          <GHand>We&apos;ll list them here.</GHand>
        </View>
      </GCard>
    );
  }

  if (queue.length === 0) {
    return (
      <GCard title="All caught up" index={1} testID="parent-forms-next-up-card">
        <View style={styles.caughtUp} testID="parent-forms-caught-up">
          <GTick size={40} />
          <View style={styles.flex}>
            <Text style={gText.itemTitle}>Nothing waiting for your signature.</Text>
            <Text style={[gText.meta, { color: Garden.forest }]}>
              {formsCount(signedCount)} signed — open any of them below to see what you submitted.
            </Text>
          </View>
        </View>
      </GCard>
    );
  }

  const [first, ...rest] = queue;
  const overdue = first.response.status === 'overdue';
  const meta = [
    first.response.studentNames.length > 0
      ? `For ${joinStudentNames(first.response.studentNames)}`
      : null,
    formDateLine(first),
  ]
    .filter(Boolean)
    .join(' · ');
  const kicker = overdue ? 'Overdue — start here' : 'Start here';

  return (
    <GCard
      title={`${formsCount(queue.length)} waiting for you`}
      index={1}
      testID="parent-forms-next-up-card">
      <GPressable
        testID="parent-forms-next-up"
        accessibilityLabel={`${kicker}. ${first.form.title}${meta ? `. ${meta}` : ''}. Open`}
        haptic="press"
        onPress={() => onOpen(first.form.id)}
        style={[styles.strip, { backgroundColor: accent.clay }]}>
        <View style={styles.stripCopy}>
          <View style={styles.stripKickerRow}>
            <Text style={styles.stripKicker}>{kicker}</Text>
            {first.form.formCategory === 'tuition' ? <GChip label="Tuition" tone="info" /> : null}
          </View>
          <Text style={styles.stripTitle} numberOfLines={2}>
            {first.form.title}
          </Text>
          {meta ? (
            <Text style={styles.stripSubtitle} numberOfLines={2}>
              {meta}
            </Text>
          ) : null}
        </View>
        <OpenPill />
      </GPressable>
      {rest.length > 0 ? (
        <GLink
          label={`${rest.length} more waiting`}
          accessibilityLabel={`Show ${rest.length} more forms waiting`}
          onPress={onShowWaiting}
          style={styles.moreLink}
        />
      ) : null}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

export function FormsProgressCard({
  total,
  signed,
  overdueCount,
  nextDue,
  onOpen,
}: {
  total: number;
  signed: number;
  overdueCount: number;
  nextDue: ParentFormListItem | null;
  onOpen: (formId: string) => void;
}) {
  if (total === 0) return null;
  const done = signed === total;
  const remaining = total - signed;
  const dueDate = nextDue?.form.dueDate ?? null;
  const wasDue = nextDue?.response.status === 'overdue';

  return (
    <GCard
      title={done ? "Everything's signed" : `${signed} of ${total} signed`}
      index={2}
      testID="parent-forms-progress-card"
      action={
        overdueCount > 0 ? <GChip label={`${formsCount(overdueCount)} overdue`} tone="alert" /> : null
      }>
      <GProgress
        value={total > 0 ? signed / total : 0}
        label={`Forms signed, ${signed} of ${total}`}
        done={done}
      />
      <Text style={[gText.meta, styles.progressCopy]}>
        {done
          ? 'Signed forms stay here for your records.'
          : `${formsCount(remaining)} still ${remaining === 1 ? 'needs' : 'need'} your attention.`}
      </Text>

      {nextDue && dueDate ? (
        <GPressable
          testID="parent-forms-next-due"
          accessibilityLabel={`${wasDue ? 'Was due' : 'Next due'}: ${nextDue.form.title}, ${formatFormDueDate(dueDate)}. Open`}
          pressedScale={0.99}
          onPress={() => onOpen(nextDue.form.id)}
          style={styles.nextDue}>
          <DateStamp date={dueDate} />
          <View style={styles.flex}>
            <Text style={styles.nextDueKicker}>{wasDue ? 'Was due' : 'Next due'}</Text>
            <Text style={gText.itemTitle} numberOfLines={1}>
              {nextDue.form.title}
            </Text>
            <Text style={[gText.meta, wasDue && { color: OVERDUE_INK }]}>
              {formatFormDueDate(dueDate)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
        </GPressable>
      ) : null}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* All forms                                                           */
/* ------------------------------------------------------------------ */

const FILTERS: { id: ParentFormFilterStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'needs_action', label: 'Needs action' },
  { id: 'signed', label: 'Signed' },
];

const EMPTY_COPY: Record<ParentFormFilterStatus, string> = {
  all: 'No forms have been assigned to your family yet.',
  needs_action: 'Nothing needs your signature right now.',
  signed: 'No signed forms yet.',
};

function FormRow({
  item,
  first,
  onOpen,
}: {
  item: ParentFormListItem;
  first: boolean;
  onOpen: (formId: string) => void;
}) {
  const signed = item.listStatus === 'signed';
  const overdue = !signed && item.response.status === 'overdue';
  const chip = formStatusChip(item);
  const dateLine = formDateLine(item);
  const names = joinStudentNames(item.response.studentNames);
  const meta = [names || null, dateLine].filter(Boolean).join(' · ');
  const tuition = item.form.formCategory === 'tuition';

  return (
    <GPressable
      testID={`parent-form-card-${item.form.id}`}
      accessibilityLabel={`${item.form.title}. ${chip.label}${tuition ? ', tuition' : ''}${
        meta ? `. ${meta}` : ''
      }. ${signed ? 'View' : 'Review and sign'}`}
      pressedScale={0.99}
      onPress={() => onOpen(item.form.id)}
      style={[styles.row, !first && styles.rowLine]}>
      {signed ? <GTick size={26} /> : <GRing size={26} />}
      <View style={styles.rowCopy}>
        <Text style={gText.itemTitle} numberOfLines={2}>
          {item.form.title}
        </Text>
        {names ? (
          <Text style={styles.rowMeta} numberOfLines={1}>
            {names}
          </Text>
        ) : null}
        {dateLine || tuition ? (
          <View style={styles.rowFoot}>
            {dateLine ? (
              <Text
                style={[styles.rowMeta, styles.flexShrink, overdue && { color: OVERDUE_INK }]}
                numberOfLines={1}>
                {dateLine}
              </Text>
            ) : null}
            {tuition ? <GChip label="Tuition" tone="info" /> : null}
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
    </GPressable>
  );
}

export function FormsListCard({
  filter,
  onFilterChange,
  counts,
  items,
  onOpen,
}: {
  filter: ParentFormFilterStatus;
  onFilterChange: (filter: ParentFormFilterStatus) => void;
  counts: Record<ParentFormFilterStatus, number>;
  items: ParentFormListItem[];
  onOpen: (formId: string) => void;
}) {
  return (
    <GCard
      title="All forms"
      index={3}
      testID="parent-forms-list-card">
      <GSegmented
        accessibilityLabel="Filter forms"
        items={FILTERS.map(({ id, label }) => ({
          id,
          label,
          badge: counts[id],
          testID: `parent-forms-filter-${id}`,
        }))}
        activeId={filter}
        onChange={onFilterChange}
        style={styles.segmented}
      />
      {items.length === 0 ? (
        <View style={styles.paperRow}>
          <GIcon name="document-text-outline" size="sm" />
          <Text style={[gText.body, styles.flex, { color: Garden.soft }]}>{EMPTY_COPY[filter]}</Text>
        </View>
      ) : (
        <View style={styles.notebook}>
          {items.map((item, index) => (
            <FormRow key={item.form.id} item={item} first={index === 0} onOpen={onOpen} />
          ))}
        </View>
      )}
    </GCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  flexShrink: { flexShrink: 1 },
  hand: { marginTop: 10 },
  paperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: Garden.paper,
    padding: 14,
  },
  caughtUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    backgroundColor: Garden.mint,
    padding: 16,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Garden.ink,
    padding: 16,
  },
  stripCopy: { flex: 1, minWidth: 0, gap: 4 },
  stripKickerRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  stripKicker: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
  },
  stripTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 17, lineHeight: 22, color: Garden.white },
  stripSubtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
  },
  pillWrap: { paddingBottom: 3 },
  pillUnderlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 3,
    borderRadius: 999,
    backgroundColor: Garden.ink,
  },
  pillFace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
  },
  pillLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  moreLink: { alignSelf: 'flex-start', marginTop: 12, minHeight: 32 },
  progressCopy: { marginTop: 8 },
  nextDue: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.paper,
    padding: 12,
  },
  nextDueKicker: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  segmented: { marginBottom: 14 },
  notebook: {
    backgroundColor: Garden.notebook,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLine: { borderTopWidth: 1, borderTopColor: 'rgba(46,74,60,0.1)' },
  rowCopy: { flex: 1, minWidth: 0, gap: 2 },
  rowMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, lineHeight: 17, color: Garden.soft },
  rowFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
});
