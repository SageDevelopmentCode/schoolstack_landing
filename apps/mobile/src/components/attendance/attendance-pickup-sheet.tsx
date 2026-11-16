import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AttendanceSave } from '@/components/attendance/use-attendance-save';
import { closeThen } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, PANEL_TINTS, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GPressable, GSkeleton, GToyButton } from '@/components/parent/garden/ui';
import { useAttendance } from '@/contexts/attendance-context';
import type {
  AttendancePickupContact,
  AttendancePickupSelection,
  AttendanceRosterStudent,
} from '@/lib/attendance/attendance-types';
import { formatEnrolledStudentName } from '@/lib/teacher/teacher-home-utils';

type AttendancePickupSheetProps = {
  visible: boolean;
  student: AttendanceRosterStudent | null;
  onClose: () => void;
  save: AttendanceSave['save'];
  announce: AttendanceSave['announce'];
};

function contactName(contact: AttendancePickupContact): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}

function contactSecondaryLine(contact: AttendancePickupContact): string | null {
  if (contact.source === 'guardian') {
    return contact.email?.trim() || null;
  }
  const parts = [contact.relationship?.trim(), contact.phone?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function selectionKey(selection: AttendancePickupSelection): string {
  return `${selection.source}:${selection.contactId}`;
}

function initialsOf(contact: AttendancePickupContact) {
  return `${contact.firstName[0] ?? ''}${contact.lastName[0] ?? ''}`.toUpperCase();
}

/** Record pickup: choose who picked the student up, then one toy "Confirm pickup". */
export function AttendancePickupSheet({ visible, student, onClose, save, announce }: AttendancePickupSheetProps) {
  const accent = useGardenAccent();
  const { organizationId, api, savingStudentId } = useAttendance();
  const [contacts, setContacts] = useState<AttendancePickupContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AttendancePickupSelection | null>(null);
  const studentId = student?.id ?? null;
  const familyId = student?.familyId ?? null;

  useEffect(() => {
    if (!visible || !studentId || !familyId) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      setSaveError(null);
      setSelected(null);
    });

    void api
      .fetchPickupContacts(organizationId, familyId, studentId)
      .then((response) => {
        if (!cancelled) setContacts(response.contacts);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load pickup contacts.');
          setContacts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api, familyId, organizationId, studentId, visible]);

  if (!student) return null;

  const saving = savingStudentId === student.id;
  const studentName = formatEnrolledStudentName(student);
  const selectedContact = selected
    ? contacts.find((contact) => selectionKey({ source: contact.source, contactId: contact.id }) === selectionKey(selected))
    : null;

  const handleConfirm = async () => {
    if (!selected) return;
    setSaveError(null);
    const pickupName = selectedContact ? contactName(selectedContact) : null;
    const ok = await save(student, 'pickup', { selection: selected, pickupName, silent: true });
    if (ok) {
      closeThen(onClose, () => announce(student, 'pickup', pickupName));
    } else {
      setSaveError("The pickup wasn't recorded. Check your connection, then try again.");
    }
  };

  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title="Record pickup"
      subtitle={`Who picked up ${studentName}?`}
      accessibilityLabel="Record pickup"
      footer={
        !loading && contacts.length > 0 ? (
          <View style={styles.footer}>
            <Text style={styles.footerStatus} numberOfLines={1}>
              {selectedContact ? `Picked up by ${contactName(selectedContact)}` : 'Choose a contact'}
            </Text>
            <GToyButton
              label="Confirm pickup"
              icon="checkmark"
              loading={saving}
              disabled={!selected || saving}
              onPress={() => void handleConfirm()}
            />
          </View>
        ) : undefined
      }>
      {saveError ? <GInlineBanner tone="error" title="Couldn't record pickup" description={saveError} /> : null}

      {loading ? (
        <View style={styles.list}>
          {Array.from({ length: 3 }, (_, index) => (
            <GSkeleton key={index} style={styles.skeleton} />
          ))}
        </View>
      ) : error ? (
        <GInlineBanner tone="error" title="Pickup contacts didn't load" description={error} />
      ) : contacts.length === 0 ? (
        <GInlineBanner tone="info" title="No pickup contacts are available for this family." />
      ) : (
        <View style={styles.list} accessibilityRole="radiogroup">
          {contacts.map((contact, index) => {
            const selection: AttendancePickupSelection = { source: contact.source, contactId: contact.id };
            const key = selectionKey(selection);
            const isSelected = selected != null && selectionKey(selected) === key;
            const secondary = contactSecondaryLine(contact);
            const name = contactName(contact);

            return (
              <GPressable
                key={key}
                accessibilityRole="radio"
                accessibilityLabel={`${name}${secondary ? `, ${secondary}` : ''}`}
                accessibilityState={{ selected: isSelected }}
                haptic="select"
                pressedScale={0.98}
                onPress={() => setSelected(selection)}
                style={[
                  styles.contact,
                  isSelected
                    ? { borderColor: accent.clay, backgroundColor: accent.wash }
                    : { borderColor: Garden.ink12, backgroundColor: Garden.white },
                ]}>
                <View style={[styles.avatar, { backgroundColor: PANEL_TINTS[index % PANEL_TINTS.length] }]}>
                  <Text style={styles.avatarText}>{initialsOf(contact)}</Text>
                </View>
                <View style={styles.contactCopy}>
                  <Text style={styles.contactName}>{name}</Text>
                  {secondary ? <Text style={styles.contactMeta}>{secondary}</Text> : null}
                  <GChip
                    label={contact.source === 'guardian' ? 'Guardian' : 'Authorized pickup'}
                    tone={contact.source === 'guardian' ? 'info' : 'neutral'}
                    style={styles.contactChip}
                  />
                </View>
                <View
                  style={[
                    styles.radio,
                    isSelected ? { borderColor: accent.clay, backgroundColor: accent.clay } : null,
                  ]}>
                  {isSelected ? <Ionicons name="checkmark" size={14} color={Garden.white} /> : null}
                </View>
              </GPressable>
            );
          })}
        </View>
      )}
    </GSheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingBottom: 12 },
  skeleton: { height: 72, borderRadius: 18 },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 2,
    padding: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  contactCopy: { flex: 1, gap: 2 },
  contactName: { fontFamily: GardenFonts.bodyExtra, fontSize: 15.5, color: Garden.ink },
  contactMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  contactChip: { alignSelf: 'flex-start', marginTop: 4 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Garden.ink25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 4 },
  footerStatus: { flex: 1, fontFamily: GardenFonts.bodyBold, fontSize: 13.5, color: Garden.soft },
});
