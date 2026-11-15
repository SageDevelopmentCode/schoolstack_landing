import { StyleSheet, Text, View } from 'react-native';

import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import type { ParentInboxTab } from '@/lib/messages/parent-inbox-filters';

type Option = {
  id: ParentInboxTab;
  title: string;
  meta: string;
  testID: string;
};

/** "Show" sheet behind the inbox filter button: All conversations / Unread only. */
export function GardenInboxFilterSheet({
  visible,
  activeTab,
  totalCount,
  unreadCount,
  onClose,
  onSelect,
}: {
  visible: boolean;
  activeTab: ParentInboxTab;
  totalCount: number;
  unreadCount: number;
  onClose: () => void;
  onSelect: (tab: ParentInboxTab) => void;
}) {
  const accent = useGardenAccent();
  const options: Option[] = [
    {
      id: 'all',
      title: 'All conversations',
      meta: `${totalCount} ${totalCount === 1 ? 'conversation' : 'conversations'}`,
      testID: 'parent-messages-filter-all',
    },
    {
      id: 'unread',
      title: 'Unread only',
      meta:
        unreadCount > 0
          ? `${unreadCount} unread ${unreadCount === 1 ? 'conversation' : 'conversations'}`
          : 'Nothing unread',
      testID: 'parent-messages-filter-unread',
    },
  ];

  return (
    <GSheet visible={visible} onClose={onClose} kicker="Messages" title="Show">
      <View accessibilityRole="radiogroup" style={styles.list}>
        {options.map((option) => {
          const checked = option.id === activeTab;
          return (
            <GPressable
              key={option.id}
              testID={option.testID}
              accessibilityRole="radio"
              accessibilityState={{ checked }}
              accessibilityLabel={`${option.title}, ${option.meta}`}
              haptic="select"
              onPress={() => onSelect(option.id)}
              style={[
                styles.row,
                checked ? { borderColor: accent.clay, backgroundColor: accent.wash } : null,
              ]}>
              <View
                style={[styles.radio, checked ? { borderColor: accent.clay } : null]}>
                {checked ? <View style={[styles.radioDot, { backgroundColor: accent.clay }]} /> : null}
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{option.title}</Text>
                <Text style={[styles.meta, checked ? { color: accent.clayDeep } : null]}>
                  {option.meta}
                </Text>
              </View>
            </GPressable>
          );
        })}
      </View>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Garden.ink60,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    lineHeight: 21,
    color: Garden.ink,
  },
  meta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
});
