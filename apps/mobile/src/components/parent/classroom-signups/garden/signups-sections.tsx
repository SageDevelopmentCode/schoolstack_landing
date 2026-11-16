import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GAccentStrip } from '@/components/parent/garden/accent-strip';
import {
  listStatusChip,
  pluralSignups,
  SIGNUP_FILTERS,
  SIGNUP_TYPE_ICON,
  signupDeadlineLabel,
  signupFromLine,
  type UpcomingHelp,
} from '@/components/parent/classroom-signups/garden/signups-garden-ui';
import type {
  ParentClassroomSignupsModel,
  SignupGroup,
} from '@/components/parent/classroom-signups/garden/use-parent-classroom-signups-model';
import { GSegmented } from '@/components/parent/garden/segmented';
import { GStepList, type GStep } from '@/components/parent/garden/steps';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  DateStamp,
  GCard,
  GChip,
  GDashedRule,
  GHand,
  GLink,
  GPressable,
  GTick,
  gText,
} from '@/components/parent/garden/ui';
import {
  SIGNUP_TYPE_LABELS,
  type ParentClassroomSignupListItem,
  type ParentClassroomSignupsFilter,
} from '@/lib/parent/parent-classroom-signups-types';

/* ------------------------------------------------------------------ */
/* Next up                                                             */
/* ------------------------------------------------------------------ */

