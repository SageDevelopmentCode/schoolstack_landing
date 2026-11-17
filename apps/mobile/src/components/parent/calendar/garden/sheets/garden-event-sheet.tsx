import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useCalendarPortal } from '@/components/parent/calendar/garden/calendar-portal';
import { EventTypeChip } from '@/components/parent/calendar/garden/garden-event-row';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GIcon, GKicker, GLink, GOutlineButton, GPressable, GToyButton } from '@/components/parent/garden/ui';
import { haptic } from '@/lib/haptics';
import { formatLongEventDate } from '@/lib/parent/parent-calendar-agenda-utils';
import { formatEventTimeRange } from '@/lib/school-events/calendar-time';
import { buildEventDetailsText, buildEventMapsUrl } from '@/lib/school-events/event-share';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const COPIED_RESET_MS = 2200;
const DELETE_RED = '#9A3412';

type SheetNotice = { tone: 'success' | 'info' | 'error'; title: string; message?: string };

/**
 * Staff who manage the school calendar (teacher Calendar): Edit becomes the
 * sheet's one toy button, Share moves to outline, Copy and Delete become links.
 */
export type GardenEventSheetManage = {
  onEdit: (event: OrganizationEvent) => void;
  onDelete: (event: OrganizationEvent) => void;
  deleting: boolean;
  /** Status inside the sheet (a failed delete, read-only preview); toasts sit behind it. */
  notice: { tone: 'error' | 'info'; title: string; description?: string } | null;
};

function DetailRow({ icon, label, children }: { icon: keyof typeof Ionicons.glyphMap; label: string; children: ReactNode }) {
  return (
    <View style={styles.detailRow}>
      <GIcon name={icon} size="sm" />
      <View style={styles.detailCopy}>
        <GKicker>{label}</GKicker>
        {children}
      </View>
    </View>
  );
}

/**
 * Event details (Garden). Helpers: Open in Maps, Copy details, Share event.
 * Toasts render behind native-modal sheets, so every result shows *inside*
 * the sheet (chip + note); failures are also reported.
 */
