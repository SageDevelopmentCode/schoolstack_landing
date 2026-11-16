import { Ionicons } from '@expo/vector-icons';
import { useCallback, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip, GOutlineButton, GToyButton } from '@/components/parent/garden/ui';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useBottomSheetKeyboardScrollStyle } from '@/hooks/use-bottom-sheet-keyboard-scroll-style';
import { haptic } from '@/lib/haptics';
import { requestCloseIfClean } from '@/lib/unsaved-changes';

/** Status shown inside a sheet (toasts render behind native modals). */
export type AdminSheetNotice = {
  tone: 'error' | 'info' | 'success' | 'warning';
  title: string;
  description?: string | null;
};

export const READ_ONLY_NOTICE: AdminSheetNotice = {
  tone: 'info',
  title: 'Read-only preview',
  description: 'Actions are turned off while previewing.',
};

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** Garden sheet header: Bricolage title, muted subtitle, optional chip, 44pt close. */
export function AdminSheetHeader({
  title,
  subtitle,
  aside,
  onClose,
  closeAccessibilityLabel = 'Close',
}: {
  title: string;
  subtitle?: string | null;
  aside?: ReactNode;
  onClose: () => void;
  closeAccessibilityLabel?: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.headerRight}>
        {aside}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeAccessibilityLabel}
          hitSlop={6}
          onPress={() => {
            haptic.tap();
            onClose();
          }}
          style={({ pressed }) => [styles.close, pressed && styles.closePressed]}>
          <Ionicons name="close" size={20} color={Garden.ink} />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Garden form sheet on the approved keyboard path (`BottomSheetShell
 * keyboardAvoiding` + `useBottomSheetKeyboardScrollStyle`). Footer = live
 * status line + Cancel + one toy Save; it hides while the keyboard is open
 * so lower fields stay visible. Close asks first when there is unsaved work.
 */
export function AdminFormSheet({
  visible,
  onClose,
  title,
  subtitle,
  headerAside,
  isDirty,
  saving = false,
  canSave,
  saveLabel = 'Save',
  savingLabel = 'Saving…',
  saveIcon = 'checkmark',
  onSave,
  statusLine,
  notice,
  secondaryAction,
  maxHeight = '92%',
  accessibilityLabel,
  closeAccessibilityLabel,
  testID,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | null;
  headerAside?: ReactNode;
  isDirty: boolean;
  saving?: boolean;
  canSave: boolean;
  saveLabel?: string;
  savingLabel?: string;
  saveIcon?: keyof typeof Ionicons.glyphMap;
  onSave: () => void;
  /** e.g. "Fill in all four fields" / "Ready to add". */
  statusLine?: string | null;
  notice?: AdminSheetNotice | null;
  /** Left side of the footer (e.g. a Delete link). */
  secondaryAction?: ReactNode;
  maxHeight?: `${number}%`;
  accessibilityLabel?: string;
  closeAccessibilityLabel?: string;
  testID?: string;
  children: ReactNode;
}) {
  const { keyboardOpen, scrollContentStyle } = useBottomSheetKeyboardScrollStyle(styles.content);

  const requestClose = useCallback(() => {
    if (saving) return;
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose, saving]);

  return (
    <BottomSheetShell
      visible={visible}
      onClose={requestClose}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={accessibilityLabel ?? `Close ${title}`}
      backgroundColor={Garden.cream}
      borderColor={Garden.ink12}
      handleColor={Garden.ink25}
      maxHeight={maxHeight}
      enableDragToDismiss={!isDirty && !saving}
      scrollContentStyle={scrollContentStyle}
      header={
        <View style={styles.headerPad} testID={testID}>
          <AdminSheetHeader
            title={title}
            subtitle={subtitle}
            aside={headerAside ?? (isDirty && !saving ? <GChip label="Not saved yet" tone="warning" /> : null)}
            onClose={requestClose}
            closeAccessibilityLabel={closeAccessibilityLabel}
          />
        </View>
      }
      footer={
        keyboardOpen ? null : (
          <View style={styles.footer}>
            {statusLine ? (
              <Text style={styles.footerStatus} accessibilityLiveRegion="polite">
                {statusLine}
              </Text>
            ) : null}
            <View style={styles.footerButtons}>
              {secondaryAction ? <View style={styles.secondary}>{secondaryAction}</View> : null}
              <GOutlineButton label="Cancel" onPress={requestClose} />
              <GToyButton
                label={saving ? savingLabel : saveLabel}
                icon={saveIcon}
                loading={saving}
                disabled={!canSave || saving}
                onPress={onSave}
              />
            </View>
          </View>
        )
      }>
      {notice ? <GInlineBanner tone={notice.tone} title={notice.title} description={notice.description} /> : null}
      {children}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  headerPad: { paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
  },
  headerCopy: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontFamily: GardenFonts.display, fontSize: 24, lineHeight: 27, letterSpacing: -0.6, color: Garden.ink },
  subtitle: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: { transform: [{ scale: 0.95 }] },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20, gap: 16 },
  footer: {
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1.5,
    borderTopColor: Garden.ink10,
  },
  footerStatus: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
  footerButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  secondary: { marginRight: 'auto' },
});
