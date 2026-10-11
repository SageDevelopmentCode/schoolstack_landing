import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AccountPortalSwitcherPanel,
  useAccountPortalSwitcherVisibility,
} from '@/components/account-portal-switcher-panel';
import { EditableProfilePhoto } from '@/components/parent/children/editable-profile-photo';
import { ProgramSwitcherPanel, type ProgramSwitcherContext } from '@/components/program-switcher-panel';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useAuth } from '@/contexts/auth-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { usePortalProfilePhotoUpload } from '@/hooks/use-portal-profile-photo-upload';
import { portalTypeToAccountPortalId } from '@/lib/auth/school-portal-options-types';
import { StoryRadius, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type PortalAccountSheetProps = {
  visible: boolean;
  onClose: () => void;
  displayName: string;
  photoUrl?: string | null;
  organizationId: string | null | undefined;
  slug: string | null | undefined;
  onProfilePhotoUpdated?: (profilePhotoUrl: string) => void;
  programSwitcher?: {
    contexts: ProgramSwitcherContext[];
    activeContextId: string | null;
    loading?: boolean;
    onSelect: (context: ProgramSwitcherContext) => void;
  };
};

export function PortalAccountSheet({
  visible,
  onClose,
  displayName,
  photoUrl,
  organizationId,
  slug,
  onProfilePhotoUpdated,
  programSwitcher,
}: PortalAccountSheetProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();
  const { signOut, portalType } = useAuth();

  const { photoUrl: livePhotoUrl, uploading, editable, handlePhotoSelected } =
    usePortalProfilePhotoUpload({
      organizationId,
      initialPhotoUrl: photoUrl,
      portalType,
      onSuccess: onProfilePhotoUpdated,
    });

  const { showAccountPortalSection } = useAccountPortalSwitcherVisibility(
    organizationId,
    slug,
    visible,
  );

  const showProgramSection = Boolean(
    programSwitcher &&
      (programSwitcher.loading || programSwitcher.contexts.length >= 2),
  );

  const hasSwitcherContent = showAccountPortalSection || showProgramSection;

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  const currentPortalId = portalTypeToAccountPortalId(portalType);

  const subtitle = useMemo(() => {
    if (programSwitcher?.activeContextId) {
      const active = programSwitcher.contexts.find(
        (c) => c.id === programSwitcher.activeContextId,
      );
      if (active) {
        return active.label;
      }
    }
    return 'Account and portal settings';
  }, [programSwitcher]);

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel="Close account menu"
      backgroundColor={theme.paper}
      borderColor={theme.line}
      handleColor={theme.line}
      maxHeight="85%"
      bounces={false}
      bottomInset={insets.bottom + Spacing.four}
      sheetStyle={styles.sheet}
      scrollContentStyle={styles.content}>
      <View style={styles.profileHeader}>
        <EditableProfilePhoto
          name={displayName}
          photoUrl={livePhotoUrl}
          size={64}
          shape="circle"
          editable={editable}
          uploading={uploading}
          editTrigger="badge"
          onPhotoSelected={(uri, mimeType) => void handlePhotoSelected(uri, mimeType)}
        />
        <View style={styles.profileCopy}>
          <Text style={[styles.profileName, { color: theme.ink }]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[styles.profileMeta, { color: theme.muted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>

      {hasSwitcherContent ? (
        <View style={styles.sections}>
          {showProgramSection && programSwitcher ? (
            <ProgramSwitcherPanel
              contexts={programSwitcher.contexts}
              activeContextId={programSwitcher.activeContextId}
              loading={programSwitcher.loading}
              onSelect={(context) => {
                onClose();
                programSwitcher.onSelect(context);
              }}
            />
          ) : null}

          {showAccountPortalSection && organizationId && slug ? (
            <AccountPortalSwitcherPanel
              organizationId={organizationId}
              slug={slug}
              currentPortalId={currentPortalId}
              enabled={visible}
              onAfterSelect={onClose}
            />
          ) : null}
        </View>
      ) : null}

      <View style={styles.signOutRow}>
        <StoryTextLink
          label="Sign out"
          onPress={() => void handleSignOut()}
          accessibilityLabel="Sign out"
        />
      </View>
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: StoryRadius.card,
    borderTopRightRadius: StoryRadius.card,
    shadowColor: '#32483D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.one,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  profileName: {
    fontFamily: StoryFonts.display,
    fontSize: 20,
    lineHeight: 26,
  },
  profileMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  sections: {
    gap: Spacing.three,
  },
  signOutRow: {
    alignItems: 'center',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
});
