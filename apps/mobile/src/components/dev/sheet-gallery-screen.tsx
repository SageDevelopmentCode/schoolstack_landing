import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MessageDeleteConfirmSheet } from '@/components/messages/message-delete-confirm-sheet';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { AdminMessagesComposeMenuSheet } from '@/components/school-admin/messages/admin-messages-compose-menu-sheet';
import { NewConversationSheet } from '@/components/school-admin/messages/new-conversation-sheet';
import { StudentTeacherAssignPicker } from '@/components/school-admin/student-teacher-assign-picker';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryTextField } from '@/components/story/story-text-field';
import { APP_FONTS } from '@/constants/app-fonts';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { SchoolAdminThemeProvider } from '@/contexts/admin-theme-context';
import { ParentThemeProvider } from '@/contexts/parent-theme-context';
import type { MessageContact } from '@/lib/messages/types';
import { DEFAULT_BRANDING } from '@/lib/organization-settings/merge-branding';
import type { OrgStaffMemberRecord } from '@/lib/school-admin/enrolled-students';

/**
 * One case per BottomSheetShell prop combination that ships in the app. Keep in
 * sync with `.maestro/sheet-gallery.yaml` and the committed visual baselines.
 */
export const SHEET_GALLERY_CASES = [
  'new-conversation-admin',
  'new-conversation-parent',
  'compose-menu',
  'story-form',
  'parent-form',
  'delete-confirm',
  'teacher-assign',
] as const;

export type SheetGalleryCase = (typeof SHEET_GALLERY_CASES)[number];

export function isSheetGalleryCase(value: unknown): value is SheetGalleryCase {
  return typeof value === 'string' && (SHEET_GALLERY_CASES as readonly string[]).includes(value);
}

const FIXTURE_CONTACTS: MessageContact[] = [
  { key: 'g-ada', kind: 'guardian', name: 'Ada Lovelace', subtitle: 'Parent of Byron (K)', color: '#3E5C4A' },
  { key: 'g-grace', kind: 'guardian', name: 'Grace Hopper', subtitle: 'Parent of Ivy (2nd)', color: '#7A5C8E' },
  { key: 'g-katherine', kind: 'guardian', name: 'Katherine Johnson', subtitle: 'Parent of Joy (4th)', color: '#B5643C' },
  { key: 's-maria', kind: 'staff_member', name: 'Maria Montessori', subtitle: 'Lead teacher', color: '#2F6F8F' },
  { key: 's-john', kind: 'staff_member', name: 'John Dewey', subtitle: 'Assistant teacher', color: '#5C6B3E' },
];

const FIXTURE_STAFF: OrgStaffMemberRecord[] = [
  { id: 'staff-maria', firstName: 'Maria', lastName: 'Montessori', employmentStatus: 'active' },
  { id: 'staff-john', firstName: 'John', lastName: 'Dewey', employmentStatus: 'active' },
  { id: 'staff-friedrich', firstName: 'Friedrich', lastName: 'Froebel', employmentStatus: 'active' },
];

const noopAsync = async () => {};

type SheetGalleryScreenProps = {
  initialCase: SheetGalleryCase | null;
};

export function SheetGalleryScreen({ initialCase }: SheetGalleryScreenProps) {
  const [fontsReady, setFontsReady] = useState(false);
  const [activeCase, setActiveCase] = useState<SheetGalleryCase | null>(initialCase);

  useEffect(() => {
    let cancelled = false;
    Font.loadAsync(APP_FONTS)
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setFontsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => setActiveCase(null);
  const isOpen = (id: SheetGalleryCase) => fontsReady && activeCase === id;

  return (
    <ParentThemeProvider branding={DEFAULT_BRANDING}>
      <SchoolAdminThemeProvider branding={DEFAULT_BRANDING}>
        <SafeAreaView style={styles.screen} testID={fontsReady ? 'sheet-gallery-ready' : undefined}>
          <Text style={styles.title}>Sheet gallery</Text>
          <View style={styles.list}>
            {SHEET_GALLERY_CASES.map((id) => (
              <Pressable
                key={id}
                accessibilityRole="button"
                testID={`sheet-gallery-open-${id}`}
                onPress={() => setActiveCase(id)}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                <Text style={styles.rowLabel}>{id}</Text>
              </Pressable>
            ))}
          </View>

          <NewConversationSheet
            visible={isOpen('new-conversation-admin')}
            contacts={FIXTURE_CONTACTS}
            variant="admin-story"
            onClose={close}
            onSelect={close}
          />
          <NewConversationSheet
            visible={isOpen('new-conversation-parent')}
            contacts={FIXTURE_CONTACTS}
            variant="parent-story"
            onClose={close}
            onSelect={close}
          />
          <AdminMessagesComposeMenuSheet
            visible={isOpen('compose-menu')}
            onClose={close}
            onNewConversation={close}
            onBulkMessage={close}
          />
          <StoryBottomSheet visible={isOpen('story-form')} onClose={close}>
            <Text style={styles.sheetTitle}>Edit event</Text>
            <StoryTextField label="Title" defaultValue="Spring picnic" testID="sheet-gallery-story-title" />
            <StoryTextField label="Location" defaultValue="Meadow pavilion" />
            <StoryTextField
              label="Notes"
              multiline
              placeholder="Anything families should know"
              testID="sheet-gallery-story-notes"
            />
          </StoryBottomSheet>
          <ParentBottomSheet
            visible={isOpen('parent-form')}
            onClose={close}
            title="Pickup contact"
            subtitle="Who else can pick up your child?">
            <StoryTextField label="Full name" defaultValue="Ada Lovelace" testID="sheet-gallery-parent-name" />
            <StoryTextField label="Phone" defaultValue="(555) 010-2030" keyboardType="phone-pad" />
            <StoryTextField
              label="Notes"
              multiline
              placeholder="Relationship, schedule, etc."
              testID="sheet-gallery-parent-notes"
            />
          </ParentBottomSheet>
          <MessageDeleteConfirmSheet
            visible={isOpen('delete-confirm')}
            onClose={close}
            onConfirm={close}
          />
          <StudentTeacherAssignPicker
            visible={isOpen('teacher-assign')}
            studentName="Byron Lovelace"
            assignedTeacherIds={['staff-maria']}
            activeStaff={FIXTURE_STAFF}
            onClose={close}
            onSave={noopAsync}
          />
        </SafeAreaView>
      </SchoolAdminThemeProvider>
    </ParentThemeProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 20,
    lineHeight: 28,
    color: Story.ink,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
  },
  list: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.two,
  },
  row: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Story.line,
    backgroundColor: Story.white,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    color: Story.ink,
  },
  sheetTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: Story.ink,
  },
});
