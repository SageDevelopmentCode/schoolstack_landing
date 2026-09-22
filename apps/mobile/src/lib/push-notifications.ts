import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  assertApiAuthenticated,
  getApiAuthHeaders,
} from '@/lib/auth/auth-session';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

const MESSAGES_CHANNEL_ID = 'messages';

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

async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(MESSAGES_CHANNEL_ID, {
    name: 'Messages',
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

  await ensureAndroidNotificationChannel();

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
  const response = await fetch(`${siteUrl}/api/account/expo-push/register`, {
    method: 'POST',
    headers: await getApiAuthHeaders(true),
    body: JSON.stringify({
      pushToken,
      platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : undefined,
    }),
  });

  await assertApiAuthenticated(response);
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

    const response = await fetch(`${siteUrl}/api/account/expo-push/register`, {
      method: 'DELETE',
      headers: await getApiAuthHeaders(true),
      body: JSON.stringify({ pushToken }),
    });

    await assertApiAuthenticated(response);
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

export type MessagePushNotificationData = {
  portal: 'parent' | 'teacher' | 'admin';
  organizationSlug: string;
  threadId: string;
};

export function parseMessagePushNotificationData(
  data: Record<string, unknown> | undefined,
): MessagePushNotificationData | null {
  if (!data) return null;

  const portal = data.portal;
  const organizationSlug = data.organizationSlug;
  const threadId = data.threadId;

  if (
    (portal !== 'parent' && portal !== 'teacher' && portal !== 'admin') ||
    typeof organizationSlug !== 'string' ||
    !organizationSlug.trim() ||
    typeof threadId !== 'string' ||
    !threadId.trim()
  ) {
    return null;
  }

  return {
    portal,
    organizationSlug: organizationSlug.trim(),
    threadId: threadId.trim(),
  };
}
