import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// keyboard: verified on device — committee event form uses ParentBottomSheet

import { GChoiceChips, GDateField, GInlineBanner, GTextField } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden } from '@/components/parent/garden/tokens';
import { DateStamp, GChip, GKicker, GOutlineButton, GToyButton, gText } from '@/components/parent/garden/ui';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '@/lib/parent/parent-committees-garden';
import type { CommitteeEvent, CommitteeEventType } from '@/lib/parent/parent-committees-types';

export type CommitteeEventFormState = {
  title: string;
  date: string;
  time: string;
  eventType: CommitteeEventType;
  location: string;
};

function longDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Read-only event details with Edit / Delete for whoever may manage it. */
export function EventDetailSheet({
  event,
  visible,
  canManage,
  onClose,
  onEdit,
  onDelete,
}: {
  event: CommitteeEvent | null;
  visible: boolean;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <GSheet
      visible={visible && event !== null}
      onClose={onClose}
      accessibilityLabel="Close event"
      kicker="Committee event"
      title={event?.title ?? ''}
      headerAside={event ? <GChip label={EVENT_TYPE_LABELS[event.type] ?? event.type} tone="info" /> : null}
      footer={
        event && canManage ? (
          <View style={styles.footer}>
            <GToyButton label="Edit event" icon="create-outline" onPress={onEdit} />
            <GOutlineButton label="Delete" icon="trash-outline" onPress={onDelete} />
          </View>
        ) : undefined
      }>
      {event ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <DateStamp date={event.date} size="md" />
            <View style={styles.flex}>
              <GKicker>Date</GKicker>
              <Text style={gText.itemTitle}>{longDate(event.date)}</Text>
              {event.time ? (
                <>
                  <GKicker style={styles.spaced}>Time</GKicker>
                  <Text style={gText.itemTitle}>{event.time}</Text>
                </>
              ) : null}
            </View>
          </View>
          {event.location ? (
            <View>
              <GKicker>Location</GKicker>
              <Text style={gText.body}>{event.location}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </GSheet>
  );
}

/** Add or edit an event (shared by both flows). */
export function EventFormSheet({
  visible,
  title,
  submitLabel,
  initialForm,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  title: string;
  submitLabel: string;
  initialForm: CommitteeEventFormState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (form: CommitteeEventFormState) => void;
}) {
  const [form, setForm] = useState(initialForm);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(initialForm);
      setShowErrors(false);
    }
  }, [initialForm, visible]);

  const submit = () => {
    if (!form.title.trim() || !form.date) {
      setShowErrors(true);
      return;
    }
    onSubmit(form);
  };

  return (
    <ParentBottomSheet visible={visible} onClose={onClose} title={title} subtitle="Committee calendar" accessibilityLabel="Close event form">
      <View style={styles.form}>
        <GTextField
          label="Title"
          value={form.title}
          onChangeText={(value) => setForm((current) => ({ ...current, title: value }))}
          placeholder="Event title"
          error={showErrors && !form.title.trim() ? 'Give the event a title.' : null}
        />
        <GDateField
          label="Date"
          value={form.date}
          onChange={(date) => setForm((current) => ({ ...current, date }))}
          helper={showErrors && !form.date ? 'Pick a date.' : undefined}
        />
        <GTextField
          label="Time"
          optional
          value={form.time}
          onChangeText={(value) => setForm((current) => ({ ...current, time: value }))}
          placeholder="3:30 PM"
        />
        <GChoiceChips
          label="Type"
          value={form.eventType}
          onChange={(eventType) => setForm((current) => ({ ...current, eventType }))}
          options={EVENT_TYPES.map((type) => ({ id: type, label: EVENT_TYPE_LABELS[type] }))}
        />
        <GTextField
          label="Location"
          optional
          value={form.location}
          onChangeText={(value) => setForm((current) => ({ ...current, location: value }))}
          placeholder="Room or address"
        />
        {error ? <GInlineBanner tone="error" title="Couldn't save the event" description={`${error} Your changes are still here.`} /> : null}
        <GToyButton label={submitLabel} icon="checkmark" size="md" fullWidth loading={saving} onPress={submit} />
      </View>
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  row: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  flex: { flex: 1, gap: 2 },
  spaced: { marginTop: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  form: { gap: 16 },
});