export function GardenEventSheet({
  organizationId,
  event,
  today,
  onClose,
  manage,
}: {
  organizationId: string;
  event: OrganizationEvent | null;
  today: string;
  onClose: () => void;
  manage?: GardenEventSheetManage;
}) {
  const accent = useGardenAccent();
  const portal = useCalendarPortal();
  const tid = (suffix: string) => `${portal.testIdPrefix}-${suffix}`;
  const { reportError } = useMobileErrorReporter(organizationId);
  const { readOnly } = usePortalPreview();

  // Keep the last event while the sheet animates out.
  const [shown, setShown] = useState<OrganizationEvent | null>(event);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [notice, setNotice] = useState<SheetNotice | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!event) return;
    setShown(event);
    setCopied(false);
    setShared(false);
    setNotice(null);
  }, [event]);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const current = event ?? shown;

  const showReadOnly = useCallback(() => {
    haptic.warning();
    setNotice({
      tone: 'info',
      title: 'Read-only preview',
      message: portal.previewShareNotice,
    });
  }, [portal.previewShareNotice]);

  const copyDetails = useCallback(async () => {
    if (!current) return;
    if (readOnly) {
      showReadOnly();
      return;
    }
    try {
      await Clipboard.setStringAsync(buildEventDetailsText(current));
      haptic.success();
      setCopied(true);
      setNotice({
        tone: 'success',
        title: 'Event details copied',
        message: 'Paste them into a message, a note or your own calendar.',
      });
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch (err) {
      haptic.error();
      reportError(`${portal.operationPrefix}_copy_details`, err, { entityType: 'organization_event', entityId: current.id });
      setNotice({
        tone: 'error',
        title: 'Couldn’t copy the details',
        message: 'Try again, or use Share event instead.',
      });
    }
  }, [current, portal.operationPrefix, readOnly, reportError, showReadOnly]);

  const shareEvent = useCallback(async () => {
    if (!current) return;
    if (readOnly) {
      showReadOnly();
      return;
    }
    try {
      const result = await Share.share({
        title: current.title,
        message: buildEventDetailsText(current),
      });
      if (result.action === Share.sharedAction) {
        haptic.success();
        setShared(true);
        setNotice({ tone: 'success', title: 'Shared', message: `“${current.title}” is on its way.` });
      }
    } catch (err) {
      haptic.error();
      reportError(`${portal.operationPrefix}_share`, err, { entityType: 'organization_event', entityId: current.id });
      setNotice({
        tone: 'error',
        title: 'Couldn’t open sharing',
        message: 'Try again, or use Copy details instead.',
      });
    }
  }, [current, portal.operationPrefix, readOnly, reportError, showReadOnly]);

  const openMaps = useCallback(() => {
    if (!current?.location) return;
    void openExternalUrlSafely(buildEventMapsUrl(current.location, Platform.OS), reportError, {
      operation: `${portal.operationPrefix}_open_maps`,
      entityType: 'organization_event',
      entityId: current.id,
      errorTitle: 'Couldn’t open Maps',
      errorMessage: 'Copy the address from this event and search for it in your maps app.',
    });
  }, [current, portal.operationPrefix, reportError]);

  if (!current) return null;

  const isToday = current.date === today;
  const statusChip = shared ? (
    <GChip tone="success" icon="paper-plane" label="Shared" />
  ) : copied ? (
    <GChip tone="success" icon="checkmark" label="Copied" />
  ) : null;

  return (
    <GSheet
      visible={Boolean(event)}
      onClose={onClose}
      title={current.title}
      accessibilityLabel={`Close ${current.title}`}
      headerAside={statusChip}
      footer={
        <View style={styles.footer} testID={tid('event-sheet-actions')}>
          {manage ? (
            <>
              <GOutlineButton
                testID={tid('share')}
                label="Share"
                icon="share-outline"
                accessibilityHint="Opens your phone’s share sheet"
                onPress={() => void shareEvent()}
                style={styles.footerButton}
              />
              <GToyButton
                testID={tid('edit-event')}
                label="Edit event"
                icon="create-outline"
                accessibilityHint="Opens the event form"
                disabled={manage.deleting}
                onPress={() => manage.onEdit(current)}
                style={styles.footerButton}
              />
            </>
          ) : (
            <>
              <GOutlineButton
                testID={tid('copy-details')}
                label={copied ? 'Copied' : 'Copy details'}
                icon={copied ? 'checkmark' : 'copy-outline'}
                accessibilityHint="Copies the date, time, place and details"
                onPress={() => void copyDetails()}
                style={styles.footerButton}
              />
              <GToyButton
                testID={tid('share')}
                label="Share event"
                icon="share-outline"
                accessibilityHint="Opens your phone’s share sheet"
                onPress={() => void shareEvent()}
                style={styles.footerButton}
              />
            </>
          )}
        </View>
      }>
      <View testID={tid('event-sheet')} style={styles.body}>
        {manage?.notice ? (
          <GInlineBanner tone={manage.notice.tone} title={manage.notice.title} description={manage.notice.description} />
        ) : null}
        <View style={styles.chips}>
          <EventTypeChip event={current} />
          {isToday ? <GChip tone="warning" icon="sunny" label="Today" /> : null}
        </View>

        {notice ? (
          <Animated.View
            entering={FadeIn.duration(200)}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={[
              styles.notice,
              notice.tone === 'success'
                ? { backgroundColor: Garden.mint }
                : notice.tone === 'error'
                  ? { backgroundColor: Garden.peach }
                  : { backgroundColor: Garden.sky },
            ]}>
            <Ionicons
              name={
                notice.tone === 'success'
                  ? 'checkmark-circle'
                  : notice.tone === 'error'
                    ? 'alert-circle'
                    : 'information-circle'
              }
              size={18}
              color={Garden.ink}
            />
            <View style={styles.noticeCopy}>
              <Text style={styles.noticeTitle}>{notice.title}</Text>
              {notice.message ? <Text style={styles.noticeBody}>{notice.message}</Text> : null}
            </View>
          </Animated.View>
        ) : null}

        <View style={styles.card}>
          <DetailRow icon="calendar-outline" label="Date">
            <Text style={styles.detailValue}>{formatLongEventDate(current.date)}</Text>
          </DetailRow>
          <DetailRow icon="time-outline" label="Time">
            <Text style={styles.detailValue}>{formatEventTimeRange(current)}</Text>
          </DetailRow>
          {current.location ? (
            <DetailRow icon="location-outline" label="Location">
              <Text style={styles.detailValue} selectable>
                {current.location}
              </Text>
              <GLink
                testID={tid('open-maps')}
                label="Open in Maps"
                icon="navigate-outline"
                accessibilityHint="Opens your maps app"
                onPress={openMaps}
                style={styles.mapsLink}
              />
            </DetailRow>
          ) : null}
          {current.description ? (
            <DetailRow icon="document-text-outline" label="Details">
              <Text style={styles.description} selectable>
                {current.description}
              </Text>
            </DetailRow>
          ) : null}
        </View>

        <View style={[styles.tip, { backgroundColor: accent.wash }]}>
          <Ionicons name="bulb-outline" size={16} color={accent.clayDeep} />
          <Text style={[styles.tipText, { color: accent.clayDeep }]}>
            <Text style={styles.tipStrong}>Tip: </Text>
            {portal.shareTip}
          </Text>
        </View>

        {manage ? (
          <View style={styles.manageRow}>
            <GLink
              testID={tid('copy-details')}
              label={copied ? 'Copied' : 'Copy details'}
              icon={copied ? 'checkmark' : 'copy-outline'}
              accessibilityHint="Copies the date, time, place and details"
              onPress={() => void copyDetails()}
            />
            <GPressable
              testID={tid('delete-event')}
              accessibilityRole="button"
              accessibilityLabel={manage.deleting ? 'Deleting event' : 'Delete event'}
              accessibilityState={{ busy: manage.deleting, disabled: manage.deleting }}
              disabled={manage.deleting}
              haptic="none"
              hitSlop={10}
              onPress={() => manage.onDelete(current)}
              style={styles.deleteLink}>
              <Ionicons name="trash-outline" size={16} color={DELETE_RED} />
              <Text style={styles.deleteText}>{manage.deleting ? 'Deleting…' : 'Delete event'}</Text>
            </GPressable>
          </View>
        ) : null}
      </View>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 14,
    paddingBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeCopy: {
    flex: 1,
    gap: 2,
  },
  noticeTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
  noticeBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.ink65,
  },
  card: {
    gap: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
    paddingTop: 1,
  },
  detailValue: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 15,
    lineHeight: 21,
    color: Garden.ink,
  },
  description: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 15,
    lineHeight: 23,
    color: Garden.ink65,
  },
  mapsLink: {
    marginTop: 4,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tipText: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
  },
  tipStrong: {
    fontFamily: GardenFonts.bodyExtra,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerButton: {
    flexShrink: 1,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 2,
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
  },
  deleteText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: DELETE_RED,
  },
});
