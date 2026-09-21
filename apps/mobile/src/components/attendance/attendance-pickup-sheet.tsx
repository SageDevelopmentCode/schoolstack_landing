import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AttendanceConfirmButtonSkeleton,
  AttendanceContactRowSkeleton,
} from '@/components/attendance/attendance-skeleton-blocks';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { useAttendance } from '@/contexts/attendance-context';
import type {
  AttendancePickupContact,
  AttendancePickupSelection,
  AttendanceRosterStudent,
} from '@/lib/attendance/attendance-types';
import { formatEnrolledStudentName } from '@/lib/teacher/teacher-home-utils';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type AttendancePickupSheetProps = {
  visible: boolean;
  student: AttendanceRosterStudent | null;
  onClose: () => void;
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

export function AttendancePickupSheet({ visible, student, onClose }: AttendancePickupSheetProps) {
  const theme = useParentTheme();
  const { organizationId, api, savingStudentId, saveAction } = useAttendance();
  const [contacts, setContacts] = useState<AttendancePickupContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSelection, setSelectedSelection] = useState<AttendancePickupSelection | null>(null);

  useEffect(() => {
    if (!visible || !student) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelectedSelection(null);

    void api
      .fetchPickupContacts(organizationId, student.familyId, student.id)
      .then((response) => {
        if (!cancelled) {
          setContacts(response.contacts);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load pickup contacts.');
          setContacts([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [api, organizationId, student, visible]);

  if (!student) return null;

  const saving = savingStudentId === student.id;
  const studentName = formatEnrolledStudentName(student);

  const handleConfirm = async () => {
    if (!selectedSelection) return;
    const success = await saveAction(student, 'pickup', selectedSelection);
    if (success) {
      onClose();
    }
  };

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Record pickup">
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.ink }]}>Record pickup</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Who picked up {studentName}?
        </Text>

        {loading ? (
          <View style={styles.list}>
            {Array.from({ length: 3 }, (_, index) => (
              <AttendanceContactRowSkeleton key={index} />
            ))}
            <AttendanceConfirmButtonSkeleton />
          </View>
        ) : error ? (
          <Text style={[styles.error, { color: theme.alert }]}>{error}</Text>
        ) : contacts.length === 0 ? (
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            No pickup contacts are available for this family.
          </Text>
        ) : (
          <View style={styles.list}>
            {contacts.map((contact) => {
              const selection: AttendancePickupSelection = {
                source: contact.source,
                contactId: contact.id,
              };
              const key = selectionKey(selection);
              const selected =
                selectedSelection != null && selectionKey(selectedSelection) === key;
              const secondary = contactSecondaryLine(contact);

              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  onPress={() => setSelectedSelection(selection)}
                  style={[
                    styles.contactRow,
                    {
                      borderColor: selected ? theme.primary : Story.line,
                      backgroundColor: selected ? theme.successBg : Story.white,
                    },
                  ]}>
                  <Text style={[styles.contactName, { color: theme.ink }]}>{contactName(contact)}</Text>
                  {secondary ? (
                    <Text style={[styles.contactMeta, { color: theme.muted }]}>{secondary}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}

        {!loading ? (
          <StoryButton
            label="Confirm pickup"
            variant="primary"
            disabled={!selectedSelection || saving}
            accessibilityState={{ disabled: !selectedSelection || saving }}
            onPress={() => void handleConfirm()}
          />
        ) : null}
      </View>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.four,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
  list: {
    gap: Spacing.two,
  },
  contactRow: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 4,
  },
  contactName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '700',
  },
  contactMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
});
