import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { fetchWithAuth } from '@/lib/auth/auth-session';

export type {
  AttendancePushNotificationData,
  BulletinPushNotificationData,
  CommitteePushNotificationData,
  CommitteePushSection,
  GalleryPushNotificationData,
  MessagePushNotificationData,
  PushNotificationData,
  PushPortal,
} from '@/lib/push-notification-payload';
export {
  parseCommitteePushNotificationData,
  parseMessagePushNotificationData,
  parsePushNotificationData,
} from '@/lib/push-notification-payload';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

const MESSAGES_CHANNEL_ID = 'messages';
const COMMITTEES_CHANNEL_ID = 'committees';
const BULLETIN_CHANNEL_ID = 'bulletin';
const GALLERY_CHANNEL_ID = 'gallery';
const ATTENDANCE_CHANNEL_ID = 'attendance';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function isPushSupportedEnvironment(): boolean {
  if (!Device.isDevice) return false;
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

function getEasProjectId(): string | null {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  return typeof projectId === 'string' && projectId.trim() ? projectId.trim() : null;
}

async function ensureAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(MESSAGES_CHANNEL_ID, {
    name: 'Messages',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });

  await Notifications.setNotificationChannelAsync(COMMITTEES_CHANNEL_ID, {
    name: 'Committees',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });

  await Notifications.setNotificationChannelAsync(BULLETIN_CHANNEL_ID, {
    name: 'Bulletin',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });

  await Notifications.setNotificationChannelAsync(GALLERY_CHANNEL_ID, {
    name: 'Photos',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });

  await Notifications.setNotificationChannelAsync(ATTENDANCE_CHANNEL_ID, {
    name: 'Attendance',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!isPushSupportedEnvironment()) {
    return null;
  }

  const projectId = getEasProjectId();
  if (!projectId) {
    return null;
  }

  await ensureAndroidNotificationChannels();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export async function saveExpoPushToken(pushToken: string): Promise<void> {
  const response = await fetchWithAuth(`${siteUrl}/api/account/expo-push/register`, {
    method: 'POST',
    body: JSON.stringify({
      pushToken,
      platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : undefined,
    }),
    includeJson: true,
    signOutOnFailure: false,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(typeof payload.error === 'string' ? payload.error : 'Failed to save push token.');
  }
}

export async function clearExpoPushToken(): Promise<void> {
  if (!isPushSupportedEnvironment()) {
    return;
  }

  try {
    const pushToken = await registerForPushNotificationsAsync();
    if (!pushToken) return;

    await fetchWithAuth(`${siteUrl}/api/account/expo-push/register`, {
      method: 'DELETE',
      body: JSON.stringify({ pushToken }),
      includeJson: true,
      signOutOnFailure: false,
    });
  } catch {
    // Best-effort cleanup during sign-out.
  }

  try {
    await Notifications.setBadgeCountAsync(0);
  } catch {
    // Badge reset is optional.
  }
}

export async function syncPushNotificationsForSession(): Promise<void> {
  const pushToken = await registerForPushNotificationsAsync();
  if (!pushToken) return;

  await saveExpoPushToken(pushToken);
}

