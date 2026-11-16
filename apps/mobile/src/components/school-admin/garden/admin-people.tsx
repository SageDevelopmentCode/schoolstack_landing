import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { initialsFromName } from '@/lib/messages/format';

const AVATAR_PALETTE = [
  { bg: '#E2EEE3', fg: '#35624D' },
  { bg: '#E3EDF2', fg: '#456D7A' },
  { bg: '#F3E2E8', fg: '#9C5B73' },
  { bg: '#F3EAD7', fg: '#896D30' },
  { bg: '#E7DDF0', fg: '#604A72' },
];

function avatarColors(name: string) {
  const source = name.trim() || '?';
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash + source.charCodeAt(index) * (index + 1)) % AVATAR_PALETTE.length;
  }
  return AVATAR_PALETTE[hash];
}

const AVATAR_SIZES = { sm: 36, row: 44, lg: 56 } as const;

/** Pastel initials avatar (same colour hash as the Story `StaffAvatar`). */
export function AdminInitialsAvatar({ name, size = 'row' }: { name: string; size?: keyof typeof AVATAR_SIZES }) {
  const box = AVATAR_SIZES[size];
  const colors = avatarColors(name);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.avatar, { width: box, height: box, borderRadius: box / 2, backgroundColor: colors.bg }]}>
      <Text style={[styles.initials, { color: colors.fg, fontSize: Math.round(box * 0.32) }]}>
        {initialsFromName(name).slice(0, 2)}
      </Text>
    </View>
  );
}

/**
 * Copy-link row (dashboard recipe): the URL on paper with a Copy pill. While
 * `copied` it switches to "Link copied" with a check on a mint wash.
 */
export function AdminCopyLinkRow({
  url,
  copied,
  pending = false,
  onCopy,
  label = 'Copy link',
}: {
  url: string;
  copied: boolean;
  pending?: boolean;
  onCopy: () => void;
  label?: string;
}) {
  const accent = useGardenAccent();
  return (
    <GPressable
      accessibilityLabel={copied ? `Link copied. ${url}` : `${label}. ${url}`}
      accessibilityState={{ busy: pending }}
      haptic="select"
      pressedScale={0.985}
      onPress={onCopy}
      style={[styles.copyRow, copied ? styles.copyRowDone : null]}>
      <Ionicons name={copied ? 'checkmark-circle' : 'link-outline'} size={18} color={copied ? Garden.forest : Garden.ink65} />
      <Text style={styles.copyUrl} numberOfLines={1} selectable>
        {url}
      </Text>
      {pending ? (
        <ActivityIndicator size="small" color={accent.clayDeep} />
      ) : (
        <View style={[styles.copyPill, copied ? styles.copyPillDone : { borderColor: Garden.ink25 }]}>
          <Text style={[styles.copyPillLabel, copied && { color: Garden.forest }]}>{copied ? 'Link copied' : 'Copy'}</Text>
        </View>
      )}
    </GPressable>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: GardenFonts.bodyExtra },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.paper,
  },
  copyRowDone: { backgroundColor: Garden.mint, borderColor: Garden.forest },
  copyUrl: { flex: 1, fontFamily: GardenFonts.bodySemi, fontSize: 13.5, color: Garden.ink },
  copyPill: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
    backgroundColor: Garden.white,
  },
  copyPillDone: { borderColor: 'transparent', backgroundColor: Garden.white },
  copyPillLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.ink },
});