/** The first open request as an accent strip, or a calm caught-up panel. */
export function SignupsNextUpCard({
  model,
  hasAny,
  onOpen,
  readOnly,
}: {
  model: ParentClassroomSignupsModel;
  hasAny: boolean;
  onOpen: (signupId: string) => void;
  readOnly: boolean;
}) {
  const waiting = model.needsResponse;
  const first = waiting[0];

  if (!first) {
    return (
      <GCard index={1} title="You're all caught up" testID="parent-signups-next-up">
        <View style={styles.caughtUp}>
          <GTick size={28} />
          <Text style={[gText.body, styles.flex]}>
            {hasAny
              ? 'No open signups need a response right now. New requests from teachers will show up here.'
              : 'When a teacher posts a volunteer request for your family, it will show up here.'}
          </Text>
        </View>
        {!hasAny ? (
          <View style={styles.hand}>
            <GHand>Nothing to do yet — enjoy the quiet.</GHand>
          </View>
        ) : null}
      </GCard>
    );
  }

  const deadline = signupDeadlineLabel(first.signup);
  const more = waiting.length - 1;

  return (
    <GCard
      index={1}
      title={`${pluralSignups(waiting.length)} ${waiting.length === 1 ? 'needs' : 'need'} your response`}
      testID="parent-signups-next-up">
      <GAccentStrip
        title={first.signup.title}
        subtitle={[SIGNUP_TYPE_LABELS[first.signup.signupType], signupFromLine(first.signup), deadline]
          .filter(Boolean)
          .join(' · ')}
        pillLabel={readOnly ? 'Preview' : 'Sign up'}
        onPress={() => onOpen(first.signup.id)}
      />
      {more > 0 ? (
        <GLink
          label={`${more} more waiting`}
          accessibilityLabel={`Show ${more} more signups that need your response`}
          onPress={() => model.setFilter('needs_response')}
          style={styles.moreLink}
        />
      ) : null}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Your upcoming help (tickets)                                        */
/* ------------------------------------------------------------------ */

function HelpTicket({ help, onPress }: { help: UpcomingHelp; onPress: () => void }) {
  return (
    <GPressable
      accessibilityLabel={`${help.title}, ${help.detail}. Open signup`}
      pressedScale={0.98}
      onPress={onPress}
      style={styles.ticket}>
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={[styles.notch, styles.notchRight]} />
      {help.date ? (
        <DateStamp date={help.date} />
      ) : (
        <View style={[styles.ticketIcon, { backgroundColor: Garden.mint }]}>
          <Ionicons name="heart-outline" size={20} color={Garden.forest} />
        </View>
      )}
      {/* The rule's dashes have a fixed intrinsic height; pin it so the row's content sets the height. */}
      <View style={styles.perforation}>
        <GDashedRule vertical color={Garden.ink25} style={StyleSheet.absoluteFill} />
      </View>
      <View style={styles.flex}>
        <Text style={gText.itemTitle} numberOfLines={2}>
          {help.title}
        </Text>
        <Text style={gText.meta} numberOfLines={2}>
          {help.detail}
        </Text>
      </View>
    </GPressable>
  );
}

export function UpcomingHelpCard({
  upcoming,
  onOpen,
}: {
  upcoming: UpcomingHelp[];
  onOpen: (signupId: string) => void;
}) {
  if (upcoming.length === 0) return null;
  return (
    <GCard
      index={2}
      title="You're helping with"
      testID="parent-signups-upcoming"
      bodyStyle={styles.ticketList}>
      {upcoming.map((help) => (
        <HelpTicket key={help.key} help={help} onPress={() => onOpen(help.signupId)} />
      ))}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* All signups                                                         */
/* ------------------------------------------------------------------ */

const EMPTY_COPY: Record<ParentClassroomSignupsFilter, string> = {
  all: 'No classroom signups right now.',
  needs_response: 'Nothing needs your response right now.',
  signed_up: "You haven't signed up for anything yet.",
  closed: 'No past signups yet.',
};

function SignupRow({
  item,
  first,
  readOnly,
  onPress,
}: {
  item: ParentClassroomSignupListItem;
  first: boolean;
  readOnly: boolean;
  onPress: () => void;
}) {
  const accent = useGardenAccent();
  const { signup, listStatus } = item;
  const type = SIGNUP_TYPE_ICON[signup.signupType];
  const deadline = listStatus === 'needs_response' ? signupDeadlineLabel(signup) : null;
  const chip = listStatusChip(listStatus);
  const action =
    listStatus === 'needs_response'
      ? readOnly
        ? 'Preview signup'
        : 'Sign up'
      : listStatus === 'signed_up'
        ? 'View signup'
        : 'View details';

  return (
    <GPressable
      accessibilityLabel={`${signup.title}. ${signupFromLine(signup)}. ${chip.label}${
        deadline ? `. ${deadline}` : ''
      }. ${action}`}
      pressedScale={0.99}
      onPress={onPress}
      style={[styles.row, !first && styles.rowRule]}>
      <View style={[styles.typeIcon, { backgroundColor: type.tint }]}>
        <Ionicons name={type.icon} size={18} color={Garden.ink} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={gText.itemTitle} numberOfLines={2}>
          {signup.title}
        </Text>
        <Text style={gText.meta} numberOfLines={1}>
          {signupFromLine(signup)}
        </Text>
        <View style={styles.rowChips}>
          <GChip label={SIGNUP_TYPE_LABELS[signup.signupType]} tone="neutral" />
          {deadline ? <GChip label={deadline} tone="warning" icon="time-outline" /> : null}
          {listStatus === 'signed_up' ? (
            <GChip label="Signed up" tone="success" icon="checkmark" />
          ) : null}
        </View>
        <View style={styles.rowAction}>
          <Text style={[styles.rowActionText, { color: accent.clayDeep }]}>{action}</Text>
          <Ionicons name="arrow-forward" size={13} color={accent.clayDeep} />
        </View>
      </View>
    </GPressable>
  );
}

function Group({
  group,
  showLabel,
  readOnly,
  onOpen,
}: {
  group: SignupGroup;
  showLabel: boolean;
  readOnly: boolean;
  onOpen: (signupId: string) => void;
}) {
  return (
    <View style={styles.group}>
      {showLabel ? (
        <Text style={styles.groupLabel} accessibilityRole="header">
          {group.label} · {group.items.length}
        </Text>
      ) : null}
      <View style={styles.notebook}>
        {group.items.map((item, index) => (
          <SignupRow
            key={item.signup.id}
            item={item}
            first={index === 0}
            readOnly={readOnly}
            onPress={() => onOpen(item.signup.id)}
          />
        ))}
      </View>
    </View>
  );
}

export function SignupsListCard({
  model,
  readOnly,
  onOpen,
}: {
  model: ParentClassroomSignupsModel;
  readOnly: boolean;
  onOpen: (signupId: string) => void;
}) {
  return (
    <GCard
      index={3}
      title="All signups"
      testID="parent-signups-list"
      bodyStyle={styles.listBody}>
      <GSegmented
        compact
        scrollable
        accessibilityLabel="Filter signups"
        items={SIGNUP_FILTERS.map((entry) => ({
          id: entry.key,
          label: entry.label,
          badge: entry.key === 'needs_response' ? model.counts.needs_response : undefined,
          testID: `parent-signups-filter-${entry.key}`,
        }))}
        activeId={model.filter}
        onChange={model.setFilter}
      />
      {model.groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[gText.meta, styles.emptyText]}>{EMPTY_COPY[model.filter]}</Text>
          {model.filter !== 'all' ? (
            <GLink label="Show all signups" onPress={() => model.setFilter('all')} />
          ) : null}
        </View>
      ) : (
        model.groups.map((group) => (
          <Group
            key={group.status}
            group={group}
            showLabel={model.filter === 'all'}
            readOnly={readOnly}
            onOpen={onOpen}
          />
        ))
      )}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* How signups work                                                    */
/* ------------------------------------------------------------------ */

const HOW_STEPS = [
  { id: 'pick', title: 'Pick a request', meta: "Open any signup from your child's teacher." },
  {
    id: 'choose',
    title: 'Choose how to help',
    meta: 'A time slot, a role, or a short note — whatever the teacher asked for.',
  },
  {
    id: 'confirm',
    title: 'Confirm',
    meta: 'You can update or withdraw any time while the signup is open.',
  },
] as const;

export function HowSignupsWorkCard({ waiting }: { waiting: number }) {
  const steps: GStep[] = HOW_STEPS.map((step, index) => ({
    id: step.id,
    title: step.title,
    meta: step.meta,
    state: waiting > 0 && index === 0 ? 'current' : 'todo',
  }));
  return (
    <GCard index={4} title="Three quick steps" testID="parent-signups-how">
      <GStepList steps={steps} accessibilityLabel="How signups work" />
    </GCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  hand: { marginTop: 10 },
  caughtUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Garden.mint,
    borderRadius: 16,
    padding: 14,
  },
  moreLink: { alignSelf: 'flex-start', marginTop: 12, minHeight: 32 },
  ticketList: { gap: 10 },
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Garden.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Garden.ink10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 76,
    overflow: 'hidden',
  },
  notch: {
    position: 'absolute',
    top: '50%',
    width: 18,
    height: 18,
    marginTop: -9,
    borderRadius: 9,
    backgroundColor: Garden.white,
  },
  notchLeft: { left: -9 },
  notchRight: { right: -9 },
  perforation: { width: 1.5, alignSelf: 'stretch', marginVertical: -4 },
  ticketIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listBody: { gap: 14 },
  group: { gap: 8 },
  groupLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  notebook: {
    backgroundColor: Garden.notebook,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', gap: 12, padding: 14, minHeight: 56 },
  rowRule: { borderTopWidth: 1, borderTopColor: 'rgba(46,74,60,0.1)' },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, minWidth: 0, gap: 3 },
  rowChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  rowAction: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  rowActionText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 18 },
  emptyText: { textAlign: 'center' },
});
