import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GKicker } from '@/components/parent/garden/ui';
import { haptic } from '@/lib/haptics';

export type GSheetProps = {
  visible: boolean;
  onClose: () => void;
  kicker?: string;
  title: string;
  subtitle?: string;
  /** Right side of the header, e.g. a status `GChip`. */
  headerAside?: ReactNode;
  /**
   * `true` when the child is its own virtualized list (FlatList / SectionList).
   * The shell then skips its ScrollView and the child MUST use `style={{ flex: 1 }}`:
   * with `flexGrow: 0` a list inside this layout renders 0pt tall (blank sheet).
   */
  list?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  accessibilityLabel?: string;
  /** Space below the content. Defaults to the shell's safe-area inset. */
  bottomInset?: number;
};

/** Garden bottom sheet: cream surface, kicker + Bricolage title, 44pt close button. */
export function GSheet({
  visible,
  onClose,
  kicker,
  title,
  subtitle,
  headerAside,
  list = false,
  footer,
  children,
  accessibilityLabel,
  bottomInset,
}: GSheetProps) {
  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel={accessibilityLabel ?? `Close ${title}`}
      backgroundColor={Garden.cream}
      borderColor={Garden.ink12}
      handleColor={Garden.ink25}
      maxHeight="88%"
      bottomInset={bottomInset}
      scrollable={!list}
      scrollContentStyle={list ? styles.listBody : styles.scrollBody}
      header={
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            {kicker ? <GKicker>{kicker}</GKicker> : null}
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <View style={styles.headerRight}>
            {headerAside}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
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
      }
      footer={footer ? <View style={styles.footer}>{footer}</View> : undefined}>
      {children}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontFamily: GardenFonts.display,
    fontSize: 24,
    lineHeight: 27,
    letterSpacing: -0.6,
    color: Garden.ink,
  },
  subtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
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
  closePressed: {
    transform: [{ scale: 0.95 }],
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  listBody: {
    paddingBottom: 0,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: Garden.ink10,
  },
});
